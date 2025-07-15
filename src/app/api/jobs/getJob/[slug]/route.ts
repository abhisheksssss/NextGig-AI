import postJob from "@/helper/model/postJob";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request:NextRequest,context:{params:{slug:string}}){
try {
    const {slug} = context.params;

    console.log(slug)
if(!slug){
    throw new Error("No slug founded")
}

const res= await postJob.findById(slug).populate({
    path:"clientId",
})


if(!res){
    throw new Error("NO Job founded")
}
return NextResponse.json({data:res},{status:200})


} catch (error) {
    if(error instanceof Error){
        console.log("Error in getting particular Job",error.message)
        return NextResponse.json({data:"Internal Server Error"},{status:500})
    }
}
}