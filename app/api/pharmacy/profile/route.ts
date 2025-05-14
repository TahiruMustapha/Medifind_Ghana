import { verifyToken } from "@/lib/auth";
import { connectToMongoDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get user ID from middleware
    const token = request.cookies.get("auth_token")?.value;
    // const userId = request.headers.get("x-user-id");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const userId = payload.userId;
    
    const { db } = await connectToMongoDB();

    // Find pharmacy associated with user
    // const pharmacy = await db
    //   .collection("pharmacies")
    //   .findOne({ userId: new ObjectId(userId) });
    const pharmacy = await db.collection("pharmacies").findOne({ 
      userId: payload.userId 
    });
    if (!pharmacy) {
      return NextResponse.json(
        { error: "Pharmacy not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ pharmacy });
  } catch (error) {
    console.error("Error fetching pharmacy profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch pharmacy profile" },
      { status: 500 }
    );
  }
}
