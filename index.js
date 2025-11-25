
require("dotenv").config();
const propertyRoutes = require("./server/routes/propertyRoutes");
const tenantRoutes = require("./server/routes/tenantRoutes.js");
const leaseRoutes = require("./server/routes/leaseRoutes.js");
const maintenanceRoutes = require("./server/routes/maintenanceRoutes.js");
const dashboardRoutes = require("./server/routes/dashboardRoutes");
const express = require("express");

const cors = require("cors");
const axios = require("axios");
const path = require("path");
const db = require("./db");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Connect DB
db();

// Property Routes
app.use("/api/property", propertyRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/leases", leaseRoutes);
app.use("/api/maintenance", maintenanceRoutes);
// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// GROQ AI KEY
const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function groqAI(prompt, system = "You are an AI assistant.") {
  if (!GROQ_API_KEY) return "AI is disabled — missing API key";

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Groq API error:", error.message);
    return "AI Service unavailable.";
  }
}


app.post("/api/ai/predict-rent", async (req, res) => {
  const { location, sqft, bhk, furnishing } = req.body;

  const prompt = `
  Predict monthly rent (INR) for:
  - Location: ${location}
  - Area: ${sqft} sq ft
  - BHK: ${bhk}
  - Furnishing: ${furnishing}

  Return ONLY a number.
  `;

  const output = await groqAI(prompt);
  const price = output.match(/\d+/)?.[0] || "N/A";

  res.json({ predictedRent: price });
});

// API — Maintenance Categorizer
app.post("/api/ai/categorize", async (req, res) => {
  const { description } = req.body;

  const prompt = `
  Categorize maintenance issue: "${description}"
  Return JSON:
  {
    "category": "plumbing/electrical/structural/cleaning/other",
    "risk": "low/medium/high"
  }
  `;

  const result = await groqAI(prompt);

  try {
    const json = JSON.parse(result.slice(result.indexOf("{"), result.lastIndexOf("}") + 1));
    res.json(json);
  } catch (e) {
    res.json({ category: "other", risk: "low" });
  }
});

// Start API Server
app.listen(process.env.PORT || 5000, () => {
  console.log(`API running at http://localhost:${process.env.PORT || 5000}`);
});
