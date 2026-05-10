require("dotenv").config();
const { ChatGroq } = require("@langchain/groq");
const { DynamicStructuredTool } = require("@langchain/core/tools");
const { z } = require("zod");
const { initializeAmazonSession, searchAmazon } = require("./amazon-auth");
const readline = require("readline");

// 1. Initialize the Groq Model
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0.7,
});

const { exec } = require("child_process");
const path = require("path");

// 2. Define the Amazon Search Tool
const amazonSearchTool = new DynamicStructuredTool({
  name: "search_amazon",
  description: "Searches for a product on Amazon India using the Playwright CLI. Use this when the user wants to see results in a visible browser window.",
  schema: z.object({
    productName: z.string().describe("The name of the product to search for"),
  }),
  func: async ({ productName }) => {
    const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(productName)}`;
    const profilePath = path.resolve(__dirname, "playwright-profile", "amazon-cli-visible");
    
    // Construct the playwright-cli command as requested
    const command = `npx playwright-cli -s=amazonlive open "${searchUrl}" --browser=chrome --headed --persistent --profile="${profilePath}"`;

    console.log(`\n[AI Tool] Executing Playwright CLI for: ${productName}...`);
    
    return new Promise((resolve) => {
      exec(command, (error) => {
        if (error) {
          resolve(`Failed to launch Playwright CLI: ${error.message}`);
        } else {
          resolve(`Playwright CLI has been launched. A visible browser window should now be open showing results for "${productName}".`);
        }
      });
    });
  },
});

const tools = [amazonSearchTool];
const modelWithTools = model.bindTools(tools);

// 3. Main Chat Loop
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  console.log("--------------------------------------------------");
  console.log("🛒 AI Shopping Assistant (Groq + LangChain)");
  console.log("Chat about groceries or say a product name to see it on Amazon.");
  console.log("Type 'exit' to quit.");
  console.log("--------------------------------------------------");

  const askQuestion = () => {
    rl.question("\nYou: ", async (input) => {
      if (input.toLowerCase() === "exit") {
        rl.close();
        return;
      }

      try {
        // Simple chat logic: Let the LLM decide if it needs to use a tool
        const response = await modelWithTools.invoke(input);

        if (response.tool_calls && response.tool_calls.length > 0) {
          for (const toolCall of response.tool_calls) {
            const result = await amazonSearchTool.invoke(toolCall.args);
            console.log(`\nAssistant: ${result}`);
          }
        } else {
          console.log(`\nAssistant: ${response.content}`);
        }
      } catch (error) {
        console.error("Error:", error.message);
      }

      askQuestion();
    });
  };

  askQuestion();
}

if (!process.env.GROQ_API_KEY) {
  console.error("Error: GROQ_API_KEY is missing in your .env file.");
  process.exit(1);
}

main();
