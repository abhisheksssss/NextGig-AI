import { mongoDBConncection } from "@/app/dbConfig/db";
import { NextRequest, NextResponse } from "next/server";
import Freelancer from "@/helper/model/freelancer.model";
import Client from "@/helper/model/Client.model";


export async function GET(request: NextRequest) {
  try {
   const {searchParams}=new URL(request.url)

   const _id=searchParams.get("userId")
const userRole=searchParams.get("userRole")

await mongoDBConncection();


    if (userRole === "Freelancer") {
      const freelancer = await Freelancer.find({_id}).select("-__v");
      console.log(freelancer)
      if (freelancer) {
        return NextResponse.json({ data: freelancer }, { status: 200 });
      } else {
          return NextResponse.json({ data: "No freelancer Founded" }, { status: 400 });
      }
    }
    if (userRole === "Client") {

      const client = await Client.find({_id}).select("-__v");

      if (client) {
        return NextResponse.json({ data: client }, { status: 200 });
      } else {
         return NextResponse.json({ data: "No Client Founded" }, { status: 400 });
      }
    }
     return NextResponse.json({ data: "something Went wrong" }, { status: 400 });
 
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching user data:", error.message);
      return NextResponse.json({ data: "Internal server Error" }, { status: 400 });
    }
  }
}
