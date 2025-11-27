require("dotenv").config();

// ------------------------- IMPORTS -------------------------
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const db = require("./db");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");

// Routes
const propertyRoutes = require("./server/routes/propertyRoutes");
const tenantRoutes = require("./server/routes/tenantRoutes");
const leaseRoutes = require("./server/routes/leaseRoutes");
const maintenanceRoutes = require("./server/routes/maintenanceRoutes");
const dashboardRoutes = require("./server/routes/dashboardRoutes");

// ------------------------- EXPRESS APP -------------------------
const app = express();
app.use(cors());
app.use(express.json());

// Connect DB
db();

// API Routes
app.use("/api/property", propertyRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/leases", leaseRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ------------------------- GROQ AI FUNCTION -------------------------
const GROQ_API_KEY = process.env.GROQ_API_KEY;

async function groqAI(prompt, mode = "chat") {
  try {
    const payload =
      mode === "chat"
        ? {
            model: "openai/gpt-oss-20b",
            messages: [
              { role: "system", content: "You are a helpful rental management assistant." },
              { role: "user", content: prompt }
            ],
            max_tokens: 200
          }
        : {
            model: "llama-3.1-8b-instant",
            max_tokens: 8,
            temperature: 0.1,
            messages: [
              {
                role: "system",
                content: "Respond ONLY with a number. No words. No labels. No explanation."
              },
              { role: "user", content: prompt }
            ]
          };

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      payload,
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (err) {
    console.error("AI Error:", err?.response?.data || err.message);
    return "Sorry, I couldn't process that.";
  }
}

// ------------------------- SOCKET.IO SERVER -------------------------
const server = app.listen(process.env.PORT || 5000, () => {
  console.log(`API running at http://localhost:${process.env.PORT || 5000}`);
});

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
  console.log("🟢 Client Connected:", socket.id);

  socket.on("addMessage", async (data) => {
    socket.emit("display", data);
    socket.broadcast.emit("display", data);

    const aiText = await groqAI(data.message, "chat");

    const botReply = {
      id: uuidv4(),
      name: "Chatbot",
      message: aiText,
      time: new Date().toLocaleTimeString(),
    };

    socket.emit("display", botReply);
    socket.broadcast.emit("display", botReply);
  });
});

console.log("⚡ Chatbot + API Server running...");

// ------------------------- AI RENT PREDICTION -------------------------
app.post("/api/ai/predict-rent", async (req, res) => {
  try {
    const { location, sqft, bhk, furnishing } = req.body;

    const prompt = `
You are a rent prediction engine for Indian cities.

Use this formula internally:
- Hyderabad: 18–25 INR per sqft
- Andhra Pradesh (other cities): 10–18 INR per sqft
- Add (BHK × 2000)
- Furnished: +4000, Not furnished: +0

Return ONLY the final rent number.

Location: ${location}
Sqft: ${sqft}
BHK: ${bhk}
Furnishing: ${furnishing}
`;

    const output = await groqAI(prompt, "number");
    const match = output?.match(/\d+/);
    const rent = match ? Number(match[0]) : null;

    res.json({
      price: rent || "N/A",
      raw: output
    });
  } catch (err) {
    res.status(500).json({ error: "Prediction failed", details: err.message });
  }
});

// ------------------------- MAINTENANCE CATEGORY AI -------------------------
app.post("/api/ai/categorize", async (req, res) => {
  const { description } = req.body;

  const prompt = `
Categorize: "${description}"
Return JSON:
{
  "category": "plumbing/electrical/structural/cleaning/other",
  "risk": "low/medium/high"
}
`;

  const result = await groqAI(prompt, "chat");

  try {
    const json = JSON.parse(result.slice(result.indexOf("{"), result.lastIndexOf("}") + 1));
    res.json(json);
  } catch (e) {
    res.json({ category: "other", risk: "low" });
  }
});
