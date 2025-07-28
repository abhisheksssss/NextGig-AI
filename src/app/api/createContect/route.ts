import Contract from "@/helper/model/contract.model";
import { NextRequest, NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";
import Freelancer from "@/helper/model/freelancer.model";
import PostJob from "@/helper/model/postJob";


export async function POST(request:NextRequest) {
    try {
   const data= await request.json()

   const{freelancerId,clientId,projectId,budget}=data


   console.log(data)

if(!freelancerId || !clientId || !projectId||!budget){
    throw new Error("Missing Fields")
}


const createContract = await Contract.create({
  jobId: new Types.ObjectId(projectId),
  clientId: new Types.ObjectId(clientId),
  freelancerId: new Types.ObjectId(freelancerId),
  amount: budget, // Amount in smallest currency unit if using Razorpay/Stripe
  paymentIntentId: "pi_test_1234567890",
  status: "pending", 
  isReleased: false,
});


const deletingJobIdfromFreelancerAppliedForField = await Freelancer.findByIdAndUpdate(
  freelancerId,
  {
    $pull: { appliedFor: new mongoose.Types.ObjectId(projectId) },
  },
  { new: true } // optional: returns the updated document
);

if(!deletingJobIdfromFreelancerAppliedForField){
    throw new Error("Failed to delete job id from freelancer applied for field")
}

const deltingDataFromPostJobField = await PostJob.findByIdAndUpdate(
    projectId,
    {
        $pull: { applicants: new mongoose.Types.ObjectId(freelancerId)}
    },
     { new:true }
)

if(!deltingDataFromPostJobField){
    throw new Error("Failed to delete job id from freelancer applied for field")
}

if(!createContract){
throw new Error("Failed to create contract")
}


return NextResponse.json({data:createContract},{status:200})


    } catch (error) {
        if(error instanceof Error){
        console.log(error)
        return NextResponse.json({data:error.message},{status:500})
        }
    }
}