const express = require("express");
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");
const router = express.Router();

const DOCS_URL = process.env.DOCS_URL || "http://localhost:8005";
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    const response = await axios.post(`${DOCS_URL}/upload`, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Docs service unavailable", detail: err.message });
  }
});

router.post("/ask", async (req, res) => {
  try {
    const form = new FormData();
    form.append("doc_id", req.body.doc_id);
    form.append("question", req.body.question);
    const response = await axios.post(`${DOCS_URL}/ask`, form, {
      headers: form.getHeaders(),
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Docs service unavailable", detail: err.message });
  }
});

module.exports = router;