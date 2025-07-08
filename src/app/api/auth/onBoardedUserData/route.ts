import { mongoDBConncection } from "@/app/dbConfig/db";
import User from "@/helper/model/user.model";
import { getDataFromToken } from "@/helper/getDataFromToken";
import { NextRequest, NextResponse } from "next/server";
import Freelancer from "@/helper/model/freelancer.model";
import Client from "@/helper/model/Client.model";

await mongoDBConncection();

export async function GET(request: NextRequest) {
  try {
    const userID = getDataFromToken(request);

    const user = await User.findById(userID).select("-password -__v");
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

console.log(user)

if(user.onBoarding===false){
return NextResponse.json({ error:"User is not onboarded" }, { status: 200 });
}

    if (user.role === "Freelancer") {
      const freelancer = await Freelancer.find({userId:userID}).select("-__v");
      console.log(freelancer)
      if (freelancer) {
        return NextResponse.json({ data: freelancer }, { status: 200 });
      } else {
        return new Response(JSON.stringify({ error: "Freelancer not found" }), {
          status: 404,
        });
      }
    }
    if (user.role === "Client") {

      const client = await Client.find({userId:userID}).select("-__v");
      if (client) {
        return NextResponse.json({ data: client }, { status: 200 });
      } else {
        return new Response(JSON.stringify({ error: "Client not found" }), {
          status: 404,
        });
      }
    }

 return NextResponse.json({ error:"User is not onboarded" }, { status: 200 });

 
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching user data:", error.message);
      return new Response(
        JSON.stringify({ error: "Failed to fetch user data" }),
        { status: 500 }
      );
    }
  }
}
