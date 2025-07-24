import { mongoDBConncection } from "@/app/dbConfig/db";
import User from "@/helper/model/user.model";
import { getDataFromToken } from "@/helper/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";




export async function GET(request:NextRequest){
    try {
await mongoDBConncection();

        const userID =  getDataFromToken(request);
        const user= await User.findById(userID).select("-password -__v");
        if(!user){
            return new Response(JSON.stringify({error:"User not found"}), {status:404});
        }
        return NextResponse.json({data:user},{status:200});

    } catch (error) {
    if(error instanceof Error) {
        console.error("Error fetching user data:", error.message);
        return new Response(JSON.stringify({error:"Failed to fetch user data"}), {status:500});
    }
}
}