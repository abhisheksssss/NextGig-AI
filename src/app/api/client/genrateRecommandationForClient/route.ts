import { getDataFromToken } from "@/helper/getDataFromToken";
import Client from "@/helper/model/Client.model";
import Freelancer from "@/helper/model/freelancer.model";
import postJob from "@/helper/model/postJob";
// import { getRelatedSkilldForClient } from "@/service/gemini.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request:NextRequest) {
try {
    const userId=getDataFromToken(request)
if(!userId){
    throw new Error("Unotherize user")
}

const clientId= await Client.find({userId}).select("_id")
console.log(clientId)


if(!clientId){
    throw new Error("No client Id founded")
}

const jobsPostedByClient= await postJob.find({clientId}).select("skills -_id")

if(jobsPostedByClient.length>0){
    const firstJob=jobsPostedByClient.slice(0,2)
const lastJob=jobsPostedByClient.slice(-2)
const middleNumber = Math.floor(jobsPostedByClient.length/2)

const middleJob=jobsPostedByClient[middleNumber]
console.log(middleJob)

const job1=  [...new Set(firstJob.flatMap((val)=>(val.skills)))].join(",")
const job2=  [...new Set(lastJob.flatMap((val)=>(val.skills)))].join(",")
const job3= middleJob.skills.slice(0,5).join(",")

const prompt=`give the related skills from this array ${job1},${job2},${job3}`
}




// const aiReesponse=await getRelatedSkilldForClient(prompt)


// if(aiReesponse){
// const findFreelancer=await Freelancer.find({
//     skills:{
//        $elemMatch:{
//         $regex:aiReesponse.relatedSkills.join("|"),
//         $options:"i"
//        }
//     },  Proffession:{
// $elemMatch:{
//         $regex:aiReesponse.relatedSkills.join("|"),
//         $options:"i"
//        }
//        }
// })

// if(!findFreelancer||findFreelancer.length===0){
//      const findFreelancer=await Freelancer.find()
//    return NextResponse.json({data:findFreelancer}, {status:200})
// }

// return NextResponse.json({data:findFreelancer}, {status:200})
// }else{
//    const findFreelancer=await Freelancer.find()
//    return NextResponse.json({data:findFreelancer}, {status:200})
// }
  const findFreelancer=await Freelancer.find()
   return NextResponse.json({data:findFreelancer}, {status:200})

} catch (error) {
   if(error instanceof Error){
 console.log(error)
 return NextResponse.json({data:error.message},{status:500})
   } 
}    
}