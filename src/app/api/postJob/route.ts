import { getDataFromToken } from "@/helper/getDataFromToken";
import Client from "@/helper/model/Client.model";
import postJob, { IPostJob } from "@/helper/model/postJob";
import { NextRequest, NextResponse } from "next/server";
import "@/helper/model/user.model"
import { queryEmbedding} from "@/helper/textembedding";
import { pinecone } from "@/service/pinecone.service";
export async  function POST(request:NextRequest) {
    try {
        const body:IPostJob= await request.json()


  const userID =  getDataFromToken(request);

  const clientId=await Client.find({userId:userID}).select("_id")


const {title,description,skills,budget}=body;
if(!clientId || !title|| !description || !skills || !budget){
return NextResponse.json({message:"All fields are required"}, {status:400})
}


const createdJob = await postJob.create({
    clientId:clientId[0]._id,
    title,
    description,
    skills,
    budget
})


    try {
  // Generate embedding for job description
  const embedding = await queryEmbedding(JSON.stringify(createdJob));


// console.log("This is embedding",embedding)

  // Ensure embedding is a number[]
  const values = Array.isArray(embedding) && embedding ;

  if(!values){
    throw new Error("No embedding gnerated")
  }

// console.log("These are the value",values)

  // Use a fixed index name (created beforehand in Pinecone)
  const index = pinecone.index("jobs");

  // console.log('This is the index',index);



  // Build vector
  const vector = [
    {
      id: `job-${createdJob._id}`,
      values: values,
      metadata: {
        description: createdJob.description, // or whole job text
        jobId: createdJob._id.toString(),
        skills:createdJob.skills,
        budget:`$ ${createdJob.budget}`
      },
    },
  ];

  // Upsert vector into Pinecone
  await index.upsert(vector);

  console.log("✅ Job embedding stored in Pinecone!");
} catch (error) {
  console.log("❌ Error in vector embedding in posting jobs", error);
}

    


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