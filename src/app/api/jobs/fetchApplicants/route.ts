import { mongoDBConncection } from "@/app/dbConfig/db";
import { getDataFromToken } from "@/helper/getDataFromToken";
import Client from "@/helper/model/Client.model";
import postJob from "@/helper/model/postJob";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request:NextRequest) {
    try {
        const userID =  getDataFromToken(request);
await mongoDBConncection();
  const clientId=await Client.find({userId:userID}).select("_id")

if(!clientId){
throw new Error("unAuthorize user")
}
const getApplicants= await postJob.find({clientId:clientId[0]._id}).select("-_id applicants title").populate("applicants")


if(getApplicants.length>0){
     return NextResponse.json({data:getApplicants}, { status: 200 });
}else{
    return NextResponse.json({data:"No applicants found"}, { status: 200 });
}


    } catch (error) {
        if(error instanceof Error){
            console.log(error)
            return NextResponse.json({data:error.message}, { status: 401 });
        }
    }
}








