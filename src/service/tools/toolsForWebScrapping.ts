import { DynamicTool } from "@langchain/core/tools"; // 1. Import DynamicTool
import { tavily } from "@tavily/core";
// import { DynamicStructuredTool } from "@langchain/core/tools";
// import {z} from "zod";
const tool = tavily({ apiKey: process.env.TAVILY_API_KEY });

// const calculatorTool = new DynamicTool({
//   name: "calculator",
//   description: "Performs basic arithmetic operations. Input should be a simple mathematical expression (e.g., '2 + 2' or '10 * 5').",
//   func: async (input: string) => { // 3. The function now accepts a single string
//     // ⚠️ WARNING: eval() is unsafe for production. Use a dedicated math library like 'mathjs'.
//     try {
//       return eval(input).toString();
//     } catch (error) {
//       return "Invalid mathematical expression";
//     }
//   },
// });

// lib/tools/jobSearchTool.ts

// interface JobData {
//   job_title: string;
//   employer_name: string;
//   employer_logo: string;
//   job_employment_type: string;
//   job_posted_at: string;
//   job_location: string;
//   job_country: string;
//   job_id: string;
//   job_apply_link: string;
// }

// function extractJobFields(rawJobs: any[]): JobData[] {
//   return rawJobs.map(job => ({
//     job_id: job.job_id,
//     job_title: job.job_title,
//     employer_name: job.employer_name,
//     employer_logo: job.employer_logo || "https://via.placeholder.com/150",
//     job_employment_type: job.job_employment_type,
//     job_posted_at: job.job_posted_at,
//     job_location: job.job_location,
//     job_country: job.job_country,
//     job_apply_link: job.job_apply_link,
//   }));
// }


// export const jobSearchTool = new DynamicStructuredTool({
//   name: "search_jobs",
//   description: "Search for jobs globally. Returns job title, employer, location, and posting details.",
//   schema: z.object({
//     query: z.string().describe("Job search query, e.g., 'developer jobs in chicago'"),
//     page: z.number().optional().default(1).describe("Page number for pagination"),
//     num_pages: z.number().optional().default(1).describe("Number of pages to fetch"),
//     country: z.string().optional().default("IN").describe("Country code (e.g., US, IN, UK)"),
//     date_posted: z.enum(["all", "today", "3days", "week", "month"]).optional().default("all"),
//   }),
//   func: async ({ query, page = 1, num_pages = 1, country = "IN", date_posted = "all" }) => {
//     const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=${page}&num_pages=${num_pages}&country=${country}&date_posted=${date_posted}`;

//     try {
//       const res = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'x-rapidapi-key': process.env.JSEARCH_API_KEY!,
//           'x-rapidapi-host': 'jsearch.p.rapidapi.com',
//         },
//       });

//       if (!res.ok) {
//         const errorText = await res.text();
//         return JSON.stringify({ error: `API error: ${res.status}`, details: errorText });
//       }

//       const data = await res.json();
      
//       // Extract only required fields
//       const cleanedJobs = extractJobFields(data.data || []);
      
//       return JSON.stringify({
//         status: "success",
//         total_results: cleanedJobs.length,
//         jobs: cleanedJobs,
//       });
//     } catch (error) {
//       if (error instanceof Error){
//         return JSON.stringify({ error: 'Failed to fetch jobs', message: error.message });
//       }
//     }
//   },
// });

export const realTimeData=new DynamicTool({
  name:"real time data",
  description:"provide the input and get real time data from tavily search",
  func: async(Input:string)=>{
    try {
         const answer = await tool.search(`${Input}`,{maxResults:3});

         console.log("This is the answer",answer)

  if (answer && answer.results) {
        const formattedResults = answer.results.map((result, index) => 
          `Result ${index + 1}:\nTitle: ${result.title}\nURL: ${result.url}\nContent: ${result.content}`
        ).join("\n\n---\n\n");
        
        return formattedResults;
      }

         return "No results found.";

    } catch (error) {
      console.log(error)
      return "Error fetching real-time data.";
    }
  }
})

export const realTimeNewsData=new DynamicTool({
  name:"Fetch real time news data",
  description:"Provide the input and get real time news data",
  func: async(Input:string)=>{
    try {
  const toolGnews = await fetch(
    `https://newsapi.org/v2/everything?q=${Input}&apiKey=${process.env.NEWS_API_KEY}`
    );

    console.log("Tool is executed and this is the real time news data",toolGnews)

  // if (answer && answer.results) {
  //       const formattedResults = answer.results.map((result, index) => 
  //         `Result ${index + 1}:\nTitle: ${result.title}\nURL: ${result.url}\nContent: ${result.content}`
  //       ).join("\n\n---\n\n");
        
  //       return formattedResults;
  //     }

         return "No results found.";
    } catch (error) {
      console.log(error)
      return "Error fetching real-time data.";
    }
  }
})