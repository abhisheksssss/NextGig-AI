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

// Define a custom state that extends MessagesAnnotation
const MyState = Annotation.Root({
  ...MessagesAnnotation.spec,
  intent: Annotation<string>(),
  analytics: Annotation<string>(),
  realtime: Annotation<string>(),
  direct: Annotation<string>(),
  realtimejobs: Annotation<string>(),
  userId: Annotation<Ifreelancer | IClient>(),
});

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

  console.log("This is the generated answer", {
    messages: [...(state.messages || []), new AIMessage(answer)],
  });

  // **FIX: Clear the state values after using them to prevent accumulation**
  return {
    messages: [...(state.messages || []), new AIMessage(answer)],
    analytics: "",
    realtime: "",
    direct: "",
  };
}

async function fetchAnalytics({ messages }: typeof MyState.State, config: any) {
  const userId = config.configurable.userId;
  console.log("This is userId", userId);
  const userMsg = messages[messages.length - 1]?.content || "";
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
  const conversationContext = messages
    .slice(-3)
    .map(
      (msg) =>
        `${
          msg.constructor.name === "HumanMessage" ? "User" : "Assistant"
        }: ${extractContent(msg.content)}`
    )
    .join("\n");

console.log(conversationContext)

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
    realtimejobs: "",
    realtime: "",
    direct: "",
  };
}

async function fallbackNode({ messages }: typeof MyState.State) {
  const userMsg = messages[messages.length - 1]?.content || "";

  const gemini = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash-8b",
    temperature: 0,
    apiKey: process.env.GOOGLE_API_KEY,
  });

  const aiMsg = await gemini.invoke([new HumanMessage(`${userMsg}`)]);
  console.log("This is the ai response", aiMsg);

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

    const tool = tavily({ apiKey: process.env.TAVILY_API_KEY });
    const answer = await tool.search(`${userMsg}`);

    console.log("This is the answer of real time", answer);

    const data = JSON.stringify(
      answer.results.slice(0, 2).map((m) => ({
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

Your final output should be a smooth, well-written paragraph based only on the above.}`;

    // 👇 AI Invocation
    const aiRes = await gemini.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(`${userMsg}`), // user's actual question
    ]);

    console.log("This is the ai response", aiRes);

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

    const gemini2 = new ChatGoogleGenerativeAI({
      model: "gemini-1.5-flash-8b",
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
      `https://gnews.io/api/v4/search?q=${aires.content}&apikey=aa65afb860a134f5e8bc400c49d76f86`
    );
    const answer = await fetchData.json();

    console.log("This is the answer of real time", answer);

    const data = JSON.stringify(
      answer.articles.slice(0, 10).map((m) => ({
        title: m.title,
        description: m.description,
        content: m.content,
      }))
    );

    console.log("This is the data", data);

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
      new HumanMessage(`${userMsg}`), // user's actual question
    ]);

    console.log("This is the ai response", aiRes);

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
  userId: Ifreelancer | IClient
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
    const config = { configurable: { thread_id: "conversation-1", userId } };

    console.log("=== First Question ===");
    const finalState = await app.invoke(
      {
        messages: [new HumanMessage(`${userMessage}`)],
      },
      config
    );

    console.log(
      "Final State:",
      finalState.messages[finalState.messages.length - 1].content
    );

    return {
      aiRes: finalState.messages[finalState.messages.length - 1].content,
    };
    // Optional: Test analytics intent
  } catch (error) {
    console.error("Error in initializeAgent:", error);
  }
}
