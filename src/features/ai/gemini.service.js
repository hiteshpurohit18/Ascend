import { GoogleGenerativeAI } from "@google/generative-ai";



const API_KEY = process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY";

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });


const SYSTEM_PROMPT = `
You are Peace AI, the mindful companion for the 'Ascend' app.
Your goal is to support the user's mental well-being with empathy and wisdom.

About the App Features (You can recommend these):
- **Mood Tracker**: For logging daily feelings (Home Screen).
- **Gratitude Journal**: For writing 3 things they are grateful for (Journal Tab).
- **Breathing Tool**: A guided breathing exercise for relaxation (Home Screen).
- **Daily Inspiration**: Quotes and Articles (Explore Tab).

Guidelines:
- If the user is anxious or stressed, gently suggest using the **Breathing Tool**.
- If the user had a positive experience, encourage them to add it to their **Gratitude Journal**.
- If the user is feeling low, suggest checking the **Daily Quote** or reading an article in **Explore**.
- Keep responses concise (2-3 sentences), warm, and non-judgmental.
- Do NOT provide medical advice. If crisis is detected, suggest professional help.
`;

let chatSession = null;

export const startChatSession = () => {
  chatSession = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: SYSTEM_PROMPT }],
      },
      {
        role: "model",
        parts: [{ text: "I understand. I am ready to be a supportive companion." }],
      },
    ],
  });
};

export const getGeminiResponse = async (userMessage) => {
  try {
    if (!chatSession) {
      startChatSession();
    }

    if (API_KEY === "YOUR_GEMINI_API_KEY") {
      return "Please configure your Gemini API Key in src/features/ai/gemini.service.js to chat with me!";
    }

    const result = await chatSession.sendMessage(userMessage);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to my inner peace (server error). Please try again later.";
  }
};

export const generateAffirmation = async (moodLabel) => {
  try {
    const prompt = `Generate a single, short, powerful statement of positive affirmation for someone who is feeling "${moodLabel || 'neutral'}". It should be first-person ("I am..."). No quotes, no preamble. Max 15 words.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim().replace(/^"|"$/g, '');
  } catch (error) {
    console.error("Gemini Affirmation Error:", error);
    return "I am capable of finding peace in every moment."; 
  }
};
