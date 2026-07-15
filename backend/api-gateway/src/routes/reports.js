const express = require("express");
const axios   = require("axios");
const router  = express.Router();
const { supabase, getUserFromToken } = require("../lib/db");

const URL = () => (process.env.AI_URL || "http://localhost:8080") + "/reports";

router.post("/generate", async (req, res) => {
  try {
    const r = await axios.post(`${URL()}/generate`, req.body, { timeout: 90000 });
    const result = r.data;
    const user_id = await getUserFromToken(req.headers.authorization);

    await supabase.from("reports").insert({
      user_id,
      report_type: req.body.report_type,
      label:       result.label ?? req.body.report_type,
      content:     result.content ?? result.answer,
      context:     req.body.context ?? {},
    });

    res.json(result);
  } catch (e) {
    res.status(e.response?.status || 500).json({ error: e.response?.data?.detail || e.message });
  }
});

module.exports = router;
