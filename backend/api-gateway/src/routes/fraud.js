const express = require('express');
const axios   = require('axios');
const router  = express.Router();
const { supabase, getUserFromToken, saveAlert } = require('../lib/db');
const { inputGuardrail, checkOutput }           = require('../lib/guardrails');
const { getPrompt }                             = require('../lib/prompts');
const { track, scoreQuality }                   = require('../lib/evaluator');
const { selectVariant, recordResult }           = require('../lib/abTest');

const FRAUD_URL = () => (process.env.AI_URL || 'http://localhost:8080') + '/fraud';

router.post('/analyze', inputGuardrail, async (req, res) => {
  const startTime = Date.now();
  const route = '/api/fraud/analyze';

  try {
    // A/B: select prompt variant
    const { experimentId, variantId, variantName, promptKey } = await selectVariant(route);

    // Build prompt using selected variant (zero_shot | few_shot | cot)
    const enhancedBody = {
      ...req.body,
      _prompt_hint: getPrompt('fraud', promptKey, req.body),
      _variant: variantName,
    };

    const response = await axios.post(`${FRAUD_URL()}/analyze`, enhancedBody, { timeout: 45000 });
    const result   = response.data;

    // Output guardrail
    const { passed, issues } = await checkOutput(route, result);
    if (!passed) {
      result._guardrail_warnings = issues;
    }

    // Persist
    const user_id = await getUserFromToken(req.headers.authorization);
    const { data: row } = await supabase.from('fraud_analyses').insert({
      user_id,
      amount:        req.body.amount,
      hour_of_day:   req.body.hour,
      tx_last_24h:   req.body.frequency_24h,
      avg_amount_7d: req.body.avg_amount_7d,
      distance_km:   req.body.distance_from_home,
      is_foreign:    req.body.is_foreign,
      is_same_city:  req.body.same_city,
      fraud_score:   result.fraud_score,
      is_fraud:      result.is_fraud,
      recommendation: result.recommendation,
      explanation:   result.explanation,
      full_result:   result,
    }).select('id').single();

    // Alert
    if (result.is_fraud) {
      const score = Math.round((result.fraud_score || 0) * 100);
      await saveAlert(
        score >= 80 ? 'critical' : 'warning',
        `Fraud detected — $${Number(req.body.amount).toLocaleString()} transaction`,
        `Score ${score}/100 · ${result.recommendation} · Variant: ${variantName}`,
        'fraud', row?.id ?? null
      );
    }

    // Eval tracking + A/B result
    const { latency_ms, quality_score } = await track({
      route, variant: variantName, startTime,
      input: req.body, output: result,
      userId: user_id, referenceId: row?.id ?? null,
      guardrailPassed: passed,
    });
    await recordResult({ experimentId, variantId, variantName, latencyMs: latency_ms, qualityScore: quality_score, userId: user_id });

    res.json({ ...result, _meta: { variant: variantName, latency_ms, quality_score, guardrail_passed: passed } });
  } catch (err) {
    res.status(500).json({ error: 'Fraud service unavailable', detail: err.message });
  }
});

router.post('/batch', async (req, res) => {
  try {
    const r = await axios.post(`${FRAUD_URL()}/batch`, req.body);
    res.json(r.data);
  } catch (err) {
    res.status(500).json({ error: 'Fraud service unavailable', detail: err.message });
  }
});

module.exports = router;
