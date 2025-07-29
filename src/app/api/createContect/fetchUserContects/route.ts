import Contract from "@/helper/model/contract.model";
import { NextRequest, NextResponse } from "next/server";





export async function GET(request:NextRequest) {
try {



const {searchParams}= new URL(request.url)
    
    const userId=searchParams.get("_Id")
    const role=searchParams.get("role")
    
    
    if(!userId){
        throw new Error("Missing Id")
    }
    
    if(role==="Freelancer"){
                const findAllTheUserData= await Contract.find({freelancerId:userId}).populate("clientId freelancerId jobId")
        if(!findAllTheUserData){
            throw new Error("Chats not Founded")
        }
        return NextResponse.json({data:findAllTheUserData},{status:200}) 
    }else{
            const findAllTheUserData= await Contract.find({clientId:userId}).populate("clientId freelancerId jobId")
        if(!findAllTheUserData){
            throw new Error("Chats not Founded")
        }
        return NextResponse.json({data:findAllTheUserData},{status:200}) 
    }


} catch (error) {
    if(error instanceof Error){
console.log(error)
    return NextResponse.json({data:error.message},{status:500})
    }
    
}





}