import postJob, { IPostJob } from "@/helper/model/postJob";
import { NextRequest, NextResponse } from "next/server";


export async  function POST(request:NextRequest) {
    try {
        const body:IPostJob= await request.json()

const {clientId,title,description,skills,budget,status}=body;

if(!clientId || !title|| !description || !skills || !budget || !status){
return NextResponse.json({message:"All fields are required"}, {status:400})
}


const createdJob = await postJob.create({
    clientId,
    title,
    description,
    skills,
    budget,
    status
})

if(createdJob){
    return NextResponse.json({message:"Job posted successfully",job:createdJob}, {status:201})

}

return NextResponse.json({message:"Failed to post job"}, {status:500})
    } catch (error) {
        if(error instanceof Error){
            console.error("Error posting job:", error.message);
        return NextResponse.json({message:"Internal server error"}, {status:500})
    }
}
}




export async function GET() {
    try {
        const jobs = await postJob.find().populate("clientId", "name email profilePicture");
        
        if(jobs.length === 0){
            return NextResponse.json({message:"No jobs found"}, {status:404})
        }

        return NextResponse.json({jobs}, {status:200})
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return NextResponse.json({message:"Internal server error"}, {status:500})
    }
}