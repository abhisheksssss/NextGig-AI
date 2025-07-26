import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation, MemorySaver, Annotation } from "@langchain/langgraph";
import { tavily } from '@tavily/core'




// Define a custom state that extends MessagesAnnotation
const MyState = Annotation.Root({
  ...MessagesAnnotation.spec,
  intent: Annotation<string>(),
  analytics: Annotation<string>(),
  realtime: Annotation<string>(),
  direct: Annotation<string>(),
  realtimejobs:Annotation<string>()
});

// Helper function to extract string content from AI messages
function extractContent(content: any): string {
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content)) {
    return content.map(item => {
      if (typeof item === 'string') return item;
      if (item.text) return item.text;
      if (item.content) return item.content;
      return JSON.stringify(item);
    }).join(' ');
  }
  if (content && typeof content === 'object') {
    if (content.text) return content.text;
    if (content.content) return content.content;
    return JSON.stringify(content);
  }
  return String(content || '');
}

// **FIX: Only use the current question's answer, not accumulate all states**
async function generateAnswer(state: typeof MyState.State) {
  let answer = "";
  
  // **KEY FIX: Only use the current intent's result, clear others**
  if (state.intent === "analytics" && state.analytics) {
    answer = state.analytics;
  } else if (state.intent === "realtime" && state.realtime) {
    answer = state.realtime;
  } else if (state.intent === "other" && state.direct) {
    answer = state.direct;
  }else if(state.intent==="realtimejobs" && state.realtimejobs){
    answer=state.realtimejobs
  }

  console.log("This is the generated answer", { messages: [...(state.messages || []), new AIMessage(answer)] });
  
  // **FIX: Clear the state values after using them to prevent accumulation**
  return { 
    messages: [...(state.messages || []), new AIMessage(answer)],
    analytics: "",
    realtime: "",
    direct: ""
  };
}

async function fetchAnalytics(state: typeof MyState.State) {
  return { 
    analytics: "Analytics: pageviews last week were 17,203.\n",
    // Clear other states
    realtime: "",
    direct: ""
  };
}
async function doNotAnswer(state: typeof MyState.State) {
  return { 
    analytics: "I can only anser the question related to you profile and jobs",
    // Clear other states
    realtime: "",
    direct: ""
  };
}

// **FIX: Improved intent classification with conversation context**
async function classifyIntent({ messages }: typeof MyState.State) {
  console.log("These are the messages", messages);

  const userMsg = messages[messages.length - 1]?.content || "";
  
  // **FIX: Include conversation context for better intent classification**
  const conversationContext = messages.slice(-3).map(msg => 
    `${msg.constructor.name === 'HumanMessage' ? 'User' : 'Assistant'}: ${extractContent(msg.content)}`
  ).join('\n');

  const gemini = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash-8b",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
  });
  
  const intentSystemPrompt = `You are an intent classifier. Based on the conversation context and the latest user message, classify the user's intent as one of: analytics, realtime, or other.

INTENT DEFINITIONS:
- analytics: If user ask the analysis about their profile . eg:- user: How can I improve my profile
 -realtimejobs: questions about current/live information jobs,job market news etc.
- realtime: questions about current/live information like current events, sports scores
- other: general questions, greetings, or conversations that don't fit the above
- blocked: any message not related to jobs, careers, hiring, recruitment, resume building, interviews, skill development, freelancing, job platforms, or job market trends

IMPORTANT: Consider the conversation context. If the previous conversation was about weather and the user asks "what about new york", this is still a REALTIME weather request.

CONVERSATION CONTEXT:
${conversationContext}

LATEST USER MESSAGE: ${userMsg}

Reply with ONLY one word: analytics, realtime,realtimejobs,or other.

`;
  
  const intentResp = await gemini.invoke([
    new HumanMessage(intentSystemPrompt),
  ]);
  
  const intent = extractContent(intentResp.content).toLowerCase().trim();
  console.log("This is intent:", intent);
  return { 
    intent,
    // Clear other states
    analytics: "",
    realtimejobs:"",
    realtime: "",
    direct: ""
  };
}

async function fallbackNode({ messages }: typeof MyState.State) {
  const gemini = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash-8b",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
  });
  
  const aiMsg = await gemini.invoke(messages);
  console.log("This is the ai response", aiMsg);

  return { 
    direct: extractContent(aiMsg.content),
    // Clear other states
    analytics: "",
    realtime: ""
  };
}
async function fetchRealTime({messages}:typeof MyState.State) {
  try {
console.log("These are the messages by human",messages)
  const userMsg = messages[messages.length - 1]?.content || "";

   const tool = tavily({ apiKey: process.env.TAVILY_API_KEY });
const answer=await tool.search(`${userMsg}`) 

console.log("This is the answer of real time",answer)

const data =JSON.stringify(answer.results.slice(0,2).map((m)=>(
  {
    content:m.content
  }
)))

 const gemini = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash-8b",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
  });


const systemPrompt = `You are a helpful AI assistant.

Your job is to generate a clear and natural paragraph-based answer using ONLY the information provided. You must not add or infer any external data.

✳️ Style & Rules:
- Write complete sentences.
- Do NOT copy raw data directly—rephrase it into smooth, human language.
- Do NOT invent or hallucinate facts. Only summarize what's given.
- Use paragraph form, not fragments or staccato style like: "Title: X. Data: Y."
- Use a friendly, informative tone.

✳️ Format:
- You may use 1-2 short paragraphs max.
- If the user asked a specific question, make sure the answer is relevant to it.
- Gracefully skip any missing fields.

STRICT INSTRUCTIONS:
- Do NOT mention missing data.
- Do NOT infer or assume anything.
- If the data is not present, DO NOT respond or simply say "Data not available."
- Do NOT add explanations or definitions unless they are in the data.

PROVIDED INFORMATION:
${data}

LATEST USER MESSAGE (question or query):
${userMsg}

Your final output should be a smooth, well-written paragraph based only on the above.}`;

// 👇 AI Invocation
const aiRes = await gemini.invoke([
  new SystemMessage(systemPrompt),
  new HumanMessage(`${userMsg}`) // user's actual question
])

 
console.log("This is the ai response",aiRes)

return { 
      realtime: aiRes.content,
      analytics: "",
      direct: ""
    };

  } catch (error) {
    console.log(error)
    return { 
      realtime: "Server error",
      analytics: "",
      direct: ""
    };
  }



}
async function fetchRealTimeDataForJobs({messages}:typeof MyState.State) {
  try {
console.log("These are the messages by human",messages)
  const userMsg = messages[messages.length - 1]?.content || "";


 const gemini2 = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash-8b",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
  });


const systemPrompt2= `You are a query generation assistant for the GNews API. Your job is to create syntactically correct, URL-encoded query strings for the \`q\` parameter based on user intent. Follow these rules strictly:

1. All queries must be URL-encoded before being returned.
2. If the user includes special characters (e.g. !, ?, -, etc.), they must be surrounded with double quotes.
3. Use logical operators (AND, OR, NOT) appropriately:
   - Use AND when all terms must be present (default behavior when space is used).
   - Use OR to include articles with either term. OR has higher precedence than AND.
   - Use NOT to exclude specific terms. NOT must precede each word or phrase.
4. For complex expressions, always use parentheses to clarify precedence and ensure correct interpretation.
5. For exact matches, wrap the phrase in double quotes.
6. Return only the final URL-encoded string, ready to be appended to a \`q=\` parameter in a URL.

Examples:
- Input: Search for Apple or Microsoft, but not iPhone
  Output: Apple%20OR%20Microsoft%20NOT%20iPhone

- Input: Find exact phrase "Apple iPhone 13" but exclude "Apple iPhone 14"
  Output: %22Apple%20iPhone%2013%22%20AND%20NOT%20%22Apple%20iPhone%2014%22

- Input: Show results for Intel i7 or "i9-14900K" but exclude AMD and "i7-14700K"
  Output: (Intel%20AND%20(i7%20OR%20%22i9-14900K%22))%20AND%20NOT%20AMD%20AND%20NOT%20%22i7-14700K%22

Your task: Given a user-friendly search intent, convert it into a URL-encoded GNews \`q\` query string following the above rules.

`


const aires=await gemini2.invoke([
  new SystemMessage(systemPrompt2),
  new HumanMessage(`${userMsg}`)
])


   const fetchData= await fetch(`https://gnews.io/api/v4/search?q=${aires.content}&apikey=aa65afb860a134f5e8bc400c49d76f86`)
 const answer = await fetchData.json();

console.log("This is the answer of real time",answer)

const data =JSON.stringify(answer.articles.slice(0,10).map((m)=>(
  {
    title:m.title,
    description:m.description,
    content:m.content
  }
)))

console.log("This is the data",data)

 const gemini = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash-8b",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
  });


const systemPrompt = `You are a helpful AI assistant specializing in job market insights.

Your job is to generate a clear, natural, and somewhat detailed answer using ONLY the information provided in the data array. You must not add or infer any external data, opinions, or facts not present in the provided information.

✳️ Style & Rules:
- Write in complete sentences and rephrase the data into smooth, human-like language.
- Summarize key points from multiple entries if present (e.g., combine similar themes like job trends or opportunities without listing them verbatim).
- Focus on relevance to jobs, careers, or market news—highlight trends, examples, or insights if they appear in the data.
- Do NOT copy raw descriptions or content directly; integrate and paraphrase naturally.
- Do NOT invent or hallucinate facts—stick strictly to what's given.
- Use a friendly, informative, and encouraging tone, especially for job-related topics.
- If the data includes multiple articles, prioritize the most relevant ones to the user's query and condense into a cohesive narrative.

✳️ Format:
- Structure the response to include a mix of paragraphs and bullet points for clarity (e.g., use bullets to list key trends, opportunities, or examples).
- Aim for a bit longer response: 2-4 paragraphs or sections to provide depth, but keep it focused and relevant (e.g., elaborate on implications or connections within the data).
- Make the answer directly relevant to the user's specific question (e.g., if they ask about job trends in India, filter and emphasize matching data points, using points to break down details).
- Gracefully handle limited data by summarizing what's available without mentioning gaps.

STRICT INSTRUCTIONS:
- Do NOT mention missing data, external sources, or assumptions.
- If no relevant data matches the query, respond with a simple "Data not available."
- Do NOT add explanations, definitions, or advice unless explicitly in the provided data.
- Ensure the answer correctly and fully addresses the user's question by cross-referencing it with the data—be accurate and comprehensive based on what's given.

PROVIDED INFORMATION:
${data}  // This will be your JSON.stringify'd array, e.g., the job data you shared

LATEST USER MESSAGE (question or query):
${userMsg}

Your final output should be a smooth, well-written response based only on the above, incorporating points where helpful for structure.`;

// 👇 AI Invocation
const aiRes = await gemini.invoke([
  new SystemMessage(systemPrompt),
  new HumanMessage(`${userMsg}`) // user's actual question
])

 
console.log("This is the ai response",aiRes)

return { 
      realtimejobs: aiRes.content,
      analytics: "",
      direct: ""
    };

  } catch (error) {
    console.log(error)
    return { 
      realtimejobs: "Server error",
      analytics: "",
      direct: ""
    };
  }



}





export async function initializeAgent(userMessage:string) {
  try {
    // Create memory saver for persistence
    const memory = new MemorySaver();

    // Build the workflow
    const workflow = new StateGraph(MyState)
      .addNode("classifyIntent", classifyIntent)
      .addNode("fetchAnalytics", fetchAnalytics)
      .addNode("fetchRealTime", fetchRealTime)
      .addNode("fetchJobData",fetchRealTimeDataForJobs)
      .addNode("blockNode",doNotAnswer)
      .addNode("fallback", fallbackNode)
      .addNode("generateAnswer", generateAnswer)
      .addEdge("__start__", "classifyIntent")
      .addConditionalEdges("classifyIntent", (state: typeof MyState.State) => {
        console.log("Routing based on intent:", state.intent);
        if (state.intent === "analytics") return "fetchAnalytics";
        if (state.intent === "realtime") return "fetchRealTime";
        if(state.intent==="realtimejobs") return "fetchJobData";
        if(state.intent==="blocked") return "blockNode";
        return "fallback";
      })
      .addEdge("fetchAnalytics", "generateAnswer")
      .addEdge("fetchRealTime", "generateAnswer")
      .addEdge("fetchJobData", "generateAnswer")
      .addEdge("fallback", "generateAnswer")
      .addEdge("generateAnswer", "__end__");

    // Compile with checkpointer for persistence
    const app = workflow.compile({ checkpointer: memory });

    // Create config with consistent thread_id for conversation persistence
    const config = { configurable: { thread_id: "conversation-1" } };

    console.log("=== First Question ===");
    const finalState = await app.invoke({
      messages: [new HumanMessage(`${userMessage}`)]
    }, config);

    console.log("Final State:", finalState.messages[finalState.messages.length - 1].content);

  
return {aiRes:finalState.messages[finalState.messages.length - 1].content}
    // Optional: Test analytics intent
  
  } catch (error) {
    console.error("Error in initializeAgent:", error);
  }
}










// async function fetchRealTime({ messages }: typeof MyState.State) {
//   const tools = [
//     new TavilySearchResults({
//       maxResults: 5,
//       apiKey: process.env.TAVILY_API_KEY!,
//     })
//   ];

//   const model = new ChatGoogleGenerativeAI({
//     model: "gemini-1.5-flash-8b",
//     temperature: 0,
//     apiKey: process.env.GOOGLE_API_KEY,
//   }).bindTools(tools);

//   // Ensure we have valid messages
//   if (!messages || messages.length === 0) {
//     return { 
//       realtime: "No messages to process",
//       analytics: "",
//       direct: ""
//     };
//   }

//   try {
//     console.log("fetchRealTime processing messages:", messages.map(m => ({ content: m.content, type: m.constructor.name })));

//     // Validate message content and ensure they have proper text content
//     const validMessages = messages.filter(msg => {
//       const content = extractContent(msg.content);
//       return content && content.trim().length > 0;
//     });
    
//     if (validMessages.length === 0) {
//       return { 
//         realtime: "No valid messages found",
//         analytics: "",
//         direct: ""
//       };
//     }

//     const response = await model.invoke(validMessages);
//     console.log("Model response:", { 
//       content: response.content, 
//       toolCalls: response.tool_calls?.length || 0,
//       contentType: typeof response.content 
//     });
    
//     // If the model wants to use tools, execute them
//     if (response.tool_calls && response.tool_calls.length > 0) {
//       console.log("Executing tools...");
//       const toolNode = new ToolNode(tools);
      
//       // Create messages array with the tool call response
//       const messagesWithToolCall = [...validMessages, response];
      
//       try {
//         // Execute tools
//         const toolResults = await toolNode.invoke({
//           messages: messagesWithToolCall
//         });
        
//         console.log("Tool results received:", {
//           messagesCount: toolResults.messages.length,
//           lastMessageType: toolResults.messages[toolResults.messages.length - 1]?.constructor.name
//         });
        
//         // Create a simple summary prompt instead of passing all tool messages
//         const lastUserMessage = validMessages[validMessages.length - 1];
//         const toolMessage = toolResults.messages[toolResults.messages.length - 1];
        
//         // Extract tool content safely
//         const toolContent = extractContent(toolMessage.content);
        
//         // **FIX: Better context-aware prompt for follow-up questions**
//         let questionContext = "";
//         if (validMessages.length > 1) {
//           const previousMessages = validMessages.slice(-3, -1);
//           questionContext = `Previous conversation context:\n${previousMessages.map(msg => 
//             `${msg.constructor.name === 'HumanMessage' ? 'User' : 'Assistant'}: ${extractContent(msg.content)}`
//           ).join('\n')}\n\n`;
//         }
        
//         // Create a new simple request for final response
//         const summaryPrompt = new HumanMessage(
//           `${questionContext}Based on this search result, please provide a clear answer to the user's question: "${extractContent(lastUserMessage.content)}"
          
//           Search results: ${toolContent}
          
//           Please provide a concise, helpful response.`
//         );
        
//         console.log("Getting final response with summary prompt...");
        
//         // Get final response with a clean model instance (no tools)
//         const finalModel = new ChatGoogleGenerativeAI({
//           model: "gemini-1.5-flash-8b",
//           temperature: 0,
//           apiKey: process.env.GOOGLE_API_KEY,
//         });
        
//         const finalResponse = await finalModel.invoke([summaryPrompt]);
//         const finalContent = extractContent(finalResponse.content);
        
//         console.log("Final response received:", finalContent.substring(0, 100) + "...");
//         return { 
//           realtime: finalContent,
//           analytics: "",
//           direct: ""
//         };
        
//       } catch (toolError) {
//         if(toolError instanceof Error)
//         console.error("Tool execution error:", toolError.message);
//         // Fallback: return the original response content
//         return { 
//           realtime: extractContent(response.content) || "Error processing search results",
//           analytics: "",
//           direct: ""
//         };
//       }
//     }
    
//     return { 
//       realtime: extractContent(response.content),
//       analytics: "",
//       direct: ""
//     };
//   } catch (error) {
//     if(error instanceof Error)
//     console.error("Error in fetchRealTime:", {
//       error: error.message,
//       messagesCount: messages.length
//     });
    
//     // Fallback: try with just the last message
//     try {
//       const lastMessage = messages[messages.length - 1];
//       if (lastMessage && lastMessage.content) {
//         console.log("Trying fallback with last message...");
        
//         // Use model without tools for fallback
//         const fallbackModel = new ChatGoogleGenerativeAI({
//           model: "gemini-1.5-flash-8b",
//           temperature: 0,
//           apiKey: process.env.GOOGLE_API_KEY,
//         });
        
//         const fallbackResponse = await fallbackModel.invoke([
//           new HumanMessage(extractContent(lastMessage.content))
//         ]);
//         return { 
//           realtime: extractContent(fallbackResponse.content),
//           analytics: "",
//           direct: ""
//         };
//       }
//     } catch (fallbackError) {
//       if(fallbackError instanceof Error)
//       console.error("Fallback also failed:", fallbackError.message);
//     }
    
//     return { 
//       realtime: "Unable to fetch real-time information due to an error.",
//       analytics: "",
//       direct: ""
//     };
//   }
// }