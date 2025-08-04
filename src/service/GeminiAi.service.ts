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
import { Article, CustomSearchResult } from "@/helper/types";
import { fetchGoogleData } from "@/lib/api";

// Define a custom state that extends MessagesAnnotation
const MyState = Annotation.Root({
  ...MessagesAnnotation.spec,
  intent: Annotation<string>(),
  analytics: Annotation<string>(),
  realtime: Annotation<string>(),
  direct: Annotation<string>(),
  realtimejobs: Annotation<string>(),
  userId: Annotation<Ifreelancer | IClient>(),
  conversationTopic:Annotation<string>(),
  lastIntent:Annotation<string>()
});


function getConversationContext(message: any[]) {

console.log("THis is the conversation message",message)


  const CONTEXT_WINDOW = 6; // Fixed from 0
  let contextMessage = message.slice(-CONTEXT_WINDOW);

  if (message.length > 10) {
    const olderMessages = message.slice(0, -CONTEXT_WINDOW);
    const summary = `Previous conversation summary: User discussed ${olderMessages.length} topics including profile analysis and job searches.`;
    contextMessage = [
      { role: "system", content: summary },
      ...contextMessage
    ];
  }


  console.log(contextMessage.map(msg => 
    `${msg.constructor.name === "HumanMessage" ? "User" : "Assistant"}: ${extractContent(msg.content)}`
  ).join("\n"))

  return( contextMessage.map(msg => 
    `${msg.constructor.name === "HumanMessage" ? "User" : "Assistant"}: ${extractContent(msg.content)}`
  ).join("\n"));
}



// Helper function to extract string content from AI messages
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
  } else if (state.intent === "realtimejobs" && state.realtimejobs) {
    answer = state.realtimejobs;
  }

const conversationContext = getConversationContext(state.messages || []);
  const isFollowUp = state.messages && state.messages.length > 2;

  if (isFollowUp && answer) {
    // Add natural transitions for follow-up questions
    const gemini = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash-8b",
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
      // Fall back to original answer if flow enhancement fails
      console.log(error)
    }
  }

  // **FIX: Clear the state values after using them to prevent accumulation**
   return {
    messages: [...(state.messages || []), new AIMessage(answer)],
    lastIntent: state.intent,
    conversationTopic: state.intent,
    // Clear working states
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
    model: "gemini-1.5-flash-8b",
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

      console.log("THis is the client data", clientData);

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
        // Clear other states
        realtime: "",
        direct: "",
      };
    } catch (error) {
      console.log(error);
      return {
        analytics: "failed",
        // Clear other states
        realtime: "",
        direct: "",
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

CLIENT PROFILE DATA:
${freelancerData}

USER REQUEST: ${
          userMsg ||
          "Please provide a complete analysis of this client profile data."
        }`),
      ]);

      return {
        analytics: aiRes.content,
        // Clear other states
        realtime: "",
        direct: "",
      };
    } catch (error) {
      console.log(error);
      return {
        analytics: "Failed to Fetch Data",
        // Clear other states
        realtime: "",
        direct: "",
      };
    }
  }

  return {
    analytics: `null`,
    // Clear other states
    realtime: "",
    direct: "",
  };
}
async function doNotAnswer(state: typeof MyState.State) {
  return {
    analytics: "I can only anser the question related to you profile and jobs",
    // Clear other states
    realtime: "",
    direct: "",
  };
}



// async function AnalysisOfPdf({ messages }: typeof MyState.State, config: any) {
//   const userData=config.configurable.userId;

//  const userMsg = messages[messages.length - 1]?.content || "";


//  const pdfData={
//   pdfUrl:userData.resumePdf,
//   id:userData.userId,
//   msg:userMsg.toString()
//  }
 
//  const chunks=await processPdf(pdfData)

//  return{
//   pdfA
//  }

// }



// **FIX: Improved intent classification with conversation context**
async function classifyIntent({ messages }: typeof MyState.State) {
  console.log("These are the messages", messages);

  const userMsg = messages[messages.length - 1]?.content || "";

  // **FIX: Include conversation context for better intent classification**
  const conversationContext =getConversationContext(messages)

console.log(conversationContext)

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
    // Clear other states
    analytics: "",
    realtimejobs: "",
    realtime: "",
    direct: "",
  };
}

async function fallbackNode({ messages }: typeof MyState.State) {

console.log("These are the messages",messages)

  const userMsg = messages[messages.length - 1]?.content || "";
 const conversationContext = getConversationContext(messages)

console.log("This is the conversation context:",conversationContext)


const systemPrompt=`You are a helpful AI assistant. Always provide clear, concise answers based on the current conversation and the user's past inputs. Maintain the context of the discussion without repeating unnecessary details.
 Do not make assumptions beyond what the user has shared. Keep responses natural and focused on solving the user's problems.
 CONVERSATATION CONTEXT:
 ${conversationContext}
 `


  const gemini = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash-8b",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const aiMsg = await gemini.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(`${userMsg}`)]);
  console.log("This is the ai response", aiMsg);


 const intent = extractContent(aiMsg.content).toLowerCase().trim();
    console.log("This is the ai response", intent);

  return {
    direct: extractContent(aiMsg.content),
    // Clear other states
    analytics: "",
    realtime: "",
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

IMPORTANT: Consider the conversation context. If the previous conversation was about weather and the user asks "what about new york", this is still a REALTIME weather request.

CONVERSATION CONTEXT:
${conversationContext}


Your final output should be a smooth, well-written paragraph based only on the above.}`;

    // 👇 AI Invocation
    const aiRes = await gemini.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(`${userMsg}`), // user's actual question
    ]);
 const intent = extractContent(aiRes.content).toLowerCase().trim();
    console.log("This is the ai response", intent);

    return {
      realtime: aiRes.content,
      analytics: "",
      direct: "",
    };
  } catch (error) {
    console.log(error);
    return {
      realtime: "Server error",
      analytics: "",
      direct: "",
    };
  }
}
async function fetchRealTimeDataForJobs({ messages }: typeof MyState.State) {
  try {
    console.log("These are the messages by human", messages[0]);
    const userMsg = messages[messages.length - 1]?.content || "";

    const conversationContext = getConversationContext(messages);



    const gemini2 = new ChatGoogleGenerativeAI({
      model: "gemini-2.0-flash",
      temperature: 0,
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const systemPrompt2 = `You are a query generation assistant for the GNews API. Your task is to convert user-friendly search intents into syntactically correct, URL-encoded query strings for the \`q\` parameter. Follow these rules strictly:

1. All queries must be URL-encoded before being returned.
2. If the user includes special characters (e.g., !, ?, -, etc.), they must be surrounded with double quotes.
3. Use logical operators (AND, OR, NOT) appropriately:
   - Use AND when all terms must be present (this is the default behavior when a space is used).
   - Use OR to include articles with either term. OR has higher precedence than AND.
   - Use NOT to exclude specific terms. NOT must precede each word or phrase.
4. Always use parentheses for complex expressions to clarify logical precedence.
5. For exact matches, wrap the phrase in double quotes.
6. Return only the final URL-encoded string—no explanation or additional text. The output must be ready to append to the \`q=\` parameter in a URL.

Examples:
- Input: Search for Apple or Microsoft, but not iPhone  
  Output: Apple%20OR%20Microsoft%20NOT%20iPhone

- Input: Find exact phrase "Apple iPhone 13" but exclude "Apple iPhone 14"  
  Output: %22Apple%20iPhone%2013%22%20AND%20NOT%20%22Apple%20iPhone%2014%22

- Input: Show results for Intel i7 or "i9-14900K" but exclude AMD and "i7-14700K"  
  Output: (Intel%20AND%20(i7%20OR%20%22i9-14900K%22))%20AND%20NOT%20AMD%20AND%20NOT%20%22i7-14700K%22

Your task: Given a natural-language search request from the user, correct any grammar or structure if necessary, then generate the final URL-encoded GNews \`q\` query string based on the intent. Return only the query string.
`;
    const aires = await gemini2.invoke([
      new SystemMessage(systemPrompt2),
      new HumanMessage(`${userMsg}`),
    ]);

    const fetchData = await fetch(
      `https://gnews.io/api/v4/search?q=${aires.content}&apikey=${process.env.GNEWS_API_KEY}`
    );
    const answer = await fetchData.json();
    const fetchData1 = await fetch(
      `https://newsapi.org/v2/everything?q=${aires.content}&apiKey=${process.env.NEWS_API_KEY}`
    );
    const answer1 = await fetchData1.json();
    
   const fetchData2= await fetchGoogleData(`${aires?.content}`)


       const tool = tavily({ apiKey: process.env.TAVILY_API_KEY });
    const answer_Tavily = await tool.search(`${aires.content}`);

     const data4 =answer_Tavily.results.slice(0, 4).map((m) => ({
        content: m.content,
      }));

const data1 = answer.articles.slice(0, 4).map((m: Article) => ({
  title: m.title,
  description: m.description,
  content: m.content,
}));

const data2 = answer1.articles.slice(0, 4).map((m: Article) => ({
  title: m.title,
  description: m.description,
  content: m.content,  
}));

const data3 = fetchData2.items.slice(0, 4).map((m: CustomSearchResult) => ({
  snippet: m.snippet,
}));

const data = JSON.stringify([...data1, ...data2, ...data3, ...data4]);



    const gemini = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash-8b",
      temperature: 0,
      apiKey: process.env.GOOGLE_API_KEY,
    });

const systemPrompt = `
You are a helpful AI assistant who gives clear, natural, and job-focused answers using ONLY the provided data. Do not include any extra info, personal opinion, or assumptions.

✳️ What to do:
- Read the data array carefully and write a smooth, natural response.
- Combine related points or patterns (e.g., job trends, hiring news) into short paragraphs or bullet points.
- Use a friendly, confident, and informative tone.
- Stick STRICTLY to what’s in the data — don’t invent or add anything.

✳️ Style rules:
- Write in full sentences and paraphrase the original text clearly.
- Use 2–4 short sections (paragraphs or bullets) to highlight trends or examples.
- Focus only on jobs, hiring, career opportunities, or market news.
- If multiple entries say similar things, combine them into one point.
- Do NOT quote or copy text directly from the data.
- Do NOT include sources, extra facts, or filler.

✳️ Format:
- Use short PARAGRAPHS to explain themes.
- Use BULLETS to list trends, jobs, or market signals.
- Keep it relevant to the user's question.
- End with a positive, clear tone if appropriate.

🚫 Never say:
- “I don’t have data”
- “According to external sources”
- “Based on my knowledge”
- “The following data shows…”

📌 If the data does not match the question, just say:
"Data not available."

After writing the response, explain it in very simple and easy-to-understand language for all users.


### Provided Info:
DATA = ${data}

### Chat Context:
${conversationContext}

`;

    // 👇 AI Invocation
    const aiRes = await gemini.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(`${conversationContext}\n\n${userMsg}`), // user's actual question
    ]);
    
  const intent = extractContent(aires.content).toLowerCase().trim();
    console.log("This is the ai response", intent);

    return {
      realtimejobs: aiRes.content,
      analytics: "",
      direct: "",
    };
  } catch (error) {
    console.log(error);
    return {
      realtimejobs: "Server error",
      analytics: "",
      direct: "",
    };
  }
}

export async function initializeAgent(
  userMessage: string,
  userId: Ifreelancer | IClient,
  sessionId?:string,   //optional session id
) {
  try {
    // Create memory saver for persistence
    const memory = new MemorySaver();

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
      .addEdge("fallback", "generateAnswer")
      .addEdge("generateAnswer", "__end__");

    // Compile with checkpointer for persistence
    const app = workflow.compile({ checkpointer: memory });

    // Create config with consistent thread_id for conversation persistence

const thread_id=sessionId || `user-${userId._id}-${Date.now()}`

   const config={
     configurable:{
      thread_id:thread_id,
      userId
     }
   }

    console.log("=== First Question ===");
    const finalState = await app.invoke(
      {
        messages: [new HumanMessage(`${userMessage}`)],
      },
      config
    );


    console.log("This is the final state",finalState)

   

    return {
      aiRes: finalState.messages[finalState.messages.length - 1].content,
    };
    // Optional: Test analytics intent
  } catch (error) {
    console.error("Error in initializeAgent:", error);
  }
}
