import { ChatGroq } from "@langchain/groq";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import type { PromptTemplate } from "@langchain/core/prompts";
import { realTimeData } from "./tools/toolsForWebScrapping";
import { realTimeNewsData } from "./tools/toolsForWebScrapping";

// import { tavily } from "@tavily/core";

// const tool = tavily({ apiKey: process.env.TAVILY_API_KEY });

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


// const realTimeData=new DynamicTool({
//   name:"real time data",
//   description:"provide the input and get real time data from tavily search",
//   func: async(Input:string)=>{
//     try {
//          const answer = await tool.search(`${Input}`,{maxResults:3});

//          console.log("This is the answer",answer)

//   if (answer && answer.results) {
//         const formattedResults = answer.results.map((result, index) => 
//           `Result ${index + 1}:\nTitle: ${result.title}\nURL: ${result.url}\nContent: ${result.content}`
//         ).join("\n\n---\n\n");
        
//         return formattedResults;
//       }

//          return "No results found.";

//     } catch (error) {
//       console.log(error)
//       return "Error fetching real-time data.";
//     }
//   }
// })

// const realTimeNewsData=new DynamicTool({
//   name:"Fetch real time news data",
//   description:"Provide the input and get real time news data",
//   func: async(Input:string)=>{
//     try {
//   const toolGnews = await fetch(
//     `https://newsapi.org/v2/everything?q=${Input}&apiKey=${process.env.NEWS_API_KEY}`
//     );

//     console.log("Tool is executed and this is the real time news data",toolGnews)

//   // if (answer && answer.results) {
//   //       const formattedResults = answer.results.map((result, index) => 
//   //         `Result ${index + 1}:\nTitle: ${result.title}\nURL: ${result.url}\nContent: ${result.content}`
//   //       ).join("\n\n---\n\n");
        
//   //       return formattedResults;
//   //     }

//          return "No results found.";
//     } catch (error) {
//       console.log(error)
//       return "Error fetching real-time data.";
//     }
//   }
// })

export async function groqCalling(query: string) {
  const model = new ChatGroq({
    apiKey:process.env.GROQ_KEY_2,
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    temperature: 1,
    maxTokens:1024,
  });

  const tools = [realTimeData,realTimeNewsData];

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
     // Add maxIterations to prevent infinite loops during debugging
    maxIterations: 5
  });

  console.log("This is the query:", query);

try {
    const response = await executor.invoke({
      input: query,
    });
  
    console.log("Agent response:", response.output);
    return response.output;

} catch (error) {
  console.log("Error during agent execution :",error);
  return "An error occurred while processing your result";
  }
}
