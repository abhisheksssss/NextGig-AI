import { mongoDBConncection } from "@/app/dbConfig/db";
import { getDataFromToken } from "@/helper/getDataFromToken";
import Freelancer from "@/helper/model/freelancer.model";
import Tracking from "@/helper/model/feedback.model";
import { NextRequest, NextResponse } from "next/server";
import { pinecone } from "@/service/pinecone.service";
import PostJob from "@/helper/model/postJob";
import { ChatGroq } from "@langchain/groq";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { queryEmbedding } from "@/helper/textembedding";

export async function GET(request: NextRequest) {
  try {
    await mongoDBConncection();
    
    const userId = getDataFromToken(request);
    
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized user" }, { status: 401 });
    }
    
    // Fetch freelancer with appliedFor field
    const freelancer = await Freelancer.findOne({ userId }).select("_id appliedFor");
    if (!freelancer) {
      return NextResponse.json({ message: "Freelancer profile not found" }, { status: 404 });
    }
    
    // Find or create tracking data
    let trackingData = await Tracking.findOne({ freeLancerId: freelancer._id });
    
    // Sync appliedFor jobs from Freelancer schema to Tracking appliedJobs
    if (freelancer.appliedFor && freelancer.appliedFor.length > 0) {
      if (!trackingData) {
        // Create new tracking document if it doesn't exist
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
        // Get existing applied job IDs to avoid duplicates
        const existingAppliedJobIds = trackingData.appliedJobs.map(
          (app: any) => app.jobId.toString()
        );
        
        // Filter out jobs that are already in appliedJobs
        const newAppliedJobs = freelancer.appliedFor
          .filter((jobId: any) => !existingAppliedJobIds.includes(jobId.toString()))
          .map((jobId: any) => ({
            jobId: jobId,
            appliedAt: new Date()
          }));
        
        // Push new applied jobs if any
        if (newAppliedJobs.length > 0) {
          await Tracking.updateOne(
            { freeLancerId: freelancer._id },
            { $push: { appliedJobs: { $each: newAppliedJobs } } }
          );
          
          // Refresh tracking data
          trackingData = await Tracking.findOne({ freeLancerId: freelancer._id });
        }
      }
    }
    
    if (!trackingData) {
      return NextResponse.json({ 
        message: "No activity tracked yet",
        data: [] 
      }, { status: 200 });
    }
    
    // Check if there are any viewed jobs
    if (!trackingData.viewedJobs || trackingData.viewedJobs.length === 0) {
      return NextResponse.json({ 
        message: "No activity tracked yet",
        data: [] 
      }, { status: 200 });
    }
    
    // Calculate job scores using the formula: 
    // score = (views(time in each 10 seconds) * 0.01) + (applied * 1.0) - (rejected * 0.8)
    const jobScores: { [key: string]: number } = {};
    
    // Process viewed jobs: convert duration (seconds) to 10-second intervals
    // Each 10 seconds viewed = 0.01 points
    trackingData.viewedJobs.forEach((view: { 
      jobId: { toString: () => string }; 
      duration: number;
    }) => {
      const jobId = view.jobId.toString();
      const durationInSeconds = view.duration || 0;
      
      // Calculate how many 10-second intervals
      const tenSecondIntervals = Math.floor(durationInSeconds / 10);
      
      // Each 10-second interval adds 0.01 to the score
      const viewScore = tenSecondIntervals * 0.01;
      
      jobScores[jobId] = (jobScores[jobId] || 0) + viewScore;
    });
    
    // Process applied jobs: each application adds 1.0 to the score
    trackingData.appliedJobs.forEach((application: { 
      jobId: { toString: () => string };
    }) => {
      const jobId = application.jobId.toString();
      jobScores[jobId] = (jobScores[jobId] || 0) + 1.0;
    });
    
    // Process rejected jobs: each rejection subtracts 0.8 from the score
    trackingData.rejectedJobs.forEach((rejection: { 
      jobId: { toString: () => string };
    }) => {
      const jobId = rejection.jobId.toString();
      jobScores[jobId] = (jobScores[jobId] || 0) - 0.8;
    });
    
    if (Object.keys(jobScores).length === 0) {
      return NextResponse.json({ 
        message: "No activity tracked yet",
        data: [] 
      }, { status: 200 });
    }
    
    // Find highest scored job as the reference job for semantic search
    const highestScoredJobId = Object.keys(jobScores).reduce((a, b) =>
      jobScores[a] > jobScores[b] ? a : b
    );
    
    console.log("Job scores:", jobScores);
    console.log("Highest scored job ID:", highestScoredJobId);
    console.log("Highest score:", jobScores[highestScoredJobId]);
    
    // Fetch the highest scored job details
    const referenceJob = await PostJob.findById(highestScoredJobId);
    if (!referenceJob) {
      return NextResponse.json({ 
        message: "Reference job not found in database" 
      }, { status: 404 });
    }
    
    // Generate embeddings for semantic search
    const queryText = `${referenceJob.title} ${referenceJob.description} ${referenceJob.skills.join(" ")}`;
    const queryEmbeddings = await queryEmbedding(queryText);
    
    // Perform semantic search in Pinecone
    const index = pinecone.Index("jobs");
    
    const searchResults = await index.query({
      topK: 20,
      vector: queryEmbeddings,
      includeMetadata: true,
    });
    
    // Extract job IDs and clean them
    const similarJobIds = searchResults.matches.map((match: { id: string }) => {
      return match.id.replace(/^job-/, "");
    });
    
    // Get all interacted job IDs to exclude from recommendations
    const appliedJobIds = trackingData.appliedJobs.map(
      (app: any) => app.jobId.toString()
    );
    const rejectedJobIds = trackingData.rejectedJobs.map(
      (rej: any) => rej.jobId.toString()
    );
    
    // Exclude already applied, rejected, and the reference job itself
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
    
    // Fetch job details from database
    const candidateJobs = await PostJob.find({ _id: { $in: filteredJobIds } });
    
    if (candidateJobs.length === 0) {
      return NextResponse.json({ 
        message: "No new similar jobs found",
        data: [] 
      }, { status: 200 });
    }
    
    // Use LLM to re-rank jobs based on relevance
    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "openai/gpt-oss-120b",
      temperature: 0,
    });
    
    const parser = new JsonOutputParser();
    
    const prompt = PromptTemplate.fromTemplate(
      `You are a job recommendation expert. Based on the user's most preferred job, re-rank the following jobs by relevance.

User's Preferred Job:
Title: {jobTitle}
Description: {jobDescription}
Skills: {jobSkills}

Candidate Jobs to Re-rank:
{candidateJobs}

Return ONLY a JSON array of job IDs ordered from most relevant to least relevant.
Format: ["jobId1", "jobId2", "jobId3", ...]

{format_instructions}`
    );
    
    const chain = prompt.pipe(model).pipe(parser);
    
    const rerankedJobIds = await chain.invoke({
      jobTitle: referenceJob.title,
      jobDescription: referenceJob.description,
      jobSkills: referenceJob.skills.join(", "),
      candidateJobs: JSON.stringify(candidateJobs.map(job => ({
        _id: job._id,
        title: job.title,
        description: job.description,
        skills: job.skills
      }))),
      format_instructions: parser.getFormatInstructions(),
    });
    
    console.log("LLM reranked job IDs:", rerankedJobIds);
    
    // Validate LLM output
    if (!Array.isArray(rerankedJobIds) || rerankedJobIds.length === 0) {
      // Fallback: return jobs in original order
      return NextResponse.json({
        message: "Personalized job recommendations generated successfully",
        data: candidateJobs,
        metadata: {
          referenceJobId: highestScoredJobId,
          referenceJobScore: jobScores[highestScoredJobId],
          totalJobsScored: Object.keys(jobScores).length,
          recommendationsCount: candidateJobs.length
        }
      }, { status: 200 });
    }
    
    // Fetch final data from database using reranked IDs
    const finalJobData = await PostJob.find({ 
      _id: { $in: rerankedJobIds } 
    });
    
    // Sort results to match LLM's ranking order
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
          recommendationsCount: sortedJobData.length
        }
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error("Error in job recommendation:", error);
    return NextResponse.json({ 
      message: "Internal server error", 
      error: error.message 
    }, { status: 500 });
  }
}
