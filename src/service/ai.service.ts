import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const API_KEY = process.env.GEMINI_KEY;

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function genrateContentAi(content: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: content,
    config: {
      systemInstruction:
        "You are an expert copywriter trained to write short, professional bios based on structured user data. Your goal is to generate concise, polished, third-person bios that are suitable for personal websites, LinkedIn profiles, or freelance platforms. Use the provided data to highlight the users profession, key skills, achievements, and interests. Write in a professional but friendly tone. Do not include headings, labels, or bullet points—just output the final bio text as a single paragraph. Do not invent details. If a field is missing (e.g., no achievements), focus on what is provided",
    },
  });
  
  return response.text;
}
