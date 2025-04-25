// GET /api/users/subscriptions - Get user subscriptions

import { verifyToken } from "@/lib/auth";
import { connectToMongoDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
     // Get user ID from middleware
        const token = request.cookies.get("auth_token")?.value;
        if (!token) {
          return NextResponse.json({ error: "Unauthorized!" }, { status: 401 });
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

    // Get user's subscriptions with medicine details
    const subscriptions = await db
      .collection("subscriptions")
      .aggregate([
        { $match: { userId: new ObjectId(userId) } },
        {
          $lookup: {
            from: "medicines",
            localField: "medicineId",
            foreignField: "_id",
            as: "medicineDetails",
          },
        },
        {
          $project: {
            _id: 1,
            medicineId: 1,
            medicineName: { $arrayElemAt: ["$medicineDetails.name", 0] },
            enabled: { $ifNull: ["$enabled", true] },
            createdAt: 1,
          },
        },
      ])
      .toArray();

    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error("Error fetching user subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}

// POST /api/users/subscriptions - Create subscription

export async function POST(request: NextRequest) {
  try {
    // Get user ID from middleware
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToMongoDB();
    const { medicineId, medicineName } = await request.json();

    // Validate required fields
    if (!medicineId) {
      return NextResponse.json(
        { error: "Medicine ID is required" },
        { status: 400 }
      );
    }

    // Check if subscription already exists
    const existingSubscription = await db.collection("subscriptions").findOne({
      userId: new ObjectId(userId),
      medicineId: new ObjectId(medicineId),
    });

    if (existingSubscription) {
      return NextResponse.json({
        message: "Already subscribed to this medicine",
      });
    }

    // Create subscription
    await db.collection("subscriptions").insertOne({
      userId: new ObjectId(userId),
      medicineId: new ObjectId(medicineId),
      enabled: true,
      createdAt: new Date(),
    });

    // Log activity
    await db.collection("userActivity").insertOne({
      userId: new ObjectId(userId),
      type: "subscription",
      description: `Subscribed to notifications for ${medicineName}`,
      metadata: {
        medicineId,
        medicineName,
      },
      createdAt: new Date(),
    });

    return NextResponse.json({ message: "Subscription created successfully" });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
