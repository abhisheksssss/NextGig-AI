import Contract from "@/helper/model/contract.model";
import { NextRequest, NextResponse } from "next/server";





export async function GET(request:NextRequest) {
try {
        const {searchParams}= new URL(request.url)
    
    const projectId=searchParams.get("projectId")
    
    
    if(!projectId){
        throw new Error("Missing Id")
    }
    
    const findAllTheUserData= await Contract.findById(projectId).populate("clientId freelancerId jobId")
    
    
if(!findAllTheUserData){
      throw new Error("Chats not Founded")
}

   return NextResponse.json({data:findAllTheUserData},{status:200})

} catch (error) {
    if(error instanceof Error){
console.log(error)
    return NextResponse.json({data:error.message},{status:500})
    }
    
}





}