import postJob from "@/helper/model/postJob";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ slug: string }> }
) {
    try {
        // Await the params as they're now a Promise in Next.js 15
        const resolvedParams = await context.params;
        const { slug } = resolvedParams;

        console.log(slug);

        if (!slug) {
            return NextResponse.json(
                { error: "No slug founded" },
                { status: 400 }
            );
        }

        const res = await postJob.findById(slug).populate({
            path: "clientId",
        });

        if (!res) {
            return NextResponse.json(
                { error: "NO Job founded" },
                { status: 404 }
            );
        }

        return NextResponse.json({ data: res }, { status: 200 });

    } catch (error) {
        if (error instanceof Error) {
            console.log("Error in getting particular Job", error.message);
            return NextResponse.json(
                { data: "Internal Server Error" },
                { status: 500 }
            );
        }
    }
}
