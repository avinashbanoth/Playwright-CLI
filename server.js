require("dotenv").config();
const express = require("express");
const { ChatGroq } = require("@langchain/groq");
const { SystemMessage, HumanMessage } = require("@langchain/core/messages");
const { exec } = require("child_process");
const path = require("path");

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static("public"));

// 1. Initialize the Groq Model
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0, // Keep it deterministic
});

// Helper function to trigger Playwright CLI
function triggerAmazonSearch(productName) {
  const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(productName)}`;
  const profilePath = path.resolve(__dirname, "playwright-profile", "amazon-cli-visible");
  const command = `npx playwright-cli -s=amazonlive open "${searchUrl}" --browser=chrome --headed --persistent --profile="${profilePath}"`;

  console.log(`[Web AI] Executing Playwright CLI for: ${productName}...`);
  exec(command);
  return `I have opened a new window and searched Amazon for "${productName}".`;
}

// 3. Chat Endpoint
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided" });

  try {
    const systemPrompt = `You are a professional AI Shopping Assistant for Amazon India.

CORE ABILITY:
If the user wants to see, find, or search for a product, you must respond with a JSON block in this exact format:
SEARCH_TRIGGER: {"product": "name of product"}

Example:
User: Find me a red dress.
Assistant: SEARCH_TRIGGER: {"product": "red dress"}

If it's just general chat, respond normally.
DO NOT use any other tool-calling tags or XML. Only use the SEARCH_TRIGGER: format.`;

    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(message)
    ];

    const response = await model.invoke(messages);
    const content = response.content;

    // Check if the model triggered a search using our manual format
    if (content.includes("SEARCH_TRIGGER:")) {
      try {
        const jsonPart = content.split("SEARCH_TRIGGER:")[1].trim();
        const searchData = JSON.parse(jsonPart);
        const productName = searchData.product;
        
        const resultText = triggerAmazonSearch(productName);
        return res.json({ content: resultText, toolTriggered: true });
      } catch (parseErr) {
        console.error("Manual Parse Error:", parseErr);
        // Fallback if parsing fails
        return res.json({ content: content, toolTriggered: false });
      }
    }

    // Normal chat response
    res.json({ content: content, toolTriggered: false });

  } catch (error) {
    console.error("Chat Error:", error);
    res.json({ 
      content: "I'm having a bit of trouble right now. Can we talk about groceries instead?", 
      toolTriggered: false 
    });
  }
});

app.listen(port, () => {
  console.log(`--------------------------------------------------`);
  console.log(`🛒 AI Shopping Assistant Web UI (Stable Mode)`);
  console.log(`URL: http://localhost:3000`);
  console.log(`--------------------------------------------------`);
});
