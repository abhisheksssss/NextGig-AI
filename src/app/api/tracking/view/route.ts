import { NextResponse } from "next/server";
import Tracking from "@/helper/model/feedback.model";
import { mongoDBConncection } from "@/app/dbConfig/db";
import { Types } from "mongoose";

interface ViewedJob {
  jobId: Types.ObjectId;
  viewedAt: Date;
  duration: number;
}

export async function POST(req: Request) {
  try {
    await mongoDBConncection();
    const { freelancerId, jobId, duration } = await req.json();
  
    if (!freelancerId || !jobId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
  
    let tracking = await Tracking.findOne({ freeLancerId: freelancerId });
    if (!tracking) tracking = new Tracking({ freeLancerId: freelancerId });

    // Check if job already exists in viewedJobs
    const existingJobIndex = tracking.viewedJobs.findIndex(
      (job:ViewedJob) => job.jobId.toString() === jobId.toString()
    );

    if (existingJobIndex !== -1) {
      // Update existing job view
      tracking.viewedJobs[existingJobIndex].viewedAt = new Date();
      tracking.viewedJobs[existingJobIndex].duration = duration || 0;
    } else {
      // Add new job view
      tracking.viewedJobs.push({
        jobId,
        viewedAt: new Date(),
        duration: duration || 0,
      });
    }
  
    await tracking.save();
  
    return NextResponse.json({ success: true, message: "Job view tracked" });
  } catch (error) {
    console.log("Error in updating viewing job details:-", error);
    return NextResponse.json({ success: false, message: "Failed to track job view" }, { status: 500 });
  }
}
