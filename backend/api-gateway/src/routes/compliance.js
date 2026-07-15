const express = require('express');
const axios   = require('axios');
const router  = express.Router();
const { supabase, getUserFromToken } = require('../lib/db');
const { inputGuardrail, checkOutput } = require('../lib/guardrails');
const { getPrompt }                   = require('../lib/prompts');
const { track }                       = require('../lib/evaluator');
const { selectVariant, recordResult } = require('../lib/abTest');

const COMPLIANCE_URL = () => (process.env.AI_URL || 'http://localhost:8080') + '/compliance';

router.post('/query', inputGuardrail, async (req, res) => {
  const startTime = Date.now();
  const route = '/api/compliance/query';

  try {
    const { experimentId, variantId, variantName, promptKey } = await selectVariant(route);

    // Callers that already supply a complete, self-contained prompt (their own
    // output schema) opt out of the compliance-officer template — otherwise it
    // gets wrapped a second time and the LLM's JSON ends up nested under `answer`.
    const enhancedQuestion = req.body.raw
      ? req.body.question
      : getPrompt('compliance', promptKey, req.body.question);

    const response = await axios.post(`${COMPLIANCE_URL()}/query`, {
      ...req.body,
      question: enhancedQuestion,
      _variant: variantName,
    }, { timeout: 60000 });
    const result = response.data;

    const { passed } = await checkOutput(route, result);
    const user_id = await getUserFromToken(req.headers.authorization);

    await supabase.from('compliance_queries').insert({
      user_id, query_type: 'general',
      question: req.body.question,
      answer: result.answer,
    });

    const { latency_ms, quality_score } = await track({
      route, variant: variantName, startTime,
      input: req.body, output: result,
      userId: user_id, guardrailPassed: passed,
    });
    await recordResult({ experimentId, variantId, variantName, latencyMs: latency_ms, qualityScore: quality_score, userId: user_id });

    res.json({ ...result, _meta: { variant: variantName, latency_ms, quality_score } });
  } catch (err) {
    res.status(500).json({ error: 'Compliance service unavailable', detail: err.message });
  }
});

router.post('/check-transaction', async (req, res) => {
  const startTime = Date.now();
  try {
    const response = await axios.post(`${COMPLIANCE_URL()}/check-transaction`, req.body, { timeout: 45000 });
    const result   = response.data;
    const user_id  = await getUserFromToken(req.headers.authorization);

    await supabase.from('compliance_queries').insert({
      user_id, query_type: 'transaction',
      question: JSON.stringify(req.body),
      answer: result.answer ?? JSON.stringify(result),
    });

    await track({ route: '/api/compliance/check-transaction', variant: 'control', startTime, input: req.body, output: result, userId: user_id });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Compliance service unavailable', detail: err.message });
  }
});

module.exports = router;
