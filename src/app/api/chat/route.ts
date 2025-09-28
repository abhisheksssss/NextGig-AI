import { mongoDBConncection } from "@/app/dbConfig/db";
import { NextRequest, NextResponse } from "next/server";
import Message from "@/helper/model/message.model";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user1 = searchParams.get("user1");
    const user2 = searchParams.get("user2");

    // 1. Correct status code for client error (400)
    if (!user1 || !user2) {
      return NextResponse.json(
        { error: "Both user1 and user2 query parameters are required" },
        { status: 400 } // Use 400 for Bad Request
      );
    }

    await mongoDBConncection();

    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    })
    .sort({ timeStamp: 1 })
    .populate("receiver sender");

    return NextResponse.json({ data: messages }, { status: 200 });

  } catch (error: any) { // 2. Catch any type of error for robustness
    // 3. Log the actual error for debugging
    console.error("Failed to fetch messages:", error);

    // 4. Return a generic server error with the correct status code (500)
    return NextResponse.json(
      { error: "An internal server error occurred." },
      { status: 500 } // Use 500 for Internal Server Error
    );
  }
}
