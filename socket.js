require("dotenv").config();
const { Server } = require("socket.io");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const GROQ_API_KEY = process.env.GROQ_API_KEY;
async function groqAI(prompt) {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "openai/gpt-oss-120b",   // ✅ 100% working model
        messages: [
          { role: "system", content: "You are a helpful rental management assistant." },
          { role: "user", content: prompt }
        ],
        max_tokens: 200
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (err) {
    console.error("AI Error:", err?.response?.data || err.message);
    return "Sorry, I couldn't process that.";
  }
}


const io = new Server(3000, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Client Connected:", socket.id);

  socket.on("addMessage", async (data) => {
    // broadcast user message
    socket.emit("display", data);
    socket.broadcast.emit("display", data);

    // generate AI reply
    const aiText = await groqAI(data.message);

    const botReply = {
      id: uuidv4(),
      name: "Chatbot",
      message: aiText,
      time: new Date().toLocaleTimeString(),
    };

    // send bot reply
    socket.emit("display", botReply);
    socket.broadcast.emit("display", botReply);
  });
});

console.log("⚡ Chatbot Socket.io running at ws://localhost:3000");
