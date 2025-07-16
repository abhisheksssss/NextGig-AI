import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI= new GoogleGenerativeAI(process.env.GEMINI_KEY!)

interface SkillsResponse {
  relatedSkills: string[];
}
interface SkillsResponse1{
  relatedSkills: string[];
   relatedProfession:string[];
}

function cleanJsonResponse(text: string): string {
  return text.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(fn: () => Promise<T>, retries = 5, delayMs = 2000): Promise<T> {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < retries - 1) {
        console.log(`Attempt ${i + 1} failed, retrying in ${delayMs * (i + 1)}ms...`);
        await delay(delayMs * (i + 1));
      }
    }
  }
  throw lastError;
}

export async function generateRelatedSkills(profession: string, currentSkills: string[]): Promise<SkillsResponse> {

  // Use a supported model for v1beta API. If overloaded, try again later or switch to another available model.
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-8b",
    systemInstruction: `You are an AI expert in professional skill recommendations. When given a profession and current skills:
    1. Analyze the profession and current skill set
    2. Return a JSON object containing:
       - relatedSkills: An array of exactly 20 relevant technical and soft skills that complement their current skills. The array MUST include all skills passed in currentSkills, and the rest should be highly relevant to the profession and current skills.
    3. Ensure all recommendations are directly relevant to their profession
    4. Focus on in-demand and emerging skills in their field
    5. Return ONLY the JSON object, no additional text, and do not include any markdown formatting or code blocks.`
  });

  const prompt = `
    Generate an array of exactly 30 related skills for a ${profession} with the following current skills:
    ${currentSkills.join(", ")}
    The array MUST include all skills listed above, and the rest should be highly relevant to the profession and current skills. Return ONLY a valid JSON object with a single key 'relatedSkills'. Do not include any markdown formatting or code blocks.
  `;

  try {
    const result = await withRetry(async () => {
      const generatedContent = await model.generateContent(prompt);
      return generatedContent.response;
    });
    const text = result.text();
    const cleanedText = cleanJsonResponse(text);
    console.log("THis is the genrated text", cleanedText);
    return JSON.parse(cleanedText) as SkillsResponse;
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    return {
      relatedSkills: []
    };
  }
}



export async function getRelatedSkilldForClient(prompt:string):Promise<SkillsResponse1>{

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-8b",
  systemInstruction: `You are an AI expert in professional skill recommendations. When given a prompt of current skills:
    1. Analyze the current skill set.
    2. Return a JSON object containing:
       - relatedSkills: An array of exactly 20 relevant technical skills that complement their current skills. The array MUST include some skills passed in currentSkills, and the rest should be highly relevant to the profession and current skills.
       - relatedProfession: An array of 20 professions that are highly relevant or commonly associated with the provided skills.
    3. Ensure all recommendations are directly relevant to their profession.
    4. Focus on in-demand and emerging skills in their field.
    5. Return ONLY the JSON object, no additional text, and do not include any markdown formatting or code blocks.`
})

try {
  const result=await withRetry(async()=>{
    const generatedContent=await model.generateContent(prompt);
    return generatedContent.response;
  })
  const text= result.text();
  const cleanedText=cleanJsonResponse(text);
  console.log("This is the genrated text",cleanedText); 
   return JSON.parse(cleanedText) as SkillsResponse1;
} catch (error) {
  console.log(error)
  return{
      relatedSkills: [] ,
      relatedProfession:[]
  }
}

}
