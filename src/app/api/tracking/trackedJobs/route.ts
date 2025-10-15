import { mongoDBConncection } from "@/app/dbConfig/db";
import { NextRequest } from "next/server";

export async function GET(request:NextRequest) {
    try {
        await mongoDBConncection();
     



    } catch (error) {
        console.log(error)
    }
}