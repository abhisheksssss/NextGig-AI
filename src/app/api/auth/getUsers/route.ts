import { getDataFromToken } from "@/helper/getDataFromToken";
import User from "@/helper/model/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request:NextRequest){
try {
    const userId=getDataFromToken(request)

    if(!userId){
 throw new Error("Unotherize user")
    }

const users=await User.find({_id:{$ne:userId}}).select("-password");


if(!users){
    throw new Error("No users founded user")
}


return NextResponse.json({data:users},{status:200})

} catch (error) {
    if(error instanceof Error){
        console.log(error)
        return NextResponse.json({data:error.message},{status:500})
    }
}
}