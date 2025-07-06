import { mongoDBConncection } from "@/app/dbConfig/db";
import { NextRequest, NextResponse } from "next/server";
import User from "@/helper/model/user.model";


export async function POST(request:NextRequest){

await mongoDBConncection();

try {
const body= await request.json();

const {email,password,username,role}=body;


if(!email || !password || !username ||!role){
    return NextResponse.json({error:"Please provide all the required fields"}, {status:400});
}

const user = await User.create({
    email,
    password,
    name: username,
    role
})

if(user){
    return NextResponse.json({message:"User created successfully"}, {status:201});
}
      
} catch (error) {
    console.log(error);
    return NextResponse.json({error:"Failed to create user"}, {status:500});
}
}

