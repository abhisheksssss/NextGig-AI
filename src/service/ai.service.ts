import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const API_KEY = process.env.GEMINI_KEY;

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function genrateContentAi(content: string,userQuestion:string) {
  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash-8b",
    contents: userQuestion,
    config: {
      systemInstruction:
        `Use the following context:\n${content}\n\nAnswer the question: ${userQuestion}`,
    },
  });
  
  return response.text;
}


