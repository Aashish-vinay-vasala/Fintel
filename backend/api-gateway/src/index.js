const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const AI_URL = process.env.AI_URL || "http://localhost:8080";

process.env.FRAUD_URL      = AI_URL + "/fraud";
process.env.CREDIT_URL     = AI_URL + "/credit";
process.env.COMPLIANCE_URL = AI_URL + "/compliance";
process.env.RISK_URL       = AI_URL + "/risk";
process.env.DOCS_URL       = AI_URL + "/docs-ai";

const fraudRoutes      = require("./routes/fraud");
const creditRoutes     = require("./routes/credit");
const complianceRoutes = require("./routes/compliance");
const riskRoutes       = require("./routes/risk");
const docsRoutes       = require("./routes/docs");
const reportsRoutes    = require("./routes/reports");
const amlRoutes        = require("./routes/aml");
const loansRoutes      = require("./routes/loans");
const evalRoutes       = require("./routes/eval");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/fraud",      fraudRoutes);
app.use("/api/credit",     creditRoutes);
app.use("/api/compliance", complianceRoutes);
app.use("/api/risk",       riskRoutes);
app.use("/api/docs",       docsRoutes);
app.use("/api/reports",    reportsRoutes);
app.use("/api/aml",        amlRoutes);
app.use("/api/loans",      loansRoutes);
app.use("/api/eval",       evalRoutes);

app.get("/api/health", async (req, res) => {
  const axios = require("axios");
  try {
    await axios.get(`${AI_URL}/health`);
    res.json({ gateway: "ok", ai_services: "ok" });
  } catch {
    res.json({ gateway: "ok", ai_services: "down" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Gateway running on port ${PORT}`));