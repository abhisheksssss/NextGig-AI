import { mongoDBConncection } from "@/app/dbConfig/db";
import Client from "@/helper/model/Client.model";
import Freelancer from "@/helper/model/freelancer.model";
import PostJob from "@/helper/model/postJob";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await mongoDBConncection();

    const { searchParams } = new URL(request.url);

    let queryFromUser = searchParams.get("query");
    let queryType = searchParams.get("queryType");

    if (!queryFromUser || !queryType) {
      return NextResponse.json(
        { error: "query and queryType are required" },
        { status: 400 }
      );
    }

    // Decode and sanitize inputs
    queryFromUser = decodeURIComponent(queryFromUser.trim());
    queryType = decodeURIComponent(queryType.trim());

    // Build partial queries
    const firstWord = queryFromUser.slice(0, 5);
    const secondPart = queryFromUser.slice(5, 10);
    const thirdPart = queryFromUser.slice(10, 15);

    // Function to generate $or search conditions
    const buildSearchConditions = (field: string) => [
      { [field]: { $regex: `^${queryFromUser}$`, $options: "i" } }, // Exact match
      { [field]: { $regex: `^${queryFromUser}`, $options: "i" } },  // Starts with
      { [field]: { $regex: queryFromUser, $options: "i" } },        // Anywhere
      { [field]: { $regex: firstWord, $options: "i" } },
      { [field]: { $regex: secondPart, $options: "i" } },
      { [field]: { $regex: thirdPart, $options: "i" } },
    ];

    let results = [];

    if (queryType === "Client") {
      results = await Client.find({ $or: buildSearchConditions("name") })
        .limit(20)
        .sort({ name: 1 });
    } 
    else if (queryType === "Freelancer") {
      results = await Freelancer.find({ $or: buildSearchConditions("name") })
        .limit(20)
        .sort({ name: 1 });
    } 
    else if (queryType === "Jobs") {
      results = await PostJob.find({ $or: buildSearchConditions("title") })
        .limit(20)
        .sort({ title: 1 });
    } 
    else {
      return NextResponse.json(
        { error: "Invalid queryType" },
        { status: 400 }
      );
    }

    return NextResponse.json({ data: results }, { status: 200 });

  } catch (error) {
    console.error("Error in GET /webSearch:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
