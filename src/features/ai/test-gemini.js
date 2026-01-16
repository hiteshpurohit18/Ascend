const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = "AIzaSyClg7t5ujsoB1HFE6ThmXLqD5aqGimxC6A";

async function listModels() {
  const genAI = new GoogleGenerativeAI(API_KEY);
  console.log("Fetching models...");
  try {
    const modelsResponse = await genAI.getGenerativeModel({ model: "gemini-pro" }).cachedModel; 
    // Wait, the SDK doesn't have a direct "listModels" on the instance easily exposed in all versions?
    // Actually the API manager has it.
    // Let's try to just hit the endpoint via fetch if the SDK is tricky in node without setup.
    // But SDK has `genAI.getGenerativeModel`.
    
    // There is no `listModels` method on the main `GoogleGenerativeAI` class in some versions.
    // However, we can infer support.
    
    // Let's try a standard fetch to the API directly to be sure.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await response.json();
    console.log("Available Models:");
    if (data.models) {
      data.models.forEach(m => {
        if (m.supportedGenerationMethods.includes("generateContent")) {
           console.log(`- ${m.name}`);
        }
      });
    } else {
      console.log("No models found or error:", data);
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

listModels();
