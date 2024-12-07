const { Server } = require('socket.io');
const { default: Groq } = require("groq-sdk");
const { v4: uuidv4 } = require('uuid');
const db = require('./db');
require("dotenv").config();

const io=new Server(3000,{
    cors:{
        origin:"*"
    }
})
const messageData=[]
const Users=new Set()
db()
const groq = new Groq({ apiKey: "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" });

async function getGroqChatCompletion(input) {
    return groq.chat.completions.create({
        messages: [
            {
              role: "system",
              content: 
                "You are an expert assistant specializing in rental management. " +
                "Respond to all user queries as a professional rental manager. Ensure all answers are polite, clear, and professional. " +
                "Limit your responses to 2–3 sentences.",
            },
            {
              role: "user",
              content: `The user's input is: ${input}`
            },
            {
              role: "user",
              content: 
                "Based on the input, provide a concise and professional response addressing the user's concerns. Remove any unnecessary information.",
            }
        ],
        model: "llama3-8b-8192",
        max_tokens: 50, 
    });
}

io.on("connection",(socket)=>{
   
   console.log("client is connected with ",socket.id)

   socket.on("addMessage", async (add) => {
    console.log("Message received:", add.message);
    
    try {
        const chatCompletion = await getGroqChatCompletion(add.message);
        const botResponse = chatCompletion.choices[0]?.message?.content || "No response from chatbot.";
        
        const chatbotMessage = {
            id: uuidv4(),
            name: "Chatbot",
            message: botResponse,
            time: new Date().toLocaleTimeString(),
        };
        
        messageData.push(add);
        messageData.push(chatbotMessage);
        
        io.emit("display", add);          
        io.emit("display", chatbotMessage); 
    } catch (error) {
        console.error("Error fetching chatbot response:", error);
    }
});

 
     socket.on("addUsers",(newUser)=>{
        console.log("yvh")
        Users.add(newUser)
        console.log(Array.from(Users))
        io.emit("giveUsers",Array.from(Users))
    })
    

   

})

console.log("server is started http://localhost:3000")