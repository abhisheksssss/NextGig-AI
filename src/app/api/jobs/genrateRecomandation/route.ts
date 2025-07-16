import { getDataFromToken } from "@/helper/getDataFromToken";
import postJob from "@/helper/model/postJob";
import { NextRequest, NextResponse } from "next/server";
import { mongoDBConncection } from "@/app/dbConfig/db";
import "@/helper/model/Client.model";
// import Freelancer from "@/helper/model/freelancer.model";
// import { generateRelatedSkills } from "@/service/gemini.service";


export async function GET(request:NextRequest) {
    try {
await mongoDBConncection()

         const userID =  getDataFromToken(request);


if(!userID){
    throw new Error("user is unotherized")
}

//THis is the recommanddation part
// const freelancerIdDetails= await Freelancer.find({userId:userID}).select("Proffession Skills -_id")




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

 const jobs = await postJob.find().populate({
            path:"clientId"
         });

  if(!jobs){
throw new  Error("No jobs founded")
}

return NextResponse.json({data:jobs},{status:200})


    } catch (error) {
        if(error instanceof Error){
console.log("Error in GetJob",error)
        return NextResponse.json({data:error.message},{status:500})
        }
        
    }
}