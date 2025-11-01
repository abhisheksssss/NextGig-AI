import mongoose from "mongoose";
import { mongoDBConncection } from "@/app/dbConfig/db";
import { getDataFromToken } from "@/helper/getDataFromToken";
import Client from "@/helper/model/Client.model";
import Freelancer from "@/helper/model/freelancer.model";
import PostJob from "@/helper/model/postJob";
import { NextRequest, NextResponse } from "next/server";
import { PipelineStage } from "mongoose";
import Tracking from "@/helper/model/feedback.model";

const escapeRegex = (s: string) =>
  s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function GET(request: NextRequest) {
  try {
    await mongoDBConncection();

    const { searchParams } = new URL(request.url);
    const userId = getDataFromToken(request);

    let queryFromUser = searchParams.get("query");
    let queryType = searchParams.get("queryType");
    const freelancerId= searchParams.get("freelancerId")

    if (!queryFromUser || !queryType) {
      return NextResponse.json(
        { error: "query and queryType are required" },
        { status: 400 }
      );
    }

if(userId && queryType=="Jobs"){
  const savingQueryInTrackingData=await Tracking.findOneAndUpdate({freelancerId:freelancerId},
    {
      $addToSet:{
          searchHistoryOfFreelancer: queryFromUser
      }
    }
  )

}

    queryFromUser = decodeURIComponent(queryFromUser.trim());
    queryType = decodeURIComponent(queryType.trim());

    const firstWord = queryFromUser.slice(0, 5);
    const secondPart = queryFromUser.slice(5, 10);
    const thirdPart = queryFromUser.slice(10, 15);

    // prepare safe regex patterns
    const exactPattern = `^${escapeRegex(queryFromUser)}$`;
    const startsWithPattern = `^${escapeRegex(queryFromUser)}`;
    const containsPattern = escapeRegex(queryFromUser);
    const parts = [firstWord, secondPart, thirdPart].filter(Boolean).map(escapeRegex);

    // convert userId to ObjectId if necessary (adjust to your schema)
    const userIdFilter = mongoose.isValidObjectId(userId) ? new mongoose.Types.ObjectId(userId) : userId;

    const buildPipeline = (field: string, excludeUser = true): PipelineStage[] => {
      // match stage to reduce scanned docs (use same regexes as before)
      const orMatch = [
        { [field]: { $regex: exactPattern, $options: "i" } },
        { [field]: { $regex: startsWithPattern, $options: "i" } },
        { [field]: { $regex: containsPattern, $options: "i" } },
      ];
      parts.forEach((p) => orMatch.push({ [field]: { $regex: p, $options: "i" } }));

      const matchStage: {
        $or: { [key: string]: { $regex: string; $options: string } }[];
        userId?: { $ne: mongoose.Types.ObjectId | string };
      } = { $or: orMatch };
      if (excludeUser) {
        matchStage.userId = { $ne: userIdFilter };
      }

      // scoring stage: highest points to exact match, then startsWith, then contains, then parts
      const addFieldsScore = {
        $addFields: {
          __score: {
            $add: [
              { $cond: [{ $regexMatch: { input: `$${field}`, regex: exactPattern, options: "i" } }, 100, 0] },
              { $cond: [{ $regexMatch: { input: `$${field}`, regex: startsWithPattern, options: "i" } }, 80, 0] },
              { $cond: [{ $regexMatch: { input: `$${field}`, regex: containsPattern, options: "i" } }, 50, 0] },
              // parts (lower weight)
              ...(parts.map((p) => ({ $cond: [{ $regexMatch: { input: `$${field}`, regex: p, options: "i" } }, 10, 0] })))
            ]
          }
        }
      };

      return [
        { $match: matchStage },
        addFieldsScore,
        { $match: { __score: { $gt: 0 } } },
        { $sort: { __score: -1 } },
        { $limit: 20 }
      ];
    };

    let results = [];

    if (queryType === "Client") {
      results = await Client.aggregate(buildPipeline("name", true));
    } else if (queryType === "Freelancer") {
      results = await Freelancer.aggregate(buildPipeline("name", true));
    } else if (queryType === "Jobs") {
      // for jobs we do the same ranking on "title", without excluding current user
      results = await PostJob.aggregate(buildPipeline("title", false));
    } else {
      return NextResponse.json({ error: "Invalid queryType" }, { status: 400 });
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
