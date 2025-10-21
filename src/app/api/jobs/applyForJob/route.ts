import { mongoDBConncection } from "@/app/dbConfig/db";
import { getDataFromToken } from "@/helper/getDataFromToken";
import Freelancer from "@/helper/model/freelancer.model";
import postJob from "@/helper/model/postJob";

import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const _id = getDataFromToken(request);

    if (!_id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const { data } = body;

    await mongoDBConncection();

    const fetchFreelancerUpdatedId = await Freelancer.findOneAndUpdate(
      { userId: _id },
      {
        $addToSet: { appliedFor: data },
      },
      { new: true }
    ).select("_id");

    if (!fetchFreelancerUpdatedId) {
      return NextResponse.json(
        { error: "Freelancer not found" },
        { status: 404 }
      );
    }

    const updateChatWith = await postJob.findByIdAndUpdate(
      data,
      {
        $addToSet: { applicants: fetchFreelancerUpdatedId._id },
      }, // Prevents duplicate entries
      { new: true } // returns the updated document
    );

    

    if (!updateChatWith) {
      return NextResponse.json(
        { error: "Error in updating fields" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: "Applied successfully" }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error);
      return NextResponse.json({ data: error.message }, { status: 400 });
    }
  }
}
