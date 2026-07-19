import { supabase } from '../lib/supabase';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }
    : { 'Content-Type': 'application/json' };
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${err}`);
  }
  return res.json();
}

async function postForm(path, formData) {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
  const res = await fetch(`${BASE}${path}`, { method: 'POST', headers, body: formData });
  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${err}`);
  }
  return res.json();
}

// ─── Fraud ─────────────────────────────────────────────────────────────────
export async function analyzeFraud(payload) {
  return post('/fraud/analyze', {
    amount:             payload.amount,
    hour:               payload.hour_of_day,
    frequency_24h:      payload.transactions_last_24h,
    avg_amount_7d:      payload.avg_amount_last_7d,
    distance_from_home: payload.distance_from_home_km,
    is_foreign:         payload.is_foreign === 1 || payload.is_foreign === true,
    same_city:          payload.is_same_city === 1 || payload.is_same_city === true,
  });
}

// ─── Credit ────────────────────────────────────────────────────────────────
export async function scoreCredit(payload) {
  return post('/credit/evaluate', {
    age:              payload.age,
    income:           payload.annual_income,
    loan_amount:      payload.loan_amount,
    credit_score:     payload.credit_score,
    employment_years: payload.employment_years,
    existing_loans:   payload.existing_loans,
    missed_payments:  payload.missed_payments,
    debt_to_income:   payload.debt_to_income,
  });
}

// ─── Compliance ────────────────────────────────────────────────────────────
export async function askCompliance(question) {
  return post('/compliance/query', { question });
}

export async function checkCompliance(payload) {
  return post('/compliance/check-transaction', {
    amount:           payload.amount,
    transaction_type: payload.transaction_type,
    is_foreign:       payload.is_foreign === 'true' || payload.is_foreign === true,
  });
}

// ─── Risk ──────────────────────────────────────────────────────────────────
export async function analyzeRisk(payload) {
  return post('/risk/analyze', {
    total_assets:          payload.total_assets,
    loan_portfolio:        payload.loan_portfolio,
    npa_amount:            payload.npa_amount,
    tier1_capital:         payload.tier1_capital,
    total_capital:         payload.total_capital,
    cash_reserves:         payload.cash_reserves,
    investment_securities: payload.investment_securities,
    deposits:              payload.total_deposits,
  });
}

// ─── Reports ───────────────────────────────────────────────────────────────
const REPORT_LABELS = {
  sar:              'Suspicious Activity Report (SAR) — FinCEN Filing',
  ctr:              'Currency Transaction Report (CTR) — FinCEN Filing',
  risk_assessment:  'Portfolio Risk Assessment Report',
  credit_portfolio: 'Credit Portfolio Summary Report',
  compliance_audit: 'Compliance Audit Report',
  board_summary:    'Board Executive Summary',
};

export async function generateReport({ report_type, context }) {
  const label = REPORT_LABELS[report_type] || report_type.toUpperCase();
  const ctx = Object.entries(context)
    .filter(([, v]) => v)
    .map(([k, v]) => `- ${k.replace(/_/g, ' ')}: ${v}`)
    .join('\n');
  const question = `You are a senior banking analyst. Write a complete, professional ${label} using the data below. Include all standard sections (Executive Summary, Key Details, Risk Analysis, Required Actions, Regulatory References). Use formal banking language.\n\nDATA:\n${ctx}`;
  const data = await post('/compliance/query', { question, raw: true });
  return { report_type, label, content: data.answer };
}

// ─── AML ───────────────────────────────────────────────────────────────────
function tryParseJSON(text, fallback) {
  try {
    const m = text.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : fallback;
  } catch { return fallback; }
}

export async function analyzeNarrative({ narrative }) {
  const question = `You are an AML specialist AI. Analyze this transaction narrative and return a JSON object ONLY (no extra text) with fields: risk_level ("HIGH"/"MEDIUM"/"LOW"), risk_score (0-100 integer), entities (array of {type, value} where type is PERSON/AMOUNT/LOCATION/DATE/ORGANIZATION), red_flags (array of suspicious indicator strings), patterns (array of AML typology names like structuring/layering/smurfing), recommendation (string with action + reasoning).\n\nNARRATIVE: ${narrative}`;
  const data = await post('/compliance/query', { question, raw: true });
  return tryParseJSON(data.answer, {
    risk_level: 'MEDIUM', risk_score: 50,
    entities: [], red_flags: [], patterns: [],
    recommendation: data.answer,
  });
}

export async function screenCustomer(payload) {
  const ctx = Object.entries(payload).filter(([, v]) => v).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(', ');
  const question = `You are a KYC/AML compliance officer AI. Screen this customer and return a JSON object ONLY (no extra text) with fields: risk_level ("HIGH"/"MEDIUM"/"LOW"), checks (array of {name, passed: boolean} for these checks: "OFAC Sanctions List", "PEP Screening", "Adverse Media", "High-Risk Country", "Occupation Risk", "Account Behavior"), risk_factors (array of strings), recommendation (string with due diligence actions).\n\nCUSTOMER: ${ctx}`;
  const data = await post('/compliance/query', { question, raw: true });
  return tryParseJSON(data.answer, {
    risk_level: 'LOW', checks: [], risk_factors: [], recommendation: data.answer,
  });
}

// ─── Loans ─────────────────────────────────────────────────────────────────
export async function monitorLoans({ portfolio, loans }) {
  const portStr = Object.entries(portfolio).filter(([, v]) => v).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(', ') || 'not provided';
  const loansStr = loans.map(l => `${l.borrower} (${l.loan_type}, $${l.outstanding}K, ${l.days_past_due || 0} DPD, collateral $${l.collateral_value || 0}K)`).join('; ') || 'none';
  const question = `You are a credit risk officer AI. Analyze this loan portfolio and return a JSON object ONLY (no extra text) with fields: health_score (0-100 integer), rating ("EXCELLENT"/"GOOD"/"FAIR"/"POOR"/"CRITICAL"), ewi_count (integer), early_warnings (array of {indicator: string, severity: "HIGH"/"MEDIUM"}), loan_analysis (array of {borrower, action: "MONITOR"/"WATCH"/"RESTRUCTURE"/"WRITE-OFF", note}), recommendations (array of 4-5 strings), summary (2-3 sentence string).\n\nPORTFOLIO: ${portStr}\nLOANS: ${loansStr}`;
  const data = await post('/compliance/query', { question, raw: true });
  return tryParseJSON(data.answer, {
    health_score: 70, rating: 'FAIR', ewi_count: 0,
    early_warnings: [], loan_analysis: [], recommendations: [], summary: data.answer,
  });
}

// ─── Customer 360 ──────────────────────────────────────────────────────────
export async function profileCustomer(payload) {
  const ctx = Object.entries(payload).filter(([, v]) => v).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(', ');
  const question = `You are a bank analyst AI. Create a Customer 360 profile and return JSON ONLY with fields: risk_level ("HIGH"/"MEDIUM"/"LOW"), risk_score (0-100 integer), credit_grade ("A"/"B"/"C"/"D"/"F"), kyc_status ("VERIFIED"/"PENDING"/"FAILED"), pep_match (boolean), sanctions_match (boolean), product_holdings (array of strings like "Checking","Mortgage"), behavioral_flags (array of strings), lifetime_value (number, $K estimated), recommended_due_diligence (string), summary (string).\n\nCUSTOMER: ${ctx}`;
  const data = await post('/compliance/query', { question, raw: true });
  return tryParseJSON(data.answer, { risk_level: 'MEDIUM', risk_score: 50, product_holdings: [], behavioral_flags: [], summary: data.answer });
}

// ─── Network Graph ─────────────────────────────────────────────────────────
export async function analyzeNetwork(payload) {
  const ctx = `Account ID: ${payload.account_id}, description: ${payload.description || 'not provided'}, transaction count: ${payload.tx_count || 'unknown'}, time period: ${payload.period || 'last 90 days'}`;
  const question = `You are a financial crime analyst AI. Map the transaction network for this account and return JSON ONLY with fields: risk_score (0-100 integer), flags (array of AML typology strings), nodes (array of exactly 7 objects each with {id: string, label: string, type: "account"|"shell"|"merchant"|"individual", risk: "HIGH"|"MEDIUM"|"LOW", amount: number}), edges (array of objects {from: string (must match a node id), to: string (must match a node id), label: string, suspicious: boolean}), summary (string). The first node in the nodes array must have id matching ${payload.account_id || 'ACC-001'} and be the central queried account.\n\nACCOUNT: ${ctx}`;
  const data = await post('/compliance/query', { question, raw: true });
  return tryParseJSON(data.answer, { risk_score: 50, flags: [], nodes: [], edges: [], summary: data.answer });
}

// ─── Interest Rate Risk ────────────────────────────────────────────────────
export async function analyzeInterestRate(payload) {
  const ctx = Object.entries(payload).filter(([, v]) => v).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(', ');
  const question = `You are an ALM specialist AI. Analyze interest rate risk and return JSON ONLY with fields: nim_current (number, %), nim_stressed (number, % under +200bps shock), duration_gap (number, years), repricing_risk ("HIGH"/"MEDIUM"/"LOW"), rate_sensitivity (string), earnings_at_risk (number, $M), economic_value_at_risk (number, $M), scenarios (array of {shock: string, nim_impact: number, commentary: string}), recommendations (array of strings), summary (string).\n\nDATA: ${ctx}`;
  const data = await post('/compliance/query', { question, raw: true });
  return tryParseJSON(data.answer, { repricing_risk: 'MEDIUM', scenarios: [], recommendations: [], summary: data.answer });
}

// ─── LCR ───────────────────────────────────────────────────────────────────
export async function analyzeLCR(payload) {
  const ctx = Object.entries(payload).filter(([, v]) => v).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(', ');
  const question = `You are a Basel III liquidity specialist AI. Calculate the Liquidity Coverage Ratio and return JSON ONLY with fields: lcr_ratio (number, %), status ("COMPLIANT"/"AT_RISK"/"NON_COMPLIANT"), hqla_total (number, $M), net_outflows_30d (number, $M), buffer_surplus (number, $M, positive=surplus negative=shortfall), stress_lcr (number, %, under stress), breakdown (array of {component: string, amount: number, type: "inflow"|"outflow"|"hqla"}), recommendations (array of strings), summary (string).\n\nDATA: ${ctx}`;
  const data = await post('/compliance/query', { question, raw: true });
  return tryParseJSON(data.answer, { status: 'AT_RISK', breakdown: [], recommendations: [], summary: data.answer });
}

// ─── Chargeback Intelligence ────────────────────────────────────────────────
export async function analyzeChargeback(payload) {
  const ctx = Object.entries(payload).filter(([, v]) => v).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(', ');
  const question = `You are a payments dispute analyst AI. Analyze this chargeback/dispute and return JSON ONLY with fields: category ("FRAUD"/"FRIENDLY_FRAUD"/"MERCHANT_ERROR"/"PROCESSING_ERROR"), win_probability (0-100, bank's chance of winning dispute), recommended_action ("ACCEPT"/"DISPUTE"/"ESCALATE"), reason_code (string), reg_e_applicable (boolean), required_evidence (array of strings), timeline_days (integer), risk_indicators (array of strings), summary (string).\n\nDISPUTE: ${ctx}`;
  const data = await post('/compliance/query', { question, raw: true });
  return tryParseJSON(data.answer, { category: 'FRAUD', win_probability: 50, recommended_action: 'DISPUTE', required_evidence: [], risk_indicators: [], summary: data.answer });
}

// ─── DSCR Calculator ───────────────────────────────────────────────────────
export async function calculateDSCR(payload) {
  const ctx = Object.entries(payload).filter(([, v]) => v).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(', ');
  const question = `You are a commercial lending underwriter AI. Calculate DSCR and underwriting metrics, return JSON ONLY with fields: dscr (number, 2 decimals), dscr_rating ("STRONG"/"ADEQUATE"/"MARGINAL"/"INSUFFICIENT"), ltv (number, %), debt_yield (number, %), recommendation ("APPROVE"/"CONDITIONAL"/"DECLINE"), max_loan_amount (number, $M), loan_constant (number, %), conditions (array of strings), risks (array of strings), summary (string).\n\nLOAN DATA: ${ctx}`;
  const data = await post('/compliance/query', { question, raw: true });
  return tryParseJSON(data.answer, { dscr_rating: 'MARGINAL', recommendation: 'CONDITIONAL', conditions: [], risks: [], summary: data.answer });
}

// ─── Regulatory Tracker ────────────────────────────────────────────────────
export async function trackRegulatory({ query }) {
  const question = `You are a banking regulatory expert AI. Answer this regulatory query and return JSON ONLY with fields: regulations (array of {name: string, agency: string, effective_date: string, status: "ACTIVE"/"PROPOSED"/"PENDING", impact: "HIGH"/"MEDIUM"/"LOW", description: string}), action_items (array of strings), compliance_deadline (string or null), affected_departments (array of strings), answer (string, detailed plain-English explanation).\n\nQUERY: ${query}`;
  const data = await post('/compliance/query', { question, raw: true });
  return tryParseJSON(data.answer, { regulations: [], action_items: [], affected_departments: [], answer: data.answer });
}

// ─── Peer Benchmarking ─────────────────────────────────────────────────────
export async function benchmarkBank(payload) {
  const ctx = Object.entries(payload).filter(([, v]) => v).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(', ');
  const question = `You are a bank performance analyst AI. Benchmark this bank against industry peers (use FDIC call report data as reference) and return JSON ONLY with fields: overall_rank ("TOP_QUARTILE"/"SECOND_QUARTILE"/"THIRD_QUARTILE"/"BOTTOM_QUARTILE"), metrics (array of {name: string, bank_value: number, peer_median: number, top_quartile: number, unit: string, status: "ABOVE"/"AT"/"BELOW"}), strengths (array of strings), weaknesses (array of strings), peer_group (string), summary (string).\n\nBANK METRICS: ${ctx}`;
  const data = await post('/compliance/query', { question, raw: true });
  return tryParseJSON(data.answer, { overall_rank: 'SECOND_QUARTILE', metrics: [], strengths: [], weaknesses: [], summary: data.answer });
}

// ─── Collateral Management ─────────────────────────────────────────────────
export async function analyzeCollateral(payload) {
  const assetsStr = (payload.assets || []).map(a => `${a.type}: $${a.value}M (haircut ${a.haircut}%, LTV ${a.ltv}%)`).join('; ') || 'none';
  const portCtx = Object.entries(payload.portfolio || {}).filter(([, v]) => v).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(', ');
  const question = `You are a collateral management specialist AI. Analyze this collateral portfolio and return JSON ONLY with fields: total_collateral_value (number, $M), eligible_collateral (number, $M after haircuts), coverage_ratio (number, %), margin_call_risk ("HIGH"/"MEDIUM"/"LOW"), assets (array of {type: string, market_value: number, haircut_value: number, ltv: number, status: "ADEQUATE"/"AT_RISK"/"MARGIN_CALL"}), recommendations (array of strings), summary (string).\n\nCOLLATERAL: ${assetsStr}\nPORTFOLIO: ${portCtx}`;
  const data = await post('/compliance/query', { question, raw: true });
  return tryParseJSON(data.answer, { margin_call_risk: 'MEDIUM', assets: [], recommendations: [], summary: data.answer });
}

// ─── Copilot ───────────────────────────────────────────────────────────────
export async function copilotChat({ message, page, history, pendingAction, confirm }) {
  return post('/copilot/chat', { message, page, history, pending_action: pendingAction, confirm });
}

// ─── Documents ─────────────────────────────────────────────────────────────
export async function summarizeDocument(file) {
  const fd = new FormData();
  fd.append('file', file);
  return postForm('/docs/upload', fd);
}

export async function askDocument(docId, question) {
  const fd = new FormData();
  fd.append('doc_id', docId);
  fd.append('question', question);
  return postForm('/docs/ask', fd);
}
