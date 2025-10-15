import { NextResponse } from "next/server";
import Tracking from "@/helper/model/feedback.model";
import { mongoDBConncection } from "@/app/dbConfig/db";
import { Types } from "mongoose";

interface AppliedJob {
  jobId: Types.ObjectId;
  appliedAt: Date;
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

    const existingJobIndex = tracking.appliedJobs.findIndex(
      (job: AppliedJob) => job.jobId.toString() === jobId.toString()
    );

    if (existingJobIndex !== -1) {
      tracking.appliedJobs[existingJobIndex].appliedAt = new Date();
    } else {
      tracking.appliedJobs.push({
        jobId,
        appliedAt: new Date(),
      });
    }
  
    await tracking.save();
  
    return NextResponse.json({ success: true, message: "Job application tracked" });
  } catch (error) {
    console.log("Error in updating applied job details:-", error);
    return NextResponse.json({ success: false, message: "Failed to track job application" }, { status: 500 });
  }
}
