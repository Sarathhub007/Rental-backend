
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

async function groqAI(prompt) {
  try {
    console.log("🔵 Sending prompt:", prompt);

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        max_tokens: 8,   // ⬅ keeps the model short
        temperature: 0.1, // ⬅ less creative, more numeric
        messages: [
          {
            role: "system",
            content: "Respond ONLY with a number. No words. No labels. No explanation."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      },
      {
        headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }
      }
    );

    console.log("🟢 RAW RESPONSE:", response.data);

    return response.data.choices[0].message.content.trim();

  } catch (err) {
    console.log("🔴 FULL ERROR:", err.response?.data || err.message);
    return null;
  }
}




app.post("/api/ai/predict-rent", async (req, res) => {
  try {
    const { location, sqft, bhk, furnishing } = req.body;

const prompt = `
You are a rent prediction engine for Indian cities.

Follow this formula internally (do NOT output it):
- Base rent depends on city:
  Hyderabad: 18–25 INR per sqft
  Andhra Pradesh (other cities): 10–18 INR per sqft

- Add:
  + (BHK × 2000)
  + Furnished bonus: +4000 for "furnished", +0 for "not furnished"

Now apply the formula and return ONLY the final rent number.

Location: ${location}
Sqft: ${sqft}
BHK: ${bhk}
Furnishing: ${furnishing}

Return ONLY a number.
`;


    const output = await groqAI(prompt);
    console.log("🟣 AI OUTPUT:", output);

    const match = output?.match(/\d+/);
    const rent = match ? Number(match[0]) : null;

    return res.json({
      price: rent || "N/A",
      raw: output
    });

  } catch (err) {
    return res.status(500).json({
      error: "Prediction failed",
      details: err.message
    });
  }
});



// API — Maintenance Categorizer
app.post("/api/ai/categorize", async (req, res) => {
  const { description } = req.body;

  const prompt = `
  Categorize maintenance issue: "${description}"
  Return JSON:
  {
    "category": "plumbing/electrical/structural/cleaning/Other",
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

