import { mongoDBConncection } from "@/app/dbConfig/db";
import { getDataFromToken } from "@/helper/getDataFromToken";
import Freelancer from "@/helper/model/freelancer.model";
import Tracking from "@/helper/model/feedback.model";
import { NextRequest, NextResponse } from "next/server";
import { pinecone } from "@/service/pinecone.service";
import PostJob from "@/helper/model/postJob";
import { queryEmbedding } from "@/helper/textembedding";
import mongoose from "mongoose";


interface CandidateJob {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  skills: string[];
  budget: number;
  status: boolean;
}


interface JobWithScore {
  job: CandidateJob;
  score: number;
}


export async function GET(request: NextRequest) {
  try {
    await mongoDBConncection();

    const userId = getDataFromToken(request);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized user" }, { status: 401 });
    }

    const freelancer = await Freelancer.findOne({ userId }).select(
      "_id appliedFor"
    );
    if (!freelancer) {
      return NextResponse.json(
        { message: "Freelancer profile not found" },
        { status: 404 }
      );
    }

    // Sync appliedFor jobs
    let trackingData = await Tracking.findOne({ freeLancerId: freelancer._id });

    if (freelancer.appliedFor && freelancer.appliedFor.length > 0) {
      if (!trackingData) {
        trackingData = new Tracking({
          freeLancerId: freelancer._id,
          appliedJobs: freelancer.appliedFor.map((jobId: any) => ({
            jobId: jobId,
            appliedAt: new Date(),
          })),
          viewedJobs: [],
          savedJobs: [],
          rejectedJobs: [],
          searchHistoryOfFreelancer: [],
          sessionLogs: [],
        });
        await trackingData.save();
      } else {
        const existingAppliedJobIds = trackingData.appliedJobs.map((app: any) =>
          app.jobId.toString()
        );

        const newAppliedJobs = freelancer.appliedFor
          .filter(
            (jobId: any) =>
              !existingAppliedJobIds.includes(jobId.toString())
          )
          .map((jobId: any) => ({
            jobId: jobId,
            appliedAt: new Date(),
          }));

        if (newAppliedJobs.length > 0) {
          await Tracking.updateOne(
            { freeLancerId: freelancer._id },
            { $push: { appliedJobs: { $each: newAppliedJobs } } }
          );
          trackingData = await Tracking.findOne({
            freeLancerId: freelancer._id,
          });
        }
      }
    }

    if (
      !trackingData ||
      !trackingData.viewedJobs ||
      trackingData.viewedJobs.length === 0
    ) {
      return NextResponse.json(
        {
          message: "No activity tracked yet",
          data: [],
        },
        { status: 200 }
      );
    }

    // ════════════════════════════════════════════════════════════════════════
    // STEP 1: CALCULATE JOB SCORES FROM USER TRACKING ONLY
    // ════════════════════════════════════════════════════════════════════════
    
    const jobScores: { [key: string]: number } = {};

    // Views: 0.01 score per 10-second interval
    // Duration is in milliseconds, so divide by 10000 to get 10-second intervals
    trackingData.viewedJobs.forEach(
      (view: { jobId: any; duration: number }) => {
        const jobId = view.jobId.toString();
        const tenSecondIntervals = Math.floor((view.duration || 0) / 1000);
        const viewScore = tenSecondIntervals * 0.01;
        jobScores[jobId] = (jobScores[jobId] || 0) + viewScore;
      }
    );

    // Applied: +1.0 score
    trackingData.appliedJobs.forEach((application: { jobId: any }) => {
      const jobId = application.jobId.toString();
      jobScores[jobId] = (jobScores[jobId] || 0) + 1.0;
    });

    // Rejected: -0.8 score
    trackingData.rejectedJobs.forEach((rejection: { jobId: any }) => {
      const jobId = rejection.jobId.toString();
      jobScores[jobId] = (jobScores[jobId] || 0) - 0.8;
    });

    if (Object.keys(jobScores).length === 0) {
      return NextResponse.json(
        {
          message: "No activity tracked yet",
          data: [],
        },
        { status: 200 }
      );
    }

    // Find highest scored job to use as reference for semantic search
    const highestScoredJobId = Object.keys(jobScores).reduce((a, b) =>
      jobScores[a] > jobScores[b] ? a : b
    );

    console.log("Highest scored job ID:", highestScoredJobId);
    console.log("Job scores from tracking:", jobScores);

    const referenceJob = await PostJob.findById(highestScoredJobId);
    if (!referenceJob) {
      return NextResponse.json(
        {
          message: "Reference job not found",
        },
        { status: 404 }
      );
    }

    // ════════════════════════════════════════════════════════════════════════
    // STEP 2: SEMANTIC SEARCH IN PINECONE FOR SIMILAR JOBS
    // ════════════════════════════════════════════════════════════════════════

    const queryText = `${referenceJob.title} ${referenceJob.description} ${referenceJob.skills.join(
      " "
    )}`;
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

    const appliedJobIds = trackingData.appliedJobs.map((app: any) =>
      app.jobId.toString()
    );
    const rejectedJobIds = trackingData.rejectedJobs.map((rej: any) =>
      rej.jobId.toString()
    );
    const excludedJobIds = [...appliedJobIds, ...rejectedJobIds, highestScoredJobId];

    const filteredJobIds = similarJobIds.filter(
      (jobId: string) => !excludedJobIds.includes(jobId)
    );

    console.log("Filtered job IDs:", filteredJobIds);

    if (filteredJobIds.length === 0) {
      return NextResponse.json(
        {
          message: "No new similar jobs found",
          data: [],
        },
        { status: 200 }
      );
    }

    // ════════════════════════════════════════════════════════════════════════
    // STEP 3: FETCH CANDIDATE JOBS FROM DATABASE
    // ════════════════════════════════════════════════════════════════════════

    const objectIds = filteredJobIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );
    const candidateJobs = (await PostJob.find({ _id: { $in: objectIds } })
      .select("_id title description skills budget status createdAt")
      .lean()) as unknown as CandidateJob[];

    if (candidateJobs.length === 0) {
      return NextResponse.json(
        {
          message: "No candidate jobs found in database",
          data: [],
        },
        { status: 200 }
      );
    }

    // ════════════════════════════════════════════════════════════════════════
    // STEP 4: SORT JOBS BY TRACKING SCORE ONLY (NO RELEVANCE CALCULATION)
    // ════════════════════════════════════════════════════════════════════════

    const jobsWithScores: JobWithScore[] = candidateJobs
      .map((job) => ({
        job,
        score: jobScores[job._id.toString()] || 0,
      }))
      .sort((a, b) => b.score - a.score);

    const rankedJobs = jobsWithScores.map((item) => item.job);

    // Log scoring details for debugging
    console.log(
      "Job scores (tracking only):",
      jobsWithScores.map((j) => ({
        _id: j.job._id.toString(),
        title: j.job.title,
        trackingScore: j.score.toFixed(3),
      }))
    );

    return NextResponse.json(
      {
        message: "Job recommendations ranked by user tracking behavior",
        data: rankedJobs,
        metadata: {
          referenceJobId: highestScoredJobId,
          referenceJobScore: jobScores[highestScoredJobId].toFixed(3),
          totalJobsTracked: Object.keys(jobScores).length,
          recommendationsCount: rankedJobs.length,
          scoringMethod: "tracking-only",
          scoringBreakdown: {
            viewScore: "0.01 per 10-second interval",
            appliedScore: "+1.0",
            rejectedScore: "-0.8",
          },
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in job recommendation:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
