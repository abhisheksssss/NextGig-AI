import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import {
  StateGraph,
  MessagesAnnotation,
  MemorySaver,
  Annotation,
} from "@langchain/langgraph";
import { tavily } from "@tavily/core";
import { IClient, Ifreelancer } from "@/context/user";
import { ChatGroq } from "@langchain/groq";
import { DynamicTool } from "@langchain/core/tools";
import { PromptTemplate } from "@langchain/core/prompts";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import { fetchGoogleData } from "@/lib/api";

// Create ONE memory instance at module level that persists across function calls
const sessionMemory = new MemorySaver();

// Define a custom state that extends MessagesAnnotation
const MyState = Annotation.Root({
  ...MessagesAnnotation.spec,
  intent: Annotation<string>(),
  analytics: Annotation<string>(),
  realtime: Annotation<string>(),
  direct: Annotation<string>(),
  realtimejobs: Annotation<string>(),
  userId: Annotation<Ifreelancer | IClient>(),
  conversationTopic: Annotation<string>(),
  lastIntent: Annotation<string>(),
});

export interface Source {
  id: string | null;
  name: string;
}

export interface Article {
  source: Source;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface toolNews {
  status: "ok" | "error";
  totalResults: number;
  articles: Article[];
}

const toolTavily = tavily({ apiKey: process.env.TAVILY_API_KEY });

const realTimeData = new DynamicTool({
  name: "real time data",
  description: "provide the input and get real time data from tavily search",
  func: async (Input: string) => {
    try {
      const answer = await toolTavily.search(`${Input}`, { maxResults: 3 });

      console.log("This is the answer", answer);

      if (answer && answer.results) {
        const formattedResults = answer.results
          .map(
            (result, index) =>
              `Result ${index + 1}:\nTitle: ${result.title}\nURL: ${
                result.url
              }\nContent: ${result.content}`
          )
          .join("\n\n---\n\n");

        return formattedResults;
      }

      return "No results found.";
    } catch (error) {
      console.log(error);
      return "Error fetching real-time data.";
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

const fetchNewsData = new DynamicTool({
  name: "Fetch real time news data ",
  description: "provide the input and get the real time news data from ",
  func: async (Input: string) => {
    try {
      const response: Response = await fetch(
        `https://newsapi.org/v2/everything?q=${Input}&apiKey=${process.env.NEWS_API_KEY}&pageSize=10`
      );

      if (response?.ok) {
        const toolNewsData: toolNews = await response.json();

        if (toolNewsData.status == "ok" && toolNewsData.articles.length > 0) {
          const data = toolNewsData.articles.map((article) => ({
            author: article.author,
            title: article.title,
            description: article.description,
          }));

          return data;
        } else {
          return "Error occured";
        }
      }

      return "No results found.";
    } catch (error) {
      console.log(error);
      return "Error fetching real-time data.";
    }
  },
});

function getConversationContext(message: any[]) {
  console.log("This is the conversation message", message);

  const CONTEXT_WINDOW = 6;
  let contextMessage = message.slice(-CONTEXT_WINDOW);

  if (message.length > 10) {
    const olderMessages = message.slice(0, -CONTEXT_WINDOW);
    const summary = `Previous conversation summary: User discussed ${olderMessages.length} topics including profile analysis and job searches.`;
    contextMessage = [{ role: "system", content: summary }, ...contextMessage];
  }

  console.log(
    contextMessage
      .map(
        (msg) =>
          `${
            msg.constructor.name === "HumanMessage" ? "User" : "Assistant"
          }: ${extractContent(msg.content)}`
      )
      .join("\n")
  );

  return contextMessage
    .map(
      (msg) =>
        `${
          msg.constructor.name === "HumanMessage" ? "User" : "Assistant"
        }: ${extractContent(msg.content)}`
    )
    .join("\n");
}

function extractContent(content: any): string {
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") return item;
        if (item.text) return item.text;
        if (item.content) return item.content;
        return JSON.stringify(item);
      })
      .join(" ");
  }
  if (content && typeof content === "object") {
    if (content.text) return content.text;
    if (content.content) return content.content;
    return JSON.stringify(content);
  }
  return String(content || "");
}

async function generateAnswer(state: typeof MyState.State) {
  let answer = "";

  // Only use the current intent's result
  if (state.intent === "analytics" && state.analytics) {
    answer = state.analytics;
  } else if (state.intent === "realtime" && state.realtime) {
    answer = state.realtime;
  } else if (state.intent === "other" && state.direct) {
    answer = state.direct;
  } else if (state.intent === "realtimejobs" && state.realtimejobs) {
    answer = state.realtimejobs;
  }

  const conversationContext = getConversationContext(state.messages || []);
  const isFollowUp = state.messages && state.messages.length > 2;

  if (isFollowUp && answer) {
    const gemini = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      temperature: 0,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const flowPrompt = `Add a natural transition to this response based on conversation context:

CONVERSATION CONTEXT: ${conversationContext}
CURRENT RESPONSE: ${answer}

Add a brief, natural connecting phrase if this is a follow-up question. Keep the original response but make it flow better.`;

    try {
      const flowResponse = await gemini.invoke([new HumanMessage(flowPrompt)]);
      answer = extractContent(flowResponse.content);
    } catch (error) {
      console.log(error);
    }
  }

  // Clear the state values after using them
  return {
    messages: [...(state.messages || []), new AIMessage(answer)],
    lastIntent: state.intent,
    conversationTopic: state.intent,
    analytics: "",
    realtime: "",
    direct: "",
    realtimejobs: "",
  };
}

async function fetchAnalytics({ messages }: typeof MyState.State, config: any) {
  const userId = config.configurable.userId;
  console.log("This is userId", userId);
  const userMsg = messages[messages.length - 1]?.content || "";
  const conversationContext = messages
    .slice(-3)
    .map(
      (msg) =>
        `${
          msg.constructor.name === "HumanMessage" ? "User" : "Assistant"
        }: ${extractContent(msg.content)}`
    )
    .join("\n");

  const gemini = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
  });

  if (userId?.role === "Client") {
    try {
      const clientData = JSON.stringify({
        name: userId.name,
        Bio: userId.Bio,
        location: userId.location,
        FieldOFintrest: userId.Field,
      });

      console.log("This is the client data", clientData);

      const systemPrompt = `You are a Client Analysis Helper. Look at client information and give detailed, helpful advice in simple English.

**Answer Format:**

**1. About This Client**
• Who they are and what they do (2-3 sentences)
• Where they are located
• What type of work they need

**2. What They Want**
• List their main service needs
• Their project types and goals
• Their communication style and preferences

**3. How Well We Match**
• Give a percentage match (like 85%)
• Explain why this percentage in simple terms
• What makes us a good fit for them

**4. How to Work With Them**
• Best ways to communicate with this client
• What they value most (quality, speed, cost, etc.)
• How to build trust and long-term relationship

**5. What to Do Right Now**
• Step 1: Immediate action to take
• Step 2: How to reach out professionally  
• Step 3: What to prepare for first meeting
• Step 4: How to price your services

**6. Red Flags to Watch**
• Things that might cause problems
• How to handle difficult situations
• When to say no to this client

**Important Rules:**
- Use simple, everyday English
- Give detailed explanations that help make good decisions
- Include specific examples and actionable advice
- Always use bullet points for easy reading
- Give complete answers with practical tips

IMPORTANT: Consider the conversation context. If the previous conversation was about weather and the user asks "what about new york", this is still a REALTIME weather request.

CONVERSATION CONTEXT:
${conversationContext}
`;

      const aiRes = await gemini.invoke([
        new HumanMessage(`${systemPrompt}

CLIENT PROFILE DATA:
${clientData}

USER REQUEST: ${
          userMsg ||
          "Please provide a complete analysis of this client profile data."
        }`),
      ]);

      return {
        analytics: aiRes.content,
        realtime: "",
        direct: "",
        realtimejobs: "",
      };
    } catch (error) {
      console.log(error);
      return {
        analytics: "failed",
        realtime: "",
        direct: "",
        realtimejobs: "",
      };
    }
  }

  if (userId.role === "Freelancer") {
    try {
      const freelancerData = JSON.stringify({
        name: userId.name,
        Bio: userId.Bio,
        Experience: userId.Experience,
        HourlyRate: userId.HourlyRate,
        Profession: userId.Profession,
        Skills: userId.Skills,
        location: userId.location,
      });

      const systemPrompt = `You are a Freelancer Analysis Helper. Look at freelancer profiles and give detailed hiring advice in simple English.

**Answer Format:**

**1. About This Person**
• Their main skills and experience level
• Where they work from and availability
• What type of projects they're best for

**2. Their Skills and Abilities**
• List their top technical skills
• Their experience level with each skill
• What they can build or create for you

**3. Are They Worth the Money**
• Their rate compared to market average
• If their price is fair for their skills
• What you get for your money

**4. Should You Hire Them**
• Clear YES or NO recommendation
• 3-4 specific reasons why or why not
• What projects they'd be perfect for

**5. How to Improve Their Profile**
• What's missing from their profile
• Suggestions to make their profile better
• What would make them more hireable
• Skills they should learn or highlight

**6. How They Can Get More Work**
• Better ways to show their experience
• What portfolio items to add
• How to write better project descriptions
• Tips for pricing their services

**7. Things to Watch Out For**
• Potential problems or red flags
• Questions to ask before hiring
• How to test their actual skills

**Important Rules:**
- Use simple, everyday English  
- Give detailed explanations that help hiring decisions
- Include specific improvement suggestions
- Always use bullet points for easy reading
- Give complete answers with practical advice
- Focus on helping both hiring and profile improvement
`;

      const aiRes = await gemini.invoke([
        new HumanMessage(`${systemPrompt}

FREELANCER PROFILE DATA:
${freelancerData}

USER REQUEST: ${
          userMsg ||
          "Please provide a complete analysis of this freelancer profile data."
        }`),
      ]);

      return {
        analytics: aiRes.content,
        realtime: "",
        direct: "",
        realtimejobs: "",
      };
    } catch (error) {
      console.log(error);
      return {
        analytics: "Failed to Fetch Data",
        realtime: "",
        direct: "",
        realtimejobs: "",
      };
    }
  }

  return {
    analytics: `null`,
    realtime: "",
    direct: "",
    realtimejobs: "",
  };
}

async function doNotAnswer(state: typeof MyState.State) {
  return {
    direct: "I can only answer questions related to your profile and jobs",
    analytics: "",
    realtime: "",
    realtimejobs: "",
  };
}

async function classifyIntent({ messages }: typeof MyState.State) {
  console.log("These are the messages", messages);

  const userMsg = messages[messages.length - 1]?.content || "";
  const conversationContext = getConversationContext(messages);

  console.log(conversationContext);

  const gemini = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const intentSystemPrompt = `You are an intent classifier. Based on the conversation history and current message, classify intent.

CONVERSATION FLOW ANALYSIS:
- Look at the conversation progression
- Consider topic continuity and user's journey
- Handle follow-up questions appropriately

INTENT DEFINITIONS:
- analytics: Profile analysis, improvement suggestions
- realtimejobs: Current job market, live job data
- realtime: Current events, live information
- other: General questions, follow-ups to previous topics
- blocked: Off-topic conversations

CONVERSATION CONTEXT:
${conversationContext}

CURRENT MESSAGE: ${userMsg}

Consider the conversation flow. If this is a follow-up question, maintain topic continuity.
Reply with ONLY: analytics, realtime, realtimejobs, other, or blocked
`;

  const intentResp = await gemini.invoke([
    new HumanMessage(intentSystemPrompt),
  ]);

  const intent = extractContent(intentResp.content).toLowerCase().trim();
  return {
    intent,
    analytics: "",
    realtimejobs: "",
    realtime: "",
    direct: "",
  };
}

async function fallbackNode({ messages }: typeof MyState.State) {
  console.log("These are the messages", messages);

  const userMsg = messages[messages.length - 1]?.content || "";
  const conversationContext = getConversationContext(messages);

  console.log("This is the conversation context:", conversationContext);

  const systemPrompt = `You are a helpful AI assistant. Always provide clear, concise answers based on the current conversation and the user's past inputs. Maintain the context of the discussion without repeating unnecessary details.
Do not make assumptions beyond what the user has shared. Keep responses natural and focused on solving the user's problems.
CONVERSATION CONTEXT:
${conversationContext}
`;

  const gemini = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const aiMsg = await gemini.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(`${userMsg}`),
  ]);
  console.log("This is the ai response", aiMsg);

  const intent = extractContent(aiMsg.content).toLowerCase().trim();
  console.log("This is the ai response", intent);

  return {
    direct: extractContent(aiMsg.content),
    analytics: "",
    realtime: "",
    realtimejobs: "",
  };
}

async function fetchRealTime({ messages }: typeof MyState.State) {
  try {
    console.log("These are the messages by human", messages);
    const userMsg = messages[messages.length - 1]?.content || "";

    const conversationContext = messages
      .slice(-3)
      .map(
        (msg) =>
          `${
            msg.constructor.name === "HumanMessage" ? "User" : "Assistant"
          }: ${extractContent(msg.content)}`
      )
      .join("\n");

    const tool = tavily({ apiKey: process.env.TAVILY_API_KEY });
    const answer = await tool.search(`${userMsg}`);

    console.log("This is the answer of real time", answer);

    const data = JSON.stringify(
      answer.results.slice(0, 5).map((m) => ({
        content: m.content,
      }))
    );

    const gemini = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
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

IMPORTANT: Consider the conversation context. If the previous conversation was about weather and the user asks "what about new york", this is still a REALTIME weather request.

CONVERSATION CONTEXT:
${conversationContext}

Your final output should be a smooth, well-written paragraph based only on the above.`;

    const aiRes = await gemini.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(`${userMsg}`),
    ]);
    const intent = extractContent(aiRes.content).toLowerCase().trim();
    console.log("This is the ai response", intent);

    return {
      realtime: aiRes.content,
      analytics: "",
      direct: "",
      realtimejobs: "",
    };
  } catch (error) {
    console.log(error);
    return {
      realtime: "Server error",
      analytics: "",
      direct: "",
      realtimejobs: "",
    };
  }
}

async function fetchRealTimeDataForJobs({ messages }: typeof MyState.State) {
  try {
    console.log("These are the messages by human", messages[0]);
    const userMsg = messages[messages.length - 1]?.content || "";

    const conversationContext = getConversationContext(messages);

    console.log("This is the conversation context", conversationContext);

    const model = new ChatGroq({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
    });

    const tools = [realTimeData, fetchNewsData, googleSearch];

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
      maxIterations: 5,
    });

    try {
      const response = await executor.invoke({
        input: userMsg,
      });
      console.log("Agent response:", response.output);
      return {
        realtimejobs: response.output,
        analytics: "",
        direct: "",
        realtime: "",
      };
    } catch (error) {
      console.log("Error during agent execution:", error);
      return {
        realtimejobs: "An error occurred while processing your request",
        analytics: "",
        direct: "",
        realtime: "",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      realtimejobs: "Server error",
      analytics: "",
      direct: "",
      realtime: "",
    };
  }
}

export async function initializeAgent(
  userMessage: string,
  userId: Ifreelancer | IClient,
  sessionId: string // Now required parameter
) {
  try {
    // Use the shared memory instance
    const memory = sessionMemory;

    // Build the workflow
    const workflow = new StateGraph(MyState)
      .addNode("classifyIntent", classifyIntent)
      .addNode("fetchAnalytics", fetchAnalytics)
      .addNode("fetchRealTime", fetchRealTime)
      .addNode("fetchJobData", fetchRealTimeDataForJobs)
      .addNode("blockNode", doNotAnswer)
      .addNode("fallback", fallbackNode)
      .addNode("generateAnswer", generateAnswer)
      .addEdge("__start__", "classifyIntent")
      .addConditionalEdges("classifyIntent", (state: typeof MyState.State) => {
        console.log("Routing based on intent:", state.intent);
        if (state.intent === "analytics") return "fetchAnalytics";
        if (state.intent === "realtime") return "fetchRealTime";
        if (state.intent === "realtimejobs") return "fetchJobData";
        if (state.intent === "blocked") return "blockNode";
        return "fallback";
      })
      .addEdge("fetchAnalytics", "generateAnswer")
      .addEdge("fetchRealTime", "generateAnswer")
      .addEdge("fetchJobData", "generateAnswer")
      .addEdge("blockNode", "generateAnswer")
      .addEdge("fallback", "generateAnswer")
      .addEdge("generateAnswer", "__end__");

    // Compile with checkpointer for persistence
    const app = workflow.compile({ checkpointer: memory });

    // Use the provided sessionId directly
    const config = {
      configurable: {
        thread_id: sessionId,
        userId,
      },
    };

    console.log("=== Processing message with sessionId:", sessionId);
    const finalState = await app.invoke(
      {
        messages: [new HumanMessage(`${userMessage}`)],
      },
      config
    );

    console.log("This is the final state", finalState);

    return {
      aiRes: finalState.messages[finalState.messages.length - 1].content,
      sessionId: sessionId, // Return the sessionId for frontend to reuse
    };
  } catch (error) {
    console.error("Error in initializeAgent:", error);
    throw error;
  }
}

// Optional: Function to clear chat session when user leaves
export function clearChatSession(sessionId: string) {
  console.log(`Session ${sessionId} ended - memory will be cleared on next restart`);
  // MemorySaver is in-memory, so it will be garbage collected
  // You don't need to manually clear it unless you want to
}
