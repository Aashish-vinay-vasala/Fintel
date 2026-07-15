const { supabase } = require('./db');

/**
 * Compute a composite quality score (0–100) for an AI response.
 * Checks: completeness, answer length, required field presence, coherence signals.
 */
function scoreQuality(route, output) {
  let score = 100;
  const outputStr = typeof output === 'string' ? output : JSON.stringify(output);

  // Penalise missing or very short answers
  if (!outputStr || outputStr.length < 30) score -= 40;
  else if (outputStr.length < 100)         score -= 20;

  // Route-specific scoring
  if (route.includes('fraud')) {
    if (output.fraud_score == null)    score -= 20;
    if (output.is_fraud == null)       score -= 15;
    if (!output.recommendation)        score -= 10;
    if (!output.explanation)           score -= 10;
  } else if (route.includes('credit')) {
    if (!output.decision)              score -= 25;
    if (!output.explanation)           score -= 15;
    if (output.approval_score == null) score -= 10;
  } else if (route.includes('risk')) {
    if (!output.overall_risk)          score -= 20;
    if (!output.summary)               score -= 15;
    if (!output.recommendations?.length) score -= 10;
  } else if (route.includes('compliance') || route.includes('aml') || route.includes('loans')) {
    if (!output.answer && !output.risk_level) score -= 30;
  }

  // Bonus for structured outputs
  if (typeof output === 'object' && Object.keys(output).length > 3) score += 5;

  return Math.max(0, Math.min(100, score));
}

/** Completeness: fraction of expected fields present */
const EXPECTED_FIELDS = {
  '/api/fraud/analyze':    ['fraud_score', 'is_fraud', 'recommendation', 'explanation'],
  '/api/credit/evaluate':  ['decision', 'explanation', 'approval_score'],
  '/api/risk/analyze':     ['overall_risk', 'risk_score', 'summary', 'recommendations'],
  '/api/compliance/query': ['answer'],
  '/api/aml/analyze-narrative': ['risk_level', 'risk_score', 'recommendation'],
};

function scoreCompleteness(route, output) {
  const fields = EXPECTED_FIELDS[route];
  if (!fields) return 1.0;
  const present = fields.filter(f => output[f] != null).length;
  return present / fields.length;
}

/** Relevance heuristic: check output references key input concepts */
function scoreRelevance(route, input, output) {
  const outStr = JSON.stringify(output).toLowerCase();
  if (route.includes('fraud')) {
    let hits = 0;
    if (input.amount && outStr.includes(String(input.amount).slice(0, 4))) hits++;
    if (typeof input.is_foreign === 'boolean') hits++;
    if (outStr.includes('fraud') || outStr.includes('risk')) hits++;
    return Math.min(1, hits / 3);
  }
  if (route.includes('credit')) {
    let hits = 0;
    if (outStr.includes('decision') || outStr.includes('approv')) hits++;
    if (input.credit_score && outStr.includes(String(input.credit_score).slice(0, 3))) hits++;
    if (outStr.includes('income') || outStr.includes('loan')) hits++;
    return Math.min(1, hits / 3);
  }
  return outStr.length > 50 ? 0.8 : 0.4;
}

/**
 * Save evaluation metrics for a single AI request to Supabase.
 */
async function track({
  route,
  variant = 'control',
  startTime,
  input,
  output,
  userId = null,
  referenceId = null,
  guardrailPassed = true,
  model = 'llama-3.3-70b-versatile',
}) {
  const latency_ms    = Date.now() - startTime;
  const quality_score = scoreQuality(route, output);
  const completeness  = scoreCompleteness(route, output);
  const relevance     = scoreRelevance(route, input, output);
  const output_length = JSON.stringify(output).length;

  try {
    await supabase.from('evaluation_metrics').insert({
      route,
      variant,
      latency_ms,
      quality_score,
      completeness,
      relevance,
      guardrail_passed: guardrailPassed,
      output_length,
      model,
      user_id:      userId,
      reference_id: referenceId,
    });
  } catch (_) {}

  return { latency_ms, quality_score, completeness, relevance };
}

/**
 * Aggregate metrics for a route — used by the dashboard.
 */
async function getMetrics(route, days = 7) {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data } = await supabase
    .from('evaluation_metrics')
    .select('latency_ms, quality_score, completeness, relevance, guardrail_passed, variant, created_at')
    .eq('route', route)
    .gte('created_at', since)
    .order('created_at', { ascending: false });

  if (!data?.length) return null;

  const avg = (arr, key) => arr.reduce((s, r) => s + (r[key] || 0), 0) / arr.length;
  const p50 = (arr, key) => {
    const sorted = [...arr].sort((a, b) => a[key] - b[key]);
    return sorted[Math.floor(sorted.length / 2)]?.[key] ?? 0;
  };
  const p95 = (arr, key) => {
    const sorted = [...arr].sort((a, b) => a[key] - b[key]);
    return sorted[Math.floor(sorted.length * 0.95)]?.[key] ?? 0;
  };

  return {
    count:           data.length,
    avg_latency_ms:  Math.round(avg(data, 'latency_ms')),
    p50_latency_ms:  Math.round(p50(data, 'latency_ms')),
    p95_latency_ms:  Math.round(p95(data, 'latency_ms')),
    avg_quality:     +(avg(data, 'quality_score')).toFixed(1),
    avg_completeness: +(avg(data, 'completeness') * 100).toFixed(1),
    avg_relevance:   +(avg(data, 'relevance') * 100).toFixed(1),
    guardrail_pass_rate: +(data.filter(r => r.guardrail_passed).length / data.length * 100).toFixed(1),
  };
}

module.exports = { track, getMetrics, scoreQuality };
