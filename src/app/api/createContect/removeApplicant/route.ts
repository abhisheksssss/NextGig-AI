import Freelancer from "@/helper/model/freelancer.model";
import PostJob from "@/helper/model/postJob";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server"




export async function PUT(request:NextRequest) {
    try {
        const data=await request.json()


console.log(data)

const {freelancerId,jobId}=data;

if(!freelancerId || !jobId){
throw new Error("Missing fields")
}

if (!mongoose.Types.ObjectId.isValid(freelancerId) || !mongoose.Types.ObjectId.isValid(jobId)) {
  throw new Error("Invalid ObjectId");
}

const rejectFreelancer= await PostJob.findByIdAndUpdate(jobId,
    {
        $pull:{applicants:new mongoose.Types.ObjectId(freelancerId)}
    }
    ,{new:true}
)
const deletingJobIdfromFreelancerAppliedForField = await Freelancer.findByIdAndUpdate(
  freelancerId,
  {
    $pull: { appliedFor: new mongoose.Types.ObjectId(jobId) },
  },
  { new: true } // optional: returns the updated document
);

if(!deletingJobIdfromFreelancerAppliedForField ){
    throw new Error("Error in removing")
}

if(!rejectFreelancer){
    throw new Error("Error in removing")
}


return NextResponse.json({message:"Freelancer removed successfully"},{status:200})


    } catch (error) {
        if(error instanceof Error){
            return NextResponse.json({data:error.message},{status:500})
        }
    }
}