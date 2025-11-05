import { ChatGroq } from "@langchain/groq";
import { tavily } from "@tavily/core";
import { DynamicTool } from "@langchain/core/tools";
import { queryEmbedding } from "@/helper/textembedding";
import { pinecone } from "./pinecone.service";
import {
  RecordMetadata,
  ScoredPineconeRecord,
} from "@pinecone-database/pinecone";
import { fetchGoogleData } from "@/lib/api";


interface userEmbeddingData {
  _id: string;
  Proffession: string;
  Skills: string[];
}


const tool = tavily({ apiKey: process.env.TAVILY_API_KEY });


const realTimeData = new DynamicTool({
  name: "real_time_search",
  description:
    "ONLY use if you encounter an unfamiliar skill or technology term. Search query should be the specific term.",
  func: async (Input: string) => {
    try {
      if (!Input || Input.trim().length === 0) {
        return "Invalid query";
      }
      const answer = await tool.search(Input.trim(), { maxResults: 1 });
      if (answer?.results?.[0]) {
        return `${answer.results[0].title}: ${answer.results[0].content.substring(
          0,
          200
        )}`;
      }
      return "No results found";
    } catch (error) {
      console.log(error);
      return "Search unavailable";
    }
  },
});


const googleSearch = new DynamicTool({
  name: "google_search",
  description: "use this tool to return query for google search",
  func: async (Input: string) => {
    try {
      if (!Input || Input.trim().length === 0) {
        return "Invalid query";
      }
      const answer = await fetchGoogleData(Input);
      if (answer?.items.length > 0) {
        return answer.items;
      }
      return "No results found";
    } catch (error) {
      console.log(error);
      return "Search unavailable";
    }
  },
});


function formatMatches(matches: ScoredPineconeRecord<RecordMetadata>[]) {
  return matches
    .map((m, idx) => {
      const meta = m.metadata;
      let skillsText = "Not specified";
      if (Array.isArray(meta?.skills)) {
        skillsText = (meta.skills as string[]).join(", ");
      } else if (typeof meta?.skills === "string") {
        skillsText = meta.skills;
      }
      return `Job ${idx + 1}:
- Job ID: ${meta?.jobId}
- Description: ${meta?.description.toString().slice(0, 300)}
- Skills: ${skillsText}
- Similarity Score: ${m.score?.toFixed(3)}`;
    })
    .join("\n\n");
}


function formatUserData(user: userEmbeddingData) {
  return `User Profile:
- Profession: ${user?.Proffession}
- Skills: ${user?.Skills.join(", ")}`;
}


function extractJobIds(formattedJobs: string): string[] {
  const matches = formattedJobs.match(/Job ID: ([a-f0-9]+)/gi);
  return matches ? matches.map((m) => m.replace("Job ID: ", "")) : [];
}


export async function JobRecomandation(query: string) {
  console.log("Input query:", JSON.parse(query));


  const userData: userEmbeddingData = JSON.parse(query);
  const index = pinecone.index("userembedding");
  const result = await index.fetch([`user-${userData._id}`]);


  if (Object.keys(result.records).length === 0) {
    console.log("User embedding not found in Pinecone, creating new embedding...");
    try {
      const embedding = await queryEmbedding(JSON.stringify(userData));
      const values = Array.isArray(embedding) ? embedding : null;
      if (!values) {
        throw new Error("No embedding generated");
      }
      const vector = [
        {
          id: `user-${userData._id}`,
          values: values,
          metadata: {
            profession: userData.Proffession.toString(),
            skills: userData.Skills.join(", "),
            userId: userData._id.toString(),
          },
        },
      ];
      await index.upsert(vector);
      console.log("User embedding created successfully");
      return [];
    } catch (error) {
      console.error("Error creating user embedding:", error);
      return [];
    }
  }


  const userEmbedding = result.records[`user-${userData._id}`];
  console.log("User embedding found:", userEmbedding.id);


  if (!userEmbedding.values) {
    console.error("User embedding has no values");
    return [];
  }


  try {
    const index2 = pinecone.index("jobs");
    const MIN_RELEVANCE_SCORE = 0.5;
    const queryResponse = await index2.query({
      vector: userEmbedding.values,
      topK: 20,
      includeMetadata: true,
    });


    console.log(`Total matches from Pinecone: ${queryResponse.matches.length}`);
    console.log(
      "Match scores:",
      queryResponse.matches.map((m) => m.score?.toFixed(3))
    );


    const scores = queryResponse.matches.map((m) => m.score || 0);
    const adaptiveThreshold = Math.max(
      MIN_RELEVANCE_SCORE,
      scores.length > 0 ? scores[0] * 0.6 : MIN_RELEVANCE_SCORE
    );


    const relevantMatches = queryResponse.matches.filter(
      (match) => match.score && match.score >= adaptiveThreshold
    );


    console.log(
      `Found ${queryResponse.matches.length} matches, ${relevantMatches.length} above threshold ${adaptiveThreshold.toFixed(3)}`
    );


    if (relevantMatches.length === 0) {
      console.warn("No relevant matches found");
      return [];
    }


    const formattedJobs = formatMatches(relevantMatches);
    const formattedUser = formatUserData(userData);
    const allJobIds = extractJobIds(formattedJobs);


    console.log(`Extracted ${allJobIds.length} job IDs from matches`);


    const model = new ChatGroq({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
    });


    const modelWithTools = model.bindTools([realTimeData, googleSearch]);
    const prompt = `You are a job matching AI analyzing a list of pre-filtered job recommendations tailored for a specific user profile.


USER PROFILE:
${formattedUser}


CANDIDATE JOBS (already filtered by vector similarity):
${formattedJobs}


TOOL AVAILABILITY:
- You have access to the real_time_search tool to look up unknown or new technology terms.
- Use the tool ONLY if you encounter a skill/technology in the jobs or user profile that is completely unfamiliar.
- For common technologies like React, Python, AWS, etc., do NOT use the tool.


ANALYSIS INSTRUCTIONS:
1. Calculate a match percentage for each job based on skill overlap with the user's skills.
2. Take into account transferable skills, for example: React experience partially counts towards Vue.js.
3. Match percentage = (weighted count of matched skills including transferable skills) / (total required skills of the job).
4. Consider years of experience and expertise levels if available to adjust score slightly.
5. Only include jobs where the match percentage is 40% or higher.
6. Exclude jobs that require skills from completely unrelated fields or expertise.
7. Sort the jobs by descending match percentage to rank the most relevant jobs at the top.

OUTPUT FORMAT:
Return ONLY valid JSON with NO markdown or code blocks:
{"jobIds":["jobId1","jobId2"],"jobTitle":"Full Stack Web Developer"}`;


    const response = await modelWithTools.invoke(prompt);
    const content = String(response.content).trim();


    console.log("LLM raw response:", content);


    let jobIds: string[] = [];
    let googleQuery: string | undefined;


    try {
       const cleanContent = content
  .replace(/```/g, "")       // remove all ``` from content
  .replace(/```\s*/g, "")    // remove ``` followed by spaces/newlines
  .trim();

      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON object found in response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      if (
        parsed.jobIds &&
        Array.isArray(parsed.jobIds) &&
        parsed.jobIds.length > 0
      ) {
        jobIds = parsed.jobIds.filter((id: unknown) => typeof id === "string");
      }

      if (typeof parsed.jobTitle === "string" && parsed.jobTitle.trim()) {
        googleQuery = parsed.jobTitle;
      }

      console.log("Parsed jobIds:", jobIds);
      console.log("Parsed google search query:", googleQuery);
    } catch (err) {
      console.error("Failed to parse JSON:", err);

      const idRegex = /["']([a-f0-9]{24})["']/g;
      const matches = content.match(idRegex);
      
      if (matches && matches.length > 0) {
        jobIds = matches
          .map((m) => m.replace(/["']/g, ""))
          .filter((id) => id.length === 24);
      }

      const titleRegex = /"jobTitle"\s*:\s*["']([^"']+)["']/i;
      const titleMatch = content.match(titleRegex);
      if (titleMatch && titleMatch[1]) {
        googleQuery = titleMatch[1];
      }

      console.log("Fallback parse successful, parsed jobIds:", jobIds, "query:", googleQuery);
    }


    jobIds = jobIds.filter((id) => typeof id === "string" && id.trim().length > 0);


    if (jobIds.length > 0) {
      return { jobId: jobIds.slice(0, 15), google: googleQuery };
    }


    console.warn("No job IDs found in LLM response, falling back to vector similarity fallback.");
    return { jobId: allJobIds.slice(0, Math.min(10, allJobIds.length)), google: undefined };
  } catch (error) {
    console.error("Error in job recommendation:", error);
    return [];
  }
}
