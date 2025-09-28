import { mongoDBConncection } from "@/app/dbConfig/db";
import { getDataFromToken } from "@/helper/getDataFromToken";
import User from "@/helper/model/user.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const _id = getDataFromToken(request);

    if (!_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { data } = body;

    if (
      !mongoose.Types.ObjectId.isValid(_id) ||
      !mongoose.Types.ObjectId.isValid(data)
    ) {
      return NextResponse.json({ error: "Invalid ObjectId(s)" }, { status: 400 });
    }

    await mongoDBConncection();

    const updateChatWith = await User.findByIdAndUpdate(
      _id,
      { $addToSet: { chatWith: data } }, // Prevents duplicate entries
      { new: true } // Returns updated document
    );

    if (!updateChatWith) {
      return NextResponse.json(
        { error: "Error in updating fields" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: "Updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/chat/updatingChatWith error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}