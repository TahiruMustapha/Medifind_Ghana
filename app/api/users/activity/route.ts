import { verifyToken } from "@/lib/auth";
import { connectToMongoDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

// GET /api/users/activity - Get user activity
export async function GET(request: NextRequest) {
  try {
    // Get user ID from middleware
    // const userId = request.headers.get("x-user-id");
    const token = request.cookies.get("auth_token")?.value;
    
        if (!token) {
              return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            const payload = await verifyToken(token);
            if (!payload) {
              return NextResponse.json({ error: "Invalid token" }, { status: 401 });
            }
            const userId = payload.userId;
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToMongoDB();

    // Get user's recent activity (searches, reports, etc.)
    const activities = await db
      .collection("activities")
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching user activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}

// POST /api/users/activity - Log user activity

export async function POST(request: NextRequest) {
  try {
    // Get user ID from middleware

    // const userId = request.headers.get("x-user-id");
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const payload = await verifyToken(token);
        if (!payload) {
          return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }
        const userId = payload.userId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized!" }, { status: 401 });
    }

    const { db } = await connectToMongoDB();
    const { type, description, metadata } = await request.json();

    // Validate required fields
    if (!type || !description) {
      return NextResponse.json(
        { error: "Type and description are required" },
        { status: 400 }
      );
    }

    // Log activity
    await db.collection("userActivity").insertOne({
      userId: new ObjectId(userId),
      type: type,
      description: description,
      metadata: metadata || {},
      createdAt: new Date(),
    });
    return NextResponse.json({ message: "Activity logged successfully" });
  } catch (error) {
    console.error("Error logging activity:", error);
    return NextResponse.json(
      { error: "Failed to log activity" },
      { status: 500 }
    );
  }
}
