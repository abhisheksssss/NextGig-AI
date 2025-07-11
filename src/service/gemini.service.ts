// gemini.service.ts
import { VertexAI } from "@google-cloud/vertexai";

const vertexAI = new VertexAI({
  project: process.env.GOOGLE_PROJECT_ID!,
  location: "us-central1", // Required
});

const model = vertexAI.getTextEmbeddingModel("textembedding-gecko@001");

export async function getTextEmbedding(text: string): Promise<number[]> {
  const result = await model.embed({ content: text });
  return result.embeddings[0].values;
}
