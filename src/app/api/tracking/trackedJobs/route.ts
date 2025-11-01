import { mongoDBConncection } from "@/app/dbConfig/db";
import { getDataFromToken } from "@/helper/getDataFromToken";
import Freelancer from "@/helper/model/freelancer.model";
import Tracking from "@/helper/model/feedback.model";
import { NextRequest, NextResponse } from "next/server";
import { pinecone } from "@/service/pinecone.service";
import PostJob from "@/helper/model/postJob";
import { ChatGroq } from "@langchain/groq";
import { queryEmbedding } from "@/helper/textembedding";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import mongoose from "mongoose";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

// MongoDB query tools
const getJobsByIdsTool = tool(
  async ({ jobIds }: { jobIds: string[] }) => {
    try {
      await mongoDBConncection();
      const objectIds = jobIds.map(id => new mongoose.Types.ObjectId(id));
      
      const jobs = await PostJob.find({ _id: { $in: objectIds } })
        .select('_id title description skills budget status')
        .lean();
      
      return JSON.stringify(jobs);
    } catch (error: any) {
      return JSON.stringify({ error: error.message });
    }
  },
  {
    name: "get_jobs_by_ids",
    description: "Fetch job details from MongoDB by providing job IDs",
    schema: z.object({
      jobIds: z.array(z.string()).describe("Array of MongoDB job IDs")
    }),
  }
);

export async function GET(request: NextRequest) {
  try {
    await mongoDBConncection();
    
    const userId = getDataFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized user" }, { status: 401 });
    }
    
    const freelancer = await Freelancer.findOne({ userId }).select("_id appliedFor");
    if (!freelancer) {
      return NextResponse.json({ message: "Freelancer profile not found" }, { status: 404 });
    }
    
    // Sync appliedFor jobs
    let trackingData = await Tracking.findOne({ freeLancerId: freelancer._id });
    
    if (freelancer.appliedFor && freelancer.appliedFor.length > 0) {
      if (!trackingData) {
        trackingData = new Tracking({
          freeLancerId: freelancer._id,
          appliedJobs: freelancer.appliedFor.map((jobId: any) => ({
            jobId: jobId,
            appliedAt: new Date()
          })),
          viewedJobs: [],
          savedJobs: [],
          rejectedJobs: [],
          searchHistoryOfFreelancer: [],
          sessionLogs: []
        });
        await trackingData.save();
      } else {
        const existingAppliedJobIds = trackingData.appliedJobs.map(
          (app: any) => app.jobId.toString()
        );
        
        const newAppliedJobs = freelancer.appliedFor
          .filter((jobId: any) => !existingAppliedJobIds.includes(jobId.toString()))
          .map((jobId: any) => ({
            jobId: jobId,
            appliedAt: new Date()
          }));
        
        if (newAppliedJobs.length > 0) {
          await Tracking.updateOne(
            { freeLancerId: freelancer._id },
            { $push: { appliedJobs: { $each: newAppliedJobs } } }
          );
          trackingData = await Tracking.findOne({ freeLancerId: freelancer._id });
        }
      }
    }
    
    if (!trackingData || !trackingData.viewedJobs || trackingData.viewedJobs.length === 0) {
      return NextResponse.json({ 
        message: "No activity tracked yet",
        data: [] 
      }, { status: 200 });
    }
    
    // Calculate job scores
    const jobScores: { [key: string]: number } = {};
    
    trackingData.viewedJobs.forEach((view: { jobId: any; duration: number }) => {
      const jobId = view.jobId.toString();
      const tenSecondIntervals = Math.floor((view.duration || 0) / 10);
      const viewScore = tenSecondIntervals * 0.01;
      jobScores[jobId] = (jobScores[jobId] || 0) + viewScore;
    });
    
    trackingData.appliedJobs.forEach((application: { jobId: any }) => {
      const jobId = application.jobId.toString();
      jobScores[jobId] = (jobScores[jobId] || 0) + 1.0;
    });
    
    trackingData.rejectedJobs.forEach((rejection: { jobId: any }) => {
      const jobId = rejection.jobId.toString();
      jobScores[jobId] = (jobScores[jobId] || 0) - 0.8;
    });
    
    if (Object.keys(jobScores).length === 0) {
      return NextResponse.json({ 
        message: "No activity tracked yet",
        data: [] 
      }, { status: 200 });
    }
    
    const highestScoredJobId = Object.keys(jobScores).reduce((a, b) =>
      jobScores[a] > jobScores[b] ? a : b
    );
    
    console.log("Highest scored job ID:", highestScoredJobId);
    
    const referenceJob = await PostJob.findById(highestScoredJobId);
    if (!referenceJob) {
      return NextResponse.json({ 
        message: "Reference job not found" 
      }, { status: 404 });
    }
    
    // Semantic search
    const queryText = `${referenceJob.title} ${referenceJob.description} ${referenceJob.skills.join(" ")}`;
    const queryEmbeddings = await queryEmbedding(queryText);
    
    const index = pinecone.Index("jobs");
    const searchResults = await index.query({
      topK: 20,
      vector: queryEmbeddings,
      includeMetadata: true,
    });
    
    const similarJobIds = searchResults.matches.map((match: { id: string }) => {
      return match.id.replace(/^job-/, "");
    });
    
    const appliedJobIds = trackingData.appliedJobs.map((app: any) => app.jobId.toString());
    const rejectedJobIds = trackingData.rejectedJobs.map((rej: any) => rej.jobId.toString());
    const excludedJobIds = [...appliedJobIds, ...rejectedJobIds, highestScoredJobId];
    
    const filteredJobIds = similarJobIds.filter(
      (jobId: string) => !excludedJobIds.includes(jobId)
    );
    
    console.log("Filtered job IDs:", filteredJobIds);
    
    if (filteredJobIds.length === 0) {
      return NextResponse.json({ 
        message: "No new similar jobs found",
        data: [] 
      }, { status: 200 });
    }
    
    // Initialize LLM with proper prompt template
    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      maxTokens: 2000,
    });
    
    const tools = [getJobsByIdsTool];
    
    // IMPORTANT: Use MessagesPlaceholder for agent_scratchpad[web:48][web:52]
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are a job recommendation expert. Your task is to analyze candidate jobs and rank them by relevance to the user's preferred job.

User's Preferred Job:
- Title: {jobTitle}
- Description: {jobDescription}
- Skills Required: {jobSkills}
- Budget: {budget}

Candidate Job IDs: {filteredJobIds}

INSTRUCTIONS:
1. First, use the get_jobs_by_ids tool to fetch all candidate job details
2. Compare each job against the reference job based on:
   - Skills match (most critical)
   - Budget alignment
   - Job title similarity
   - Description relevance
3. Return ONLY a valid JSON array of job IDs ranked from best to worst match

Example output format:
["jobId1", "jobId2", "jobId3"]

Do not include any other text, explanation, or markdown formatting.`
      ],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);
    
    // Create the agent[web:48][web:52]
    const agent = createToolCallingAgent({
      llm: model,
      tools: tools,
      prompt: prompt,
    });
    
    const agentExecutor = new AgentExecutor({
      agent: agent,
      tools: tools,
      verbose: true,
      maxIterations: 10,
      handleParsingErrors: true,
    });
    
    try {
      // Invoke agent with all input variables[web:52]
      const result = await agentExecutor.invoke({
        jobTitle: referenceJob.title,
        jobDescription: referenceJob.description,
        jobSkills: referenceJob.skills.join(", "),
        budget: referenceJob.budget,
        filteredJobIds: JSON.stringify(filteredJobIds),
      });
      
      console.log("Agent result:", result);
      
      let rerankedJobIds: string[] = [];
      
      try {
        if (typeof result.output === 'string') {
          // Extract JSON array safely
          const jsonMatch = result.output.match(/\[[\s\S]*?\]/);
          if (jsonMatch) {
            rerankedJobIds = JSON.parse(jsonMatch[0]);
          }
        }
      } catch (parseError) {
        console.error("Failed to parse agent output:", parseError);
      }
      
      // Validate parsed data
      if (!Array.isArray(rerankedJobIds) || rerankedJobIds.length === 0) {
        console.log("Invalid reranked IDs, using fallback");
        
        const fallbackJobs = await PostJob.find({ 
          _id: { $in: filteredJobIds.map(id => new mongoose.Types.ObjectId(id)) }
        }).limit(10);
        
        return NextResponse.json({
          message: "Recommendations generated (fallback - invalid ranking)",
          data: fallbackJobs,
          metadata: {
            referenceJobId: highestScoredJobId,
            referenceJobScore: jobScores[highestScoredJobId],
            recommendationsCount: fallbackJobs.length,
            usedFallback: true
          }
        }, { status: 200 });
      }
      
      // Fetch and sort final jobs
      const objectIds = rerankedJobIds.map((id: string) => new mongoose.Types.ObjectId(id));
      const finalJobData = await PostJob.find({ 
        _id: { $in: objectIds } 
      });
      
      const sortedJobData = rerankedJobIds
        .map((id: string) => finalJobData.find((job: any) => job._id.toString() === id))
        .filter((job: any) => job !== undefined);
      
      return NextResponse.json(
        {
          message: "Personalized job recommendations generated successfully",
          data: sortedJobData,
          metadata: {
            referenceJobId: highestScoredJobId,
            referenceJobScore: jobScores[highestScoredJobId],
            totalJobsScored: Object.keys(jobScores).length,
            recommendationsCount: sortedJobData.length,
            usedFallback: false
          }
        },
        { status: 200 }
      );
      
    } catch (agentError: any) {
      console.error("Error with agent execution:", agentError);
      
      // Fallback: Direct query
      const fallbackJobs = await PostJob.find({ 
        _id: { $in: filteredJobIds.map(id => new mongoose.Types.ObjectId(id)) }
      }).limit(10);
      
      return NextResponse.json({
        message: "Recommendations generated with direct query",
        data: fallbackJobs,
        metadata: {
          referenceJobId: highestScoredJobId,
          recommendationsCount: fallbackJobs.length,
          usedFallback: true,
          error: agentError.message
        }
      }, { status: 200 });
    }
    
  } catch (error: any) {
    console.error("Error in job recommendation:", error);
    return NextResponse.json({ 
      message: "Internal server error", 
      error: error.message 
    }, { status: 500 });
  }
}
