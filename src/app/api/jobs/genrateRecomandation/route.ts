import { getDataFromToken } from "@/helper/getDataFromToken";
import postJob from "@/helper/model/postJob";
import { NextRequest, NextResponse } from "next/server";
import { mongoDBConncection } from "@/app/dbConfig/db";
import "@/helper/model/Client.model";
import Freelancer from "@/helper/model/freelancer.model";
import { JobRecomandation } from "@/service/JobRecomandationSystem";
import { redis } from "@/service/redish.service";

export async function GET(request: NextRequest) {
  try {
    await mongoDBConncection();

    const userID = getDataFromToken(request);
    if (!userID) throw new Error("User unauthorized");

    const freelancerIdDetails = await Freelancer.find({ userId: userID }).select("Proffession Skills");

    // const redis = new Redis({
    //   host: process.env.REDIS_C,
    //   port: 19824,
    //   username: "default",
    //   password: "3iV7W8pB49zwzIhebJA7eA7Uc8n4fbav"
    // });
    redis.on("connect", () => console.log("✅ Redis connected"));
    redis.on("error", (err) => console.error("❌ Redis Error:", err));

    const retrievedIds = await redis.smembers(`user:${userID}:ids`);
    const googleOp = await redis.get(`user:${userID}:googleQuery`);
    console.log("These are the ids from Redis:", retrievedIds);
    console.log("These are the query",googleOp)


    const jobOp = [];
    let googleQuery;
    let jobIds: string[] = [];

    if (Array.isArray(retrievedIds) && retrievedIds.length > 0) {
      jobIds = retrievedIds;
      console.log("Processing job IDs from Redis:", jobIds);

      for (const jobId of jobIds) {
        if (!jobId || typeof jobId !== "string" || jobId.length !== 24) {
          console.log("Invalid job ID format:", jobId);
          continue;
        }
        try {
          const jobData = await postJob.findById(jobId).populate("clientId");
          if (jobData) jobOp.push(jobData);
          else console.log("Job not found:", jobId);
        } catch (error) {
          console.log("Failed to fetch job:", jobId, "Error:", error);
        }
      }

      return NextResponse.json({
        data: jobOp,
        google:googleOp,
        message: `Found ${jobOp.length} recommended jobs out of ${jobIds.length} requested`,
        recommendedCount: jobOp.length,
        requestedCount: jobIds.length
      }, { status: 200 });
    }

    // If no cached Redis IDs, get new recommendations
    let recomandedJobs = null;
    if (freelancerIdDetails && freelancerIdDetails.length > 0) {
      recomandedJobs = await JobRecomandation(JSON.stringify(freelancerIdDetails[0]));
      console.log("These are the recommended jobs:", recomandedJobs);
    }

    // Narrowing types for recomandedJobs
    if (
      recomandedJobs &&
      typeof recomandedJobs === "object" &&
      !Array.isArray(recomandedJobs) 
    ) {
      jobIds = (recomandedJobs as { jobId: string[] }).jobId;
      googleQuery=recomandedJobs.google;
    } else if (Array.isArray(recomandedJobs)) {
      jobIds = recomandedJobs as string[];
    } else {
      console.log("Recommended jobs format unexpected:", recomandedJobs);
      jobIds = [];
    }

    console.log("Processing new recommended job IDs:", jobIds);

    for (const jobId of jobIds) {
      if (!jobId || typeof jobId !== "string" || jobId.length !== 24) {
        console.log("Invalid job ID format:", jobId);
        continue;
      }
      try {
        const jobData = await postJob.findById(jobId).populate("clientId");
        if (jobData) jobOp.push(jobData);
        else console.log("Job not found:", jobId);
      } catch (error) {
        console.log("Failed to fetch job:", jobId, "Error:", error);
      }
    }

    try {
      await redis.del(`user:${userID}:ids`);
      if (jobIds.length > 0) {
        await redis.sadd(`user:${userID}:ids`, ...jobIds);
        if (googleQuery && typeof googleQuery === 'string') {
  await redis.set(`user:${userID}:googleQuery`, googleQuery, 'EX', 1600); // set with expiry 1600 seconds
}
        await redis.expire(`user:${userID}:ids`, 1600);
      }
    } catch (error) {
      console.log("Error updating Redis cache:", error);
    }

console.log("Google query",googleQuery)

    if (jobOp.length > 0) {
      return NextResponse.json({
        data: jobOp,
        google:googleQuery,
        message: `Found ${jobOp.length} recommended jobs out of ${jobIds.length} requested`,
        recommendedCount: jobOp.length,
        requestedCount: jobIds.length
      }, { status: 200 });
    }

    // Fallback: no recommended jobs, return all jobs from database
    console.log("No recommended jobs found, returning all jobs");
    const allJobs = await postJob.find().populate("clientId");
    if (!allJobs || allJobs.length === 0) {
      return NextResponse.json({ data: [], message: "No jobs found in database" }, { status: 200 });
    }
    return NextResponse.json({
      data: allJobs,
      message: `Returning ${allJobs.length} total jobs`,
      totalCount: allJobs.length
    }, { status: 200 });

  } catch (error) {
    console.error("Error in GET handler:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 500 });
  }
}
