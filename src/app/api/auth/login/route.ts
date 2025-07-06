
import { mongoDBConncection } from "@/app/dbConfig/db";
import { NextRequest, NextResponse } from "next/server";
import User from "@/helper/model/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";




export async function POST(request:NextRequest){

await mongoDBConncection();

try {
const body= await request.json();

const {email,password}=body;


if(!email || !password){
    return NextResponse.json({error:"Please provide all the required fields"}, {status:400});
}

if(password.length <6){
    return NextResponse.json({error:"Password must be at least 6 characters long"}, {status:400});
}

const user = await User.findOne({ email });

if (!user) {
    return NextResponse.json({ message: "No user found" }, { status: 400 });
}

// Assuming comparePassword is defined on your user model and compares the provided password with the stored hash
const isPasswordValid = await bcrypt.compare(password, user.password);

if (!isPasswordValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}

const tokenData={
    id:user._id,
    email:user.email,
    role:user.role,
}

const token= await jwt.sign(tokenData,process.env.JWT_SECRET as string, {
    expiresIn: "1d"})

    const response = NextResponse.json({ message: "Login successful" }, { status: 200 });

   response.cookies.set("token",token,{
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    sameSite: "strict", // Helps prevent CSRF attacks
    maxAge: 24 * 60 * 60, // 1 day in seconds
   }) 

return response;
} catch (error) {
    console.log(error);
    return NextResponse.json({error:"Failed to create user"}, {status:500});
}
}

