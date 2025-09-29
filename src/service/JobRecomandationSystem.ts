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

const tool = tavily({ apiKey: process.env.TAVILY_API_KEY });

// Fixed real-time data tool
const realTimeData = new DynamicTool({
  name: "real_time_search",
  description: "Search for current job market trends and skill requirements. Use only when you need recent industry data.",
  func: async (Input: string) => {
    try {
      if (!Input || Input.trim().length === 0) {
        return "Please provide a valid search query.";
      }

      const answer = await tool.search(Input.trim(), { maxResults: 2 });

      if (answer && answer.results && answer.results.length > 0) {
        const formattedResults = answer.results
          .map((result, index) => 
            `Result ${index + 1}:\nTitle: ${result.title}\nContent: ${result.content.substring(0, 300)}...`
          )
          .join("\n\n---\n\n");

        return formattedResults;
      }

      return "No relevant search results found.";
    } catch (error) {
      console.log("Search error:", error);
      return "Search temporarily unavailable.";
    }
  },
});

// FIXED News API tool - this was the main cause of the infinite loop
const realTimeNewsData = new DynamicTool({
  name: "job_market_news",
  description: "Get recent news about job market trends. Use sparingly and only for current market insights.",
  func: async (Input: string) => {
    try {
      if (!Input || Input.trim().length === 0) {
        return "Please provide a news search query.";
      }

      if (!process.env.NEWS_API_KEY) {
        return "News service not available.";
      }

      const encodedQuery = encodeURIComponent(Input.trim());
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodedQuery}&apiKey=${process.env.NEWS_API_KEY}&pageSize=3&sortBy=publishedAt`
      );

      // THIS WAS THE MISSING PART - Parse the JSON response
      if (!response.ok) {
        return `News API error: ${response.status}`;
      }

      const data = await response.json();

      if (data.status === "error") {
        return `News error: ${data.message}`;
      }

      if (data.articles && data.articles.length > 0) {
        const formattedResults = data.articles
          .slice(0, 2) // Limit to 2 articles
          .map((article, index) => 
            `News ${index + 1}:\nTitle: ${article.title}\nSummary: ${article.description || 'No summary'}`
          )
          .join("\n\n---\n\n");

        return formattedResults;
      }

      return "No recent news found.";
    } catch (error) {
      console.log("News error:", error);
      return "News service temporarily unavailable.";
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
- Budget: ${meta?.budget}
- Description: ${meta?.description}
- Skills: ${skillsText}`;
  }).join("\n\n");
}

function formatUserData(user: userEmbeddingData) {
  return `User Profile:
- Profession: ${user?.Proffession}
- Skills: ${user?.Skills.join(", ")}`;
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
    } catch (error) {
      console.log(error);
    }
  } else {
    const userEmbedding = result.records[`user-${userData._id}`];
    console.log("This is the user embedding", userEmbedding);

    if (userEmbedding.values) {
      try {
        const index2 = pinecone.index("jobs");

        const queryResponse = await index2.query({
          vector: userEmbedding.values,
          topK: 5,
          includeMetadata: true,
        });

        console.log("These are the matches", queryResponse.matches);
        
        const formattedJobs = formatMatches(queryResponse.matches);   
        const formattedUser = formatUserData(userData);

        console.log("This is the formatted data", formattedJobs);

        // SIMPLIFIED system instruction to prevent tool overuse
        const systemInstruction = `You are an AI Job Recommender. 

CRITICAL: Analyze the user profile and job listings provided below. Do NOT use web search tools unless you encounter unknown skills or need recent industry data.

Task:
1. Compare user skills and profession with job requirements
2. Rank jobs by relevance (best matches first)  
3. Return ONLY a JSON array of job IDs in order

Output format: ["job-id-1", "job-id-2", "job-id-3"]

IMPORTANT: Return the JSON array immediately without explanations or tool usage unless absolutely necessary.`;

        const model = new ChatGroq({
          model: "llama-3.3-70b-versatile",
          temperature: 0,
        });

        const tools = [realTimeData, realTimeNewsData];
        const prompt = await pull<PromptTemplate>("hwchase17/react");

        const agent = await createReactAgent({
          llm: model,
          tools,
          prompt,
        });

        // KEY FIXES for max iterations error
        const executor = new AgentExecutor({
          agent,
          tools,
          verbose: false, // Set to false to reduce noise
          maxIterations: 3, // REDUCED from 5 to prevent loops
          earlyStoppingMethod: "force", // Force stop when max reached
          handleParsingErrors: true, // Handle parsing errors gracefully
          // maxExecutionTime: 20000, // 20 second timeout
        });

        console.log("This is the query:", query);

        try {
          const response = await executor.invoke({
            input: `${systemInstruction}\n\n${formattedUser}\n\nJobs:\n${formattedJobs}`,
          });

          console.log("Agent response:", response.output);

          return response.output;
        } catch (error) {
          console.log("Error during agent execution:", error);
         return []; 
          // If agent fails, return a basic recommendation based on vector similarity
                 }
      } catch (error) {
        console.log("Error in querying pinecone", error);
        return "Error processing job recommendations";
      }
    }
  }
}
