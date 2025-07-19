import { getDataFromToken } from "@/helper/getDataFromToken";
import messageModel from "@/helper/model/message.model";
import { NextRequest, NextResponse } from "next/server";




export async function DELETE(request:NextRequest) {
    try {
         const {searchParams}=new URL(request.url)
         const userId= getDataFromToken(request)

const deletingMessageId=searchParams.get("deleteMessage")
if(!deletingMessageId || !userId){
throw new Error("NO user founded")
}

const deleteMessage=await messageModel.findByIdAndDelete(deletingMessageId)

if(!deleteMessage){
return NextResponse.json("Failed to delete chat")
}


  return NextResponse.json({data:"Message Deleted"}, {status: 400})

    } catch (error) {
       if(error instanceof Error){
        console.log(error)
        return NextResponse.json(error.message, {status: 400})
       } 
    }
}