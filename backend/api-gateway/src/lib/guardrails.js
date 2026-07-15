const { supabase } = require('./db');

// ─── PII detection patterns ───────────────────────────────────────────────────
const PII = [
  { name: 'SSN',         re: /\b\d{3}-?\d{2}-?\d{4}\b/ },
  { name: 'CreditCard',  re: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/ },
  { name: 'BankAccount', re: /\baccount\s*#?\s*\d{8,17}\b/i },
  { name: 'Routing',     re: /\brouting\s*#?\s*\d{9}\b/i },
];

// ─── Prompt injection patterns ────────────────────────────────────────────────
const INJECTIONS = [
  /ignore\s+(previous|all\s+(prior|above))\s+instructions?/i,
  /you\s+are\s+now\s+(a|an)\s+/i,
  /forget\s+everything/i,
  /\bsystem\s*:\s*\[/i,
  /<\|im_(start|end)\|>/i,
  /\[INST\]|\[\/INST\]/,
  /###\s*Instruction/i,
  /act\s+as\s+(?:a\s+)?DAN/i,
];

// ─── Route-level input schemas ────────────────────────────────────────────────
const INPUT_RULES = {
  '/api/fraud/analyze': (b) => {
    const e = [];
    if (b.amount == null || isNaN(+b.amount) || +b.amount < 0)        e.push('amount must be ≥ 0');
    if (+b.amount > 100_000_000)                                        e.push('amount exceeds $100M hard limit');
    if (b.hour != null && (+b.hour < 0 || +b.hour > 23))              e.push('hour must be 0–23');
    if (b.frequency_24h != null && +b.frequency_24h < 0)              e.push('frequency_24h must be ≥ 0');
    if (b.distance_from_home != null && +b.distance_from_home < 0)    e.push('distance must be ≥ 0');
    return e;
  },
  '/api/credit/evaluate': (b) => {
    const e = [];
    if (!b.credit_score || +b.credit_score < 300 || +b.credit_score > 850) e.push('credit_score must be 300–850');
    if (!b.income   || +b.income   <= 0) e.push('income must be > 0');
    if (!b.loan_amount || +b.loan_amount <= 0) e.push('loan_amount must be > 0');
    if (b.age != null && (+b.age < 18 || +b.age > 120))               e.push('age must be 18–120');
    if (b.debt_to_income != null && (+b.debt_to_income < 0 || +b.debt_to_income > 2)) e.push('debt_to_income must be 0–2');
    if (b.missed_payments != null && +b.missed_payments < 0)          e.push('missed_payments must be ≥ 0');
    return e;
  },
  '/api/risk/analyze': (b) => {
    const e = [];
    if (!b.total_assets   || +b.total_assets   <= 0) e.push('total_assets must be > 0');
    if (!b.tier1_capital  || +b.tier1_capital  <= 0) e.push('tier1_capital must be > 0');
    if (+b.tier1_capital > +b.total_assets)          e.push('tier1_capital cannot exceed total_assets');
    if (b.npa_amount != null && +b.npa_amount < 0)  e.push('npa_amount must be ≥ 0');
    return e;
  },
  '/api/compliance/query': (b) => {
    const e = [];
    if (!b.question || typeof b.question !== 'string' || b.question.trim().length < 5)
      e.push('question must be at least 5 characters');
    if (b.question && b.question.length > 5000)
      e.push('question exceeds 5000 character limit');
    return e;
  },
};

// ─── Output validators ────────────────────────────────────────────────────────
const OUTPUT_RULES = {
  '/api/fraud/analyze': (o) => {
    const i = [];
    if (o.fraud_score == null)                       i.push('missing fraud_score');
    if (+o.fraud_score < 0 || +o.fraud_score > 1)   i.push('fraud_score out of [0,1]');
    if (o.is_fraud == null)                          i.push('missing is_fraud');
    if (!o.recommendation)                           i.push('missing recommendation');
    if (!o.explanation || o.explanation.length < 30) i.push('explanation too short');
    return i;
  },
  '/api/credit/evaluate': (o) => {
    const i = [];
    if (!o.decision)    i.push('missing decision');
    if (!o.explanation) i.push('missing explanation');
    return i;
  },
  '/api/compliance/query': (o) => {
    const i = [];
    if (!o.answer || o.answer.length < 20) i.push('answer too short or missing');
    return i;
  },
  '/api/risk/analyze': (o) => {
    const i = [];
    if (!o.risk_score?.rating) i.push('missing risk_score.rating');
    if (!o.explanation)        i.push('missing explanation');
    return i;
  },
};

// ─── Log violation ────────────────────────────────────────────────────────────
async function log(type, route, detail, severity = 'medium') {
  try {
    await supabase.from('guardrail_violations').insert({ type, route, detail, severity });
  } catch (_) {}
}

// ─── Middleware: input guardrail ──────────────────────────────────────────────
function inputGuardrail(req, res, next) {
  const route = req.baseUrl + (req.path === '/' ? '' : req.path);

  // Prompt injection check on all string values
  const strings = Object.values(req.body || {}).filter(v => typeof v === 'string');
  for (const s of strings) {
    for (const pattern of INJECTIONS) {
      if (pattern.test(s)) {
        log('prompt_injection', route, s.slice(0, 120), 'critical');
        return res.status(400).json({
          error: 'Input rejected by safety guardrail',
          code: 'PROMPT_INJECTION_DETECTED',
        });
      }
    }
  }

  // PII detection — log only, don't block (audit trail)
  const bodyStr = JSON.stringify(req.body || {});
  for (const { name, re } of PII) {
    if (re.test(bodyStr)) {
      log('pii_detected', route, `PII type: ${name}`, 'high');
    }
  }

  // Schema validation
  const validator = INPUT_RULES[route];
  if (validator) {
    const errors = validator(req.body || {});
    if (errors.length > 0) {
      log('invalid_input', route, errors.join(' | '), 'low');
      return res.status(422).json({ error: 'Input validation failed', details: errors });
    }
  }

  next();
}

// ─── Output guardrail check (call after AI response) ─────────────────────────
async function checkOutput(route, output) {
  const validator = OUTPUT_RULES[route];
  if (!validator) return { passed: true, issues: [] };
  const issues = validator(output);
  if (issues.length > 0) {
    await log('invalid_output', route, issues.join(' | '), 'medium');
    return { passed: false, issues };
  }
  return { passed: true, issues: [] };
}

module.exports = { inputGuardrail, checkOutput };
