import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation, MemorySaver, Annotation } from "@langchain/langgraph";

// Define a custom state that extends MessagesAnnotation
const MyState = Annotation.Root({
  ...MessagesAnnotation.spec,
  intent: Annotation<string>(),
  analytics: Annotation<string>(),
  realtime: Annotation<string>(),
  direct: Annotation<string>(),
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

// **FIX: Improved intent classification with conversation context**
async function classifyIntent({ messages }: typeof MyState.State) {
  console.log("These are the messages", messages);

  const userMsg = messages[messages.length - 1]?.content || "";
  
  // **FIX: Include conversation context for better intent classification**
  const conversationContext = messages.slice(-3).map(msg => 
    `${msg.constructor.name === 'HumanMessage' ? 'User' : 'Assistant'}: ${extractContent(msg.content)}`
  ).join('\n');

  const gemini = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
  });
  
  const intentSystemPrompt = `You are an intent classifier. Based on the conversation context and the latest user message, classify the user's intent as one of: analytics, realtime, or other.

INTENT DEFINITIONS:
- analytics: questions about website statistics, pageviews, user data, business metrics
- realtime: questions about current/live information like weather, news, stock prices, current events, sports scores
- other: general questions, greetings, or conversations that don't fit the above

IMPORTANT: Consider the conversation context. If the previous conversation was about weather and the user asks "what about new york", this is still a REALTIME weather request.

CONVERSATION CONTEXT:
${conversationContext}

LATEST USER MESSAGE: ${userMsg}

Reply with ONLY one word: analytics, realtime, or other.`;
  
  const intentResp = await gemini.invoke([
    new HumanMessage(intentSystemPrompt),
  ]);
  
  const intent = extractContent(intentResp.content).toLowerCase().trim();
  console.log("This is intent:", intent);
  return { 
    intent,
    // Clear other states
    analytics: "",
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

async function fetchRealTime({ messages }: typeof MyState.State) {
  const tools = [
    new TavilySearchResults({
      maxResults: 5,
      apiKey: process.env.TAVILY_API_KEY!,
    })
  ];

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash-8b",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
  }).bindTools(tools);

  // Ensure we have valid messages
  if (!messages || messages.length === 0) {
    return { 
      realtime: "No messages to process",
      analytics: "",
      direct: ""
    };
  }

  try {
    console.log("fetchRealTime processing messages:", messages.map(m => ({ content: m.content, type: m.constructor.name })));

    // Validate message content and ensure they have proper text content
    const validMessages = messages.filter(msg => {
      const content = extractContent(msg.content);
      return content && content.trim().length > 0;
    });
    
    if (validMessages.length === 0) {
      return { 
        realtime: "No valid messages found",
        analytics: "",
        direct: ""
      };
    }

    const response = await model.invoke(validMessages);
    console.log("Model response:", { 
      content: response.content, 
      toolCalls: response.tool_calls?.length || 0,
      contentType: typeof response.content 
    });
    
    // If the model wants to use tools, execute them
    if (response.tool_calls && response.tool_calls.length > 0) {
      console.log("Executing tools...");
      const toolNode = new ToolNode(tools);
      
      // Create messages array with the tool call response
      const messagesWithToolCall = [...validMessages, response];
      
      try {
        // Execute tools
        const toolResults = await toolNode.invoke({
          messages: messagesWithToolCall
        });
        
        console.log("Tool results received:", {
          messagesCount: toolResults.messages.length,
          lastMessageType: toolResults.messages[toolResults.messages.length - 1]?.constructor.name
        });
        
        // Create a simple summary prompt instead of passing all tool messages
        const lastUserMessage = validMessages[validMessages.length - 1];
        const toolMessage = toolResults.messages[toolResults.messages.length - 1];
        
        // Extract tool content safely
        const toolContent = extractContent(toolMessage.content);
        
        // **FIX: Better context-aware prompt for follow-up questions**
        let questionContext = "";
        if (validMessages.length > 1) {
          const previousMessages = validMessages.slice(-3, -1);
          questionContext = `Previous conversation context:\n${previousMessages.map(msg => 
            `${msg.constructor.name === 'HumanMessage' ? 'User' : 'Assistant'}: ${extractContent(msg.content)}`
          ).join('\n')}\n\n`;
        }
        
        // Create a new simple request for final response
        const summaryPrompt = new HumanMessage(
          `${questionContext}Based on this search result, please provide a clear answer to the user's question: "${extractContent(lastUserMessage.content)}"
          
          Search results: ${toolContent}
          
          Please provide a concise, helpful response.`
        );
        
        console.log("Getting final response with summary prompt...");
        
        // Get final response with a clean model instance (no tools)
        const finalModel = new ChatGoogleGenerativeAI({
          model: "gemini-1.5-flash-8b",
          temperature: 0,
          apiKey: process.env.GOOGLE_API_KEY,
        });
        
        const finalResponse = await finalModel.invoke([summaryPrompt]);
        const finalContent = extractContent(finalResponse.content);
        
        console.log("Final response received:", finalContent.substring(0, 100) + "...");
        return { 
          realtime: finalContent,
          analytics: "",
          direct: ""
        };
        
      } catch (toolError) {
        if(toolError instanceof Error)
        console.error("Tool execution error:", toolError.message);
        // Fallback: return the original response content
        return { 
          realtime: extractContent(response.content) || "Error processing search results",
          analytics: "",
          direct: ""
        };
      }
    }
    
    return { 
      realtime: extractContent(response.content),
      analytics: "",
      direct: ""
    };
  } catch (error) {
    if(error instanceof Error)
    console.error("Error in fetchRealTime:", {
      error: error.message,
      messagesCount: messages.length
    });
    
    // Fallback: try with just the last message
    try {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.content) {
        console.log("Trying fallback with last message...");
        
        // Use model without tools for fallback
        const fallbackModel = new ChatGoogleGenerativeAI({
          model: "gemini-1.5-flash-8b",
          temperature: 0,
          apiKey: process.env.GOOGLE_API_KEY,
        });
        
        const fallbackResponse = await fallbackModel.invoke([
          new HumanMessage(extractContent(lastMessage.content))
        ]);
        return { 
          realtime: extractContent(fallbackResponse.content),
          analytics: "",
          direct: ""
        };
      }
    } catch (fallbackError) {
      if(fallbackError instanceof Error)
      console.error("Fallback also failed:", fallbackError.message);
    }
    
    return { 
      realtime: "Unable to fetch real-time information due to an error.",
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
      .addNode("fallback", fallbackNode)
      .addNode("generateAnswer", generateAnswer)
      .addEdge("__start__", "classifyIntent")
      .addConditionalEdges("classifyIntent", (state: typeof MyState.State) => {
        console.log("Routing based on intent:", state.intent);
        if (state.intent === "analytics") return "fetchAnalytics";
        if (state.intent === "realtime") return "fetchRealTime";
        return "fallback";
      })
      .addEdge("fetchAnalytics", "generateAnswer")
      .addEdge("fetchRealTime", "generateAnswer")
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
