// Rental-backend/utils/aiHelper.js
const axios = require("axios");
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const OPENAI_KEY = process.env.OPENAI_KEY;

async function groqAI(prompt, system = "You are an assistant.") {
  if (GROQ_API_KEY) {
    try {
      const resp = await axios.post(
        "https://api.groq.ai/v1/chat/completions",
        { model: "llama3-8b-8192", messages: [{ role: "system", content: system }, { role: "user", content: prompt }], max_tokens: 80 },
        { headers: { Authorization: `Bearer ${GROQ_API_KEY}` } }
      );
      return resp.data.choices[0]?.message?.content || "";
    } catch (err) {
      console.warn("Groq error:", err.response?.data || err.message);
    }
  }

  if (OPENAI_KEY) {
    try {
      const resp = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        { model: "gpt-4o-mini", messages: [{ role: "system", content: system }, { role: "user", content: prompt }], max_tokens: 80 },
        { headers: { Authorization: `Bearer ${OPENAI_KEY}` } }
      );
      return resp.data.choices[0]?.message?.content || "";
    } catch (err) {
      console.warn("OpenAI error:", err.response?.data || err.message);
    }
  }

  throw new Error("No AI key configured (set GROQ_API_KEY or OPENAI_KEY)");
}

module.exports = { groqAI };
