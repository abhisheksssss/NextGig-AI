import { mongoDBConncection } from "@/app/dbConfig/db";
import { getDataFromToken } from "@/helper/getDataFromToken";
import User from "@/helper/model/user.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";




export async function PUT(request:NextRequest) {
    try {
        const _id=getDataFromToken(request)


        if(!_id){
    throw new Error('Unauthorized')
}

const body=await request.json()
 

const {data}= body;

         if (!mongoose.Types.ObjectId.isValid(_id) || !mongoose.Types.ObjectId.isValid(data)) {
      throw new Error("Invalid ObjectId(s)");
    }

await mongoDBConncection()

const updateChatWith= await User.findByIdAndUpdate(data,{
    $addToSet:{chatWith:_id}
}       , // Prevents duplicate entries
   {new:true} // returns the updated document
)

if(updateChatWith.lenght===0){
    return new Error("Error in updating fields")
}

  return NextResponse.json({data:"Updated successfully"},{status:200})


    } catch (error) {
        if(error instanceof  Error){
            console.log(error)
            return NextResponse.json({data:error.message},{status:400})
        }
    }
}