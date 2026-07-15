const express = require("express");
const axios   = require("axios");
const router  = express.Router();
const { supabase, getUserFromToken } = require("../lib/db");

const URL = () => (process.env.AI_URL || "http://localhost:8080") + "/loans";

router.post("/monitor", async (req, res) => {
  try {
    const r = await axios.post(`${URL()}/monitor`, req.body, { timeout: 60000 });
    const result = r.data;
    const user_id = await getUserFromToken(req.headers.authorization);

    await supabase.from("loan_monitoring").insert({
      user_id,
      portfolio:    req.body.portfolio,
      loans:        req.body.loans,
      health_score: result.health_score,
      rating:       result.rating,
      ewi_count:    result.ewi_count,
      summary:      result.summary,
      full_result:  result,
    });

    res.json(result);
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: e.response?.data?.detail || e.message });
  }
});

module.exports = router;
