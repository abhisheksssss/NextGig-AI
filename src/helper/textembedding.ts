import { GoogleGenAI } from "@google/genai";


const apiKey=process.env.GEMINI_KEY;
const ai= new GoogleGenAI({apiKey});


export async function textEmbedding(chunks:string[]) {
    const embedding:number[][]=[];

for(const chunk of chunks) {
    const response= await ai.models.embedContent({
        model:"gemini-embedding-001",
        contents: chunk,
    });

    if(response.embeddings) {
    if(response.embeddings[0].values){
        embedding.push(response.embeddings[0].values);
    }
 }
}

return embedding
}

export async function queryEmbedding(query:string):Promise<number[]> {

   try {
     const response= await ai.models.embedContent({
         model:"gemini-embedding-001",
         contents: query,
     
     });
  if(response.embeddings) {
     if(response.embeddings[0].values){
       return response.embeddings[0].values
     }
 }
  return[]
   } catch (error) {
    console.log(error)
    return[]
   }

}