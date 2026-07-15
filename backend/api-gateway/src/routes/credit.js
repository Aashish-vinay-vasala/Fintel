const express = require('express');
const axios   = require('axios');
const router  = express.Router();
const { supabase, getUserFromToken } = require('../lib/db');
const { inputGuardrail, checkOutput } = require('../lib/guardrails');
const { getPrompt }                   = require('../lib/prompts');
const { track }                       = require('../lib/evaluator');
const { selectVariant, recordResult } = require('../lib/abTest');

const CREDIT_URL = () => (process.env.AI_URL || 'http://localhost:8080') + '/credit';

router.post('/evaluate', inputGuardrail, async (req, res) => {
  const startTime = Date.now();
  const route = '/api/credit/evaluate';

  try {
    const { experimentId, variantId, variantName, promptKey } = await selectVariant(route);

    const enhancedBody = {
      ...req.body,
      _prompt_hint: getPrompt('credit', promptKey, req.body),
      _variant: variantName,
    };

    const response = await axios.post(`${CREDIT_URL()}/evaluate`, enhancedBody, { timeout: 45000 });
    const result   = response.data;

    const { passed } = await checkOutput(route, result);

    const user_id = await getUserFromToken(req.headers.authorization);
    const { data: row } = await supabase.from('credit_applications').insert({
      user_id,
      age:              req.body.age,
      annual_income:    req.body.income,
      loan_amount:      req.body.loan_amount,
      credit_score:     req.body.credit_score,
      employment_years: req.body.employment_years,
      existing_loans:   req.body.existing_loans,
      missed_payments:  req.body.missed_payments,
      debt_to_income:   req.body.debt_to_income,
      decision:         result.decision,
      approval_score:   result.approval_score ?? result.score,
      suggested_limit:  result.suggested_limit ?? result.max_loan,
      explanation:      result.explanation,
      full_result:      result,
    }).select('id').single();

    const { latency_ms, quality_score } = await track({
      route, variant: variantName, startTime,
      input: req.body, output: result,
      userId: user_id, referenceId: row?.id,
      guardrailPassed: passed,
    });
    await recordResult({ experimentId, variantId, variantName, latencyMs: latency_ms, qualityScore: quality_score, userId: user_id });

    res.json({ ...result, _meta: { variant: variantName, latency_ms, quality_score, guardrail_passed: passed } });
  } catch (err) {
    res.status(500).json({ error: 'Credit service unavailable', detail: err.message });
  }
});

module.exports = router;
