const express = require('express');
const router  = express.Router();
const { getMetrics } = require('../lib/evaluator');
const { getSummary } = require('../lib/abTest');
const { supabase }   = require('../lib/db');

// GET /api/eval/metrics?route=/api/fraud/analyze&days=7
router.get('/metrics', async (req, res) => {
  const { route, days = 7 } = req.query;
  if (!route) return res.status(400).json({ error: 'route param required' });
  const metrics = await getMetrics(route, +days);
  res.json(metrics ?? { count: 0 });
});

// GET /api/eval/all — metrics for every route
router.get('/all', async (req, res) => {
  const { days = 7 } = req.query;
  const routes = [
    '/api/fraud/analyze',
    '/api/credit/evaluate',
    '/api/risk/analyze',
    '/api/compliance/query',
    '/api/aml/analyze-narrative',
  ];
  const results = await Promise.all(
    routes.map(async (r) => ({ route: r, ...(await getMetrics(r, +days) ?? { count: 0 }) }))
  );
  res.json(results);
});

// GET /api/eval/ab/:experimentId
router.get('/ab/:experimentId', async (req, res) => {
  const summary = await getSummary(req.params.experimentId);
  res.json(summary ?? { error: 'No data yet' });
});

// GET /api/eval/ab — list all experiments with their latest stats
router.get('/ab', async (req, res) => {
  const { data: experiments } = await supabase
    .from('ab_experiments')
    .select('id, name, description, route, status, winner, ab_variants(name, weight, prompt_key)')
    .order('created_at', { ascending: false });
  res.json(experiments ?? []);
});

// GET /api/eval/violations?days=7
router.get('/violations', async (req, res) => {
  const { days = 7 } = req.query;
  const since = new Date(Date.now() - +days * 86400000).toISOString();
  const { data } = await supabase
    .from('guardrail_violations')
    .select('*')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(100);
  res.json(data ?? []);
});

module.exports = router;
