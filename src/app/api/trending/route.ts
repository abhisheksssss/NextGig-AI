import { mongoDBConncection } from "@/app/dbConfig/db";
import PostJob from "@/helper/model/postJob";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        await mongoDBConncection();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") ?? "1");
        const limit = parseInt(searchParams.get("limit") ?? "10");
        const skip = (page - 1) * limit;

        // Calculate trending score based on multiple factors
        const trendingJobs = await PostJob.aggregate([
            {
                $match: {
                    status: true  // Only active jobs
                }
            },
            {
                $addFields: {
                    applicantCount: { $size: "$applicants" },
                    // Calculate recency score (jobs posted in last 7 days get higher score)
                    daysSincePosted: {
                        $divide: [
                            { $subtract: [new Date(), "$createdAt"] },
                            1000 * 60 * 60 * 24  // Convert to days
                        ]
                    }
                }
            },
            {
                $addFields: {
                    recencyScore: {
                        $cond: {
                            if: { $lte: ["$daysSincePosted", 7] },
                            then: { $subtract: [7, "$daysSincePosted"] },
                            else: 0
                        }
                    },
                    // Trending score formula: (applicants * 10) + (recency * 2)
                    trendingScore: {
                        $add: [
                            { $multiply: ["$applicantCount", 10] },
                            {
                                $multiply: [
                                    {
                                        $cond: {
                                            if: { $lte: ["$daysSincePosted", 7] },
                                            then: { $subtract: [7, "$daysSincePosted"] },
                                            else: 0
                                        }
                                    },
                                    2
                                ]
                            }
                        ]
                    }
                }
            },
            {
                $sort: { 
                    trendingScore: -1,  // Primary: highest trending score
                    applicantCount: -1,  // Secondary: most applicants
                    createdAt: -1  // Tertiary: most recent
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {
                $project: {
                    _id: 1,
                    clientId: 1,
                    title: 1,
                    description: 1,
                    skills: 1,
                    budget: 1,
                    status: 1,
                    applicants: 1,
                    applicantCount: 1,
                    trendingScore: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    __v: 1
                }
            }
        ]);

        const totalActive = await PostJob.countDocuments({ status: true });

        return NextResponse.json({
            data: trendingJobs,
            hasMore: skip + limit < totalActive,
            total: totalActive
        });
        
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { error: "Internal server error" }, 
            { status: 500 }
        );
    }
}
