import { mongoDBConncection } from "@/app/dbConfig/db";
import { NextRequest, NextResponse } from "next/server";
import Message from "@/helper/model/message.model"


export async function GET(request:NextRequest) {
    try {
      const {searchParams}=new URL(request.url)
    const user1= searchParams.get("user1")
    const user2= searchParams.get("user2")


    if(!user1|| !user2){
        return NextResponse.json({error:"Please provide both user1 and user2"}, {status:200})
    }
await mongoDBConncection();

const message = await Message.find({
    $or: [
        {sender:user1 ,receiver:user2},
        {sender:user2 ,receiver:user1}
    ]
}).sort({timeStamp:1}).populate("receiver sender")

return NextResponse.json({data:message},{status:200})

    } catch (error) {
        if(error instanceof Error){
            console.log(error)
            return NextResponse.json({data:error.message},{status:200})
        }
    }
}