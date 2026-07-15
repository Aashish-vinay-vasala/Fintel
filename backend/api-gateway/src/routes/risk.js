const express = require('express');
const axios   = require('axios');
const router  = express.Router();
const { supabase, getUserFromToken } = require('../lib/db');
const { inputGuardrail, checkOutput } = require('../lib/guardrails');
const { getPrompt }                   = require('../lib/prompts');
const { track }                       = require('../lib/evaluator');

const RISK_URL = () => (process.env.AI_URL || 'http://localhost:8080') + '/risk';

router.post('/analyze', inputGuardrail, async (req, res) => {
  const startTime = Date.now();
  const route = '/api/risk/analyze';
  try {
    const response = await axios.post(`${RISK_URL()}/analyze`, {
      ...req.body,
      _prompt_hint: getPrompt('risk', 'few_shot', req.body),
    }, { timeout: 45000 });
    const result = response.data;

    const { passed } = await checkOutput(route, result);
    const user_id = await getUserFromToken(req.headers.authorization);

    await supabase.from('risk_analyses').insert({
      user_id,
      total_assets:   req.body.total_assets,
      loan_portfolio: req.body.loan_portfolio,
      npa_amount:     req.body.npa_amount,
      tier1_capital:  req.body.tier1_capital,
      overall_risk:   result.risk_score?.rating,
      risk_score:     result.risk_score?.score,
      tier1_ratio:    result.ratios?.tier1_capital_ratio,
      summary:        result.explanation,
      full_result:    result,
    });

    const { latency_ms, quality_score } = await track({
      route, variant: 'few_shot', startTime,
      input: req.body, output: result,
      userId: user_id, guardrailPassed: passed,
    });

    res.json({ ...result, _meta: { latency_ms, quality_score, guardrail_passed: passed } });
  } catch (err) {
    res.status(500).json({ error: 'Risk service unavailable', detail: err.message });
  }
});

module.exports = router;
