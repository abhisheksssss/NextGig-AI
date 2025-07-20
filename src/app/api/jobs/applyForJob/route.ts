import { mongoDBConncection } from "@/app/dbConfig/db";
import { getDataFromToken } from "@/helper/getDataFromToken";
import postJob from "@/helper/model/postJob";

import { NextRequest, NextResponse } from "next/server";




export async function PUT(request:NextRequest) {
    try {
        const _id=getDataFromToken(request)

        if(!_id){
    throw new Error('Unauthorized')
}

const body=await request.json()
 


const {data}= body;

console.log("This is the body",data)

await mongoDBConncection();


const updateChatWith= await postJob.findByIdAndUpdate(data,{
    $addToSet:{applicants:_id}
}       , // Prevents duplicate entries
   {new:true} // returns the updated document
)
console.log("THis is the updated chat user",updateChatWith)

if(updateChatWith.lenght===0){
    return new Error("Error in updating fields")
}

  return NextResponse.json({data:"Applied successfully"},{status:200})


    } catch (error) {
        if(error instanceof  Error){
            console.log(error)
            return NextResponse.json({data:error.message},{status:400})
        }
    }
}