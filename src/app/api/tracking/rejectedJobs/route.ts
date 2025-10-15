import { NextResponse } from "next/server";
import Tracking from "@/helper/model/feedback.model";
import { mongoDBConncection } from "@/app/dbConfig/db";
import { Types } from "mongoose";

interface RejectedJob {
  jobId: Types.ObjectId;
  rejectedAt: Date;
}

export async function POST(req: Request) {
  try {
    await mongoDBConncection();
    const { freelancerId, jobId } = await req.json();
  
    if (!freelancerId || !jobId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
  
    let tracking = await Tracking.findOne({ freeLancerId: freelancerId });
    if (!tracking) tracking = new Tracking({ freeLancerId: freelancerId });

    // Check if job already exists in rejectedJobs
    const existingJobIndex = tracking.rejectedJobs.findIndex(
      (job: RejectedJob) => job.jobId.toString() === jobId.toString()
    );

    if (existingJobIndex !== -1) {
      // Update existing rejected job timestamp
      tracking.rejectedJobs[existingJobIndex].rejectedAt = new Date();
    } else {
      // Add new rejected job
      tracking.rejectedJobs.push({
        jobId,
        rejectedAt: new Date(),
      });
    }
  
    await tracking.save();
  
    return NextResponse.json({ success: true, message: "Job rejection tracked" });
  } catch (error) {
    console.log("Error in updating rejected job details:-", error);
    return NextResponse.json({ success: false, message: "Failed to track job rejection" }, { status: 500 });
  }
}
