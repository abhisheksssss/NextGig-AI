import { NextRequest, NextResponse } from "next/server";
import postJob from "@/helper/model/postJob";

export async function GET(request:NextRequest,{params}:{params:{slug:string}}){
try {
const slug=params.slug;
if(!slug){
    throw new Error("No id founded")
}
const res=await postJob.findById(slug)

if(!res){
    throw new Error("No response")
}
return NextResponse.json({data:res},{status:200})
} catch (error) {
    if(error instanceof Error ){
        console.log(error.message);
        return NextResponse.json({message:"error im finding data"},{status:500})
    }
}

}