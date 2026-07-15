const express = require("express");
const axios   = require("axios");
const router  = express.Router();
const { supabase, getUserFromToken, saveAlert } = require("../lib/db");

const URL = () => (process.env.AI_URL || "http://localhost:8080") + "/aml";

router.post("/analyze-narrative", async (req, res) => {
  try {
    const r = await axios.post(`${URL()}/analyze-narrative`, req.body, { timeout: 45000 });
    const result = r.data;
    const user_id = await getUserFromToken(req.headers.authorization);

    const { data: row } = await supabase.from("aml_records").insert({
      user_id,
      type:          "narrative",
      input_data:    req.body,
      risk_level:    result.risk_level,
      risk_score:    result.risk_score,
      recommendation: result.recommendation,
      full_result:   result,
    }).select("id").single();

    if (result.risk_level === "HIGH") {
      await saveAlert(
        "critical",
        "AML — High-risk narrative detected",
        `Score ${result.risk_score}/100 · ${(result.patterns || []).slice(0, 2).join(", ")}`,
        "aml",
        row?.id ?? null
      );
    }

    res.json(result);
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: e.response?.data?.detail || e.message });
  }
});

router.post("/screen-customer", async (req, res) => {
  try {
    const r = await axios.post(`${URL()}/screen-customer`, req.body, { timeout: 45000 });
    const result = r.data;
    const user_id = await getUserFromToken(req.headers.authorization);

    await supabase.from("aml_records").insert({
      user_id,
      type:          "screening",
      input_data:    req.body,
      risk_level:    result.risk_level,
      recommendation: result.recommendation,
      full_result:   result,
    });

    res.json(result);
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: e.response?.data?.detail || e.message });
  }
});

module.exports = router;
