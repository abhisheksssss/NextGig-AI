import { ChatGroq } from "@langchain/groq";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { DynamicTool } from "@langchain/core/tools";
import { type PromptTemplate } from "@langchain/core/prompts";
import { tavily } from "@tavily/core";
import { queryEmbedding } from "@/helper/textembedding";
import { pinecone } from "./pinecone.service";
import { RecordMetadata, ScoredPineconeRecord } from "@pinecone-database/pinecone";

interface userEmbeddingData {
  _id: string;
  Proffession: string;
  Skills: string[];
}

// interface Article {
//   author: string | null;
//   title: string;
//   description: string;
//   url: string;
//   urlToImage: string;
//   publishedAt: string;
//   content: string;
// }

const tool = tavily({ apiKey: process.env.TAVILY_API_KEY });

// Simplified search tool
const realTimeData = new DynamicTool({
  name: "real_time_search",
  description: "ONLY use if you encounter an unfamiliar skill or technology term. Search query should be the specific term.",
  func: async (Input: string) => {
    try {
      if (!Input || Input.trim().length === 0) {
        return "Invalid query";
      }

      const answer = await tool.search(Input.trim(), { maxResults: 1 });

      if (answer?.results?.[0]) {
        return `${answer.results[0].title}: ${answer.results[0].content.substring(0, 200)}`;
      }

      return "No results found";
    } catch (error) {
      console.log(error)
      return "Search unavailable";
    }
  },
});

function formatMatches(matches: ScoredPineconeRecord<RecordMetadata>[]) {
  return matches.map((m, idx) => {
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
- Skills: ${skillsText}`;
  }).join("\n\n");
}

function formatUserData(user: userEmbeddingData) {
  return `User Profile:
- Profession: ${user?.Proffession}
- Skills: ${user?.Skills.join(", ")}`;
}

// Extract job IDs from formatted text
function extractJobIds(formattedJobs: string): string[] {
  const matches = formattedJobs.match(/Job ID: ([a-f0-9]+)/gi);
  return matches ? matches.map(m => m.replace("Job ID: ", "")) : [];
}

export async function JobRecomandation(query: string) {
  console.log(JSON.parse(query));

  const userData: userEmbeddingData = JSON.parse(query)[0];
  const index = pinecone.index("userembedding");
  const result = await index.fetch([`user-${userData._id}`]);

  if (Object.keys(result.records).length === 0) {
    console.log("data not found in pinecone");

    try {
      const embedding = await queryEmbedding(JSON.stringify(query));
      const values = Array.isArray(embedding) && embedding;

      if (!values) {
        throw new Error("No embedding generated");
      }

      const vector = [
        {
          id: `user-${userData._id}`,
          values: values,
          metadata: {
            text: userData.Proffession.toString(),
            userId: userData._id.toString(),
          },
        },
      ];

      await index.upsert(vector);
      console.log("data is inserted in pinecone");
      return [];
    } catch (error) {
      console.log(error);
      return [];
    }
  } else {
    const userEmbedding = result.records[`user-${userData._id}`];
    console.log("This is the user embedding", userEmbedding);

    if (userEmbedding.values) {
      try {
        const index2 = pinecone.index("jobs");

const MIN_RELEVANCE_SCORE = 0.7;

        const queryResponse = await index2.query({
          vector: userEmbedding.values,
          topK: 10,
          includeMetadata: true,
        });

        const relevantMatches = queryResponse.matches.filter(
  (match) => match.score && match.score >= MIN_RELEVANCE_SCORE
);


 console.log(
  `Found ${queryResponse.matches.length} matches, but only ${relevantMatches.length} are above the relevance threshold.`
);

        const formattedJobs = formatMatches(relevantMatches);
        const formattedUser = formatUserData(userData);
        const allJobIds = extractJobIds(formattedJobs);

        console.log("This is the formatted data", formattedJobs);

        // OPTION 1: Simple LLM without agent (RECOMMENDED)
        const useSimpleApproach = true;

        if (useSimpleApproach) {
          const model = new ChatGroq({
            model: "llama-3.3-70b-versatile",
            temperature: 0,
          });

          const prompt = `You are a job matching expert.

USER PROFILE:
${formattedUser}

JOB LISTINGS (ranked by AI similarity):
${formattedJobs}

TASK:
Return a JSON array of job IDs that match the user's profile.
- Include relevant and partially relevant jobs
- Exclude only completely irrelevant jobs
- Keep the order (best matches first)

CRITICAL: Your response must be ONLY a valid JSON array like this:
["68d775e3ae9358206712f4cb", "6899d95b94a47420dded52b0"]

No explanations, no markdown, just the JSON array.`;

          const response = await model.invoke(prompt);
          const content = response.content.toString();

          // Parse JSON from response
          const jsonMatch = content.match(/\[[\s\S]*?\]/);
          if (jsonMatch) {
            try {
              const jobIds = JSON.parse(jsonMatch[0]);
              console.log("Recommended jobs:", jobIds);
              return jobIds;
            } catch (e) {
              console.log("JSON parse error, returning top matches",e);
              return allJobIds.slice(0, 10);
            }
          }

          return allJobIds.slice(0, 10);
        }

        // OPTION 2: Fixed Agent approach (if tools are needed)
        const systemInstruction = `You are a job recommendation system. 

STRICT RULES:
1. Compare the user profile with job listings
2. ONLY use tools if you encounter unfamiliar technology terms
3. Return job IDs as a JSON array: ["id1", "id2"]
4. NO explanations, ONLY the JSON array

Think step by step:
- Do I know all these skills? If yes, skip tools
- Which jobs match the user's profession and skills?
- Return the matching job IDs in JSON format`;

        const model = new ChatGroq({
          model: "llama-3.3-70b-versatile",
          temperature: 0,
        });

        const tools = [realTimeData]; // Only one tool
        const prompt = await pull<PromptTemplate>("hwchase17/react");

        const agent = await createReactAgent({
          llm: model,
          tools,
          prompt,
        });

        const executor = new AgentExecutor({
          agent,
          tools,
          verbose: true,
          maxIterations: 2, // Reduced to 2
          earlyStoppingMethod: "force",
          handleParsingErrors: true,
          returnIntermediateSteps: false,
        });

        console.log("This is the query:", query);

        try {
          const response = await executor.invoke({
            input: `${systemInstruction}

${formattedUser}

${formattedJobs}

Return ONLY the JSON array of matching job IDs.`,
          });

          console.log("Agent response:", response.output);

          // Try to extract JSON from agent output
          const outputStr = response.output.toString();
          const jsonMatch = outputStr.match(/\[[\s\S]*?\]/);

          if (jsonMatch) {
            try {
              const jobIds = JSON.parse(jsonMatch[0]);
              return jobIds;
            } catch (e) {
              console.log("Failed to parse agent output",e);
            }
          }

          // Fallback: return top matches from vector search
          return allJobIds.slice(0, 10);
        } catch (error) {
          console.log("Agent error:", error);
          // Fallback to vector similarity ranking
          return allJobIds.slice(0, 10);
        }
      } catch (error) {
        console.log("Error in querying pinecone", error);
        return [];
      }
    }
    return [];
  }
}