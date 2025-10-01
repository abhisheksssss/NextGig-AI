import { getDataFromToken } from "@/helper/getDataFromToken";
import postJob from "@/helper/model/postJob";
import { NextRequest, NextResponse } from "next/server";
import { mongoDBConncection } from "@/app/dbConfig/db";
import "@/helper/model/Client.model";
import Freelancer from "@/helper/model/freelancer.model";
import { JobRecomandation } from "@/service/JobRecomandationSystem";
import Redis from "ioredis"

// import { queryEmbedding } from "@/helper/textembedding";
// import { pinecone } from "@/service/pinecone.service";
// import Freelancer from "@/helper/model/freelancer.model";
// import { generateRelatedSkills } from "@/service/gemini.service";

export async function GET(request: NextRequest) {
  try {
    await mongoDBConncection();

    const userID = getDataFromToken(request);

    if (!userID) {
      throw new Error("user is unotherized");
    }

    //THis is the recommanddation part
    const freelancerIdDetails = await Freelancer.find({
      userId: userID,
    }).select("Proffession Skills");


const redis = new Redis({
    host: `${process.env.REDIS_C}`,
    port: 19824,
    username: "default", 
    password: "3iV7W8pB49zwzIhebJA7eA7Uc8n4fbav"
    // Remove TLS configuration entirely
  });
  
   redis.on("connect", () => {
    console.log("✅ Redis connected");
  });
  
  redis.on("error", (err) => {
    console.error("❌ Redis Error:", err);
  });

const retrievedIds= await redis.smembers(`user:${userID}:ids`);
console.log("THese are the ids",retrievedIds);

const jobOp = [];
let jobIds;


if(Array.isArray(retrievedIds)&&retrievedIds.length> 0){

   try {
    jobIds = typeof retrievedIds === 'string' ? JSON.parse(retrievedIds) : retrievedIds;
  } catch (parseError) {
    console.log("Failed to parse recommended jobs:", parseError);
    jobIds = [];
  }
   
  // Ensure jobIds is an array
  if (!Array.isArray(jobIds)) {
    console.log("Recommended jobs is not an array:", jobIds);
    jobIds = [];
  }

  console.log("Processing job IDs:", jobIds);

   for (const jobId of jobIds) {
    console.log("Processing job:", jobId);

    try {
      // Validate the job ID format (MongoDB ObjectId should be 24 characters)
      if (!jobId || typeof jobId !== 'string' || jobId.length !== 24) {
        console.log("Invalid job ID format:", jobId);
        continue;
      }

      const jobData = await postJob.findById(jobId).populate({
        path: "clientId",
      });

      if (jobData) {
        jobOp.push(jobData);
        console.log("Successfully fetched job:", jobId);
      } else {
        console.log("Job not found:", jobId);
      }
    } catch (error) {
      console.log("Failed to fetch job:", jobId, "Error:", error);
      // Continue processing other jobs even if one fails
    }
  }

 return NextResponse.json({ 
    data: jobOp, 
    message: `Found ${jobOp.length} recommended jobs out of ${jobIds.length} requested`,
    recommendedCount: jobOp.length,
    requestedCount: jobIds.length
  }, { status: 200 });
}

    let recomandedJobs;

    if(freelancerIdDetails){
      recomandedJobs=await JobRecomandation(JSON.stringify(freelancerIdDetails))
    }

    console.log("These are the recomanded jobs",recomandedJobs)

// Initialize jobOp array at the beginning



 




if (recomandedJobs) {
  // Parse the JSON string if it's a string, otherwise use as is
  try {
    jobIds = typeof recomandedJobs === 'string' ? JSON.parse(recomandedJobs) : recomandedJobs;
  } catch (parseError) {
    console.log("Failed to parse recommended jobs:", parseError);
    jobIds = [];
  }

  // Ensure jobIds is an array
  if (!Array.isArray(jobIds)) {
    console.log("Recommended jobs is not an array:", jobIds);
    jobIds = [];
  }

  console.log("Processing job IDs:", jobIds);

  for (const jobId of jobIds) {
    console.log("Processing job:", jobId);

    try {
      // Validate the job ID format (MongoDB ObjectId should be 24 characters)
      if (!jobId || typeof jobId !== 'string' || jobId.length !== 24) {
        console.log("Invalid job ID format:", jobId);
        continue;
      }

      const jobData = await postJob.findById(jobId).populate({
        path: "clientId",
      });

      if (jobData) {
        jobOp.push(jobData);
        console.log("Successfully fetched job:", jobId);
      } else {
        console.log("Job not found:", jobId);
      }
    } catch (error) {
      console.log("Failed to fetch job:", jobId, "Error:", error);
      // Continue processing other jobs even if one fails
    }
  }

  // Return the recommended jobs (even if empty)

try {
  
  redis.on("connect", () => {
    console.log("✅ Redis connected");
  });
  
  redis.on("error", (err) => {
    console.error("❌ Redis Error:", err);
  });
await redis.del(`user:${userID}:ids`);

const savedRedish=await redis.sadd(`user:${userID}:ids`,jobIds)
console.log(savedRedish)
await redis.expire(`user:${userID}:ids`, 1600);


} catch (error) {
  console.log("Error on connecting in redish:--->",error)
}


  return NextResponse.json({ 
    data: jobOp, 
    message: `Found ${jobOp.length} recommended jobs out of ${jobIds.length} requested`,
    recommendedCount: jobOp.length,
    requestedCount: jobIds.length
  }, { status: 200 });

} else {
  // Fallback: return all jobs if no recommendations
  console.log("No recommended jobs, fetching all jobs");
  
  try {
    const jobs = await postJob.find().populate({
      path: "clientId",
    });

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ 
        data: [], 
        message: "No jobs found in database" 
      }, { status: 200 });
    }

    return NextResponse.json({ 
      data: jobs,
      message: `Returning ${jobs.length} total jobs`,
      totalCount: jobs.length
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching all jobs:", error);
    return NextResponse.json({ 
      error: "Failed to fetch jobs",
      message: error
    }, { status: 500 });
  }
}



    //  const res=await generateRelatedSkills(freelancerIdDetails[0].Proffession,freelancerIdDetails[0].Skills)

    //  if(res){
    //    const jobs = await postJob.find({
    //             skills:{
    //                 $elemMatch:{
    //                     $regex:res.relatedSkills.join("|"),
    //                     $options:"i"
    //                 }
    //             }
    //          }).populate({
    //             path:"clientId"
    //          })

    //          if(!jobs){
    // throw new  Error("No jobs founded")
    // }

    // return NextResponse.json({data:jobs},{status:200})

    //  }else{
    // const jobs = await postJob.find().populate({
    //             path:"clientId"
    //          });

    //   if(!jobs){
    // throw new  Error("No jobs founded")
    // }

    // return NextResponse.json({data:jobs},{status:200})

    //  }

    // const jobs = await postJob.find().populate({
    //   path: "clientId",
    // });



    // if (!jobs) {
    //   throw new Error("No jobs founded");
    // }

//  for(let i=4;i<11;i++){

//    try {
//     // Generate embedding for job description
//     const embedding = await queryEmbedding(JSON.stringify(jobs[i]));
  
  
//   // console.log("This is embedding",embedding)
  
//     // Ensure embedding is a number[]
//     const values = Array.isArray(embedding) && embedding ;
  
//     if(!values){
//       throw new Error("No embedding gnerated")
//     }
  
//   // console.log("These are the value",values)
  
//     // Use a fixed index name (created beforehand in Pinecone)
//     const index = pinecone.index("jobs");
  
//     // console.log('This is the index',index);
  
  
  
//     // Build vector
//     const vector = [
//       {
//         id: `job-${jobs[i]._id}`,
//         values: values,
//         metadata: {
//           description: jobs[i].description, // or whole job text
//           jobId: jobs[i]._id.toString(),
//           skills:jobs[i].skills,
//           budget:`$ ${jobs[i].budget}`
//         },
//       },
//     ];
  
//     // Upsert vector into Pinecone
//     await index.upsert(vector);
  
//     console.log("✅ Job embedding stored in Pinecone!");
//   } catch (error) {
//     console.log("❌ Error in vector embedding in posting jobs", error);
//   }
//  }   



    // return NextResponse.json({ data: jobs }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error in GetJob", error);
      return NextResponse.json({ data: error.message }, { status: 500 });
    }
  }
}
