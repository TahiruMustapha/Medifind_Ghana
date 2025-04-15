import { connectToMongoDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get user ID from middleware
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized!" }, { status: 401 });
    }
    const { db } = await connectToMongoDB();
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    //UPDATE USERS PHONE
    await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(userId) },
        { $set: { phoneNumber, updatedAt: new Date() } }
      );
    return NextResponse.json({ message: "Phone number updated successfully" });
  } catch (error) {
    console.log("Error updating phone number: ", error);
    return NextResponse.json(
      { error: "Failed to update phone number" },
      { status: 500 }
    );
  }
}
