const express = require('express');
const axios   = require('axios');
const router  = express.Router();
const { inputGuardrail } = require('../lib/guardrails');

const COPILOT_URL = () => (process.env.AI_URL || 'http://localhost:8080') + '/copilot';

router.post('/chat', inputGuardrail, async (req, res) => {
  try {
    const response = await axios.post(`${COPILOT_URL()}/chat`, req.body, { timeout: 45000 });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Copilot service unavailable', detail: err.message });
  }
});

module.exports = router;
