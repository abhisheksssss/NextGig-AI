import { ChatGroq } from "@langchain/groq";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { DynamicTool } from "@langchain/core/tools"; // 1. Import DynamicTool
import type { PromptTemplate } from "@langchain/core/prompts";
import { tavily } from "@tavily/core";
import Redis from "ioredis";
import { log } from "console";
import { queryEmbedding } from "@/helper/textembedding";
import { pinecone } from "./pinecone.service";

interface userEmbeddingData{
    _id: string;
     Proffession: string,
     Skills: string[]
}


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


const realTimeData=new DynamicTool({
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
const realTimeNewsData=new DynamicTool({
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



export async function JobRecomandation(query: string) {

console.log(JSON.parse(query))

const userData:userEmbeddingData=(JSON.parse(query))[0];

const index = pinecone.index("userembedding");

const result = await index.fetch([`user-${userData._id}`]);



if(Object.keys(result.records).length === 0){

console.log("data not founded in pinecone")

  try {
  
  
   
    
    const embedding = await queryEmbedding(JSON.stringify(query));
  
   // Ensure embedding is a number[]
    const values = Array.isArray(embedding) && embedding ;
  
    if(!values){
      throw new Error("No embedding gnerated")
    }
  
  
      const vector = [
      {
        id: `user-${userData._id}`,
        values: values,
        metadata: {
          text: userData.Proffession.toString(), // or whole job text
          userId: userData._id.toString(),
        },
      },
    ];
    
      await index.upsert(vector);
  
  
  console.log("data is inserted in pinecone")
  
  } catch (error) {
    console.log(error)
  }
}else{
  console.log("This is the result",result)

  const userEmbedding= result.records.values;

console.log("This is the user embedding",userEmbedding)

  
}






//   const model = new ChatGroq({
//     model: "llama-3.3-70b-versatile",
//     temperature: 0,
//   });

//   const tools = [realTimeData,realTimeNewsData];

//   const prompt = await pull<PromptTemplate>("hwchase17/react");

//   const agent = await createReactAgent({
//     llm: model,
//     tools,
//     prompt,
//   });

//   const executor = new AgentExecutor({
//     agent,
//     tools,
//     verbose: true,
//      // Add maxIterations to prevent infinite loops during debugging
//     maxIterations: 5
//   });

//   console.log("This is the query:", query);

// try {
//     const response = await executor.invoke({
//       input: query,
//     });
  
//     console.log("Agent response:", response.output);
//     return response.output;

// } catch (error) {
//   console.log("Error during agent execution :",error);
//   return "An error occurred while processing your result";
//   }
}



//work flow   fetch data from mongo db 