import { connectToMongoDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

// GET /api/users/2fa - Get 2FA status
export async function GET(request: NextRequest) {
  try {
    // Get user ID from middleware
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { db } = await connectToMongoDB();

    //GET USER FROM DATABASE
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return NextResponse.json({ error: "User not found!" }, { status: 404 });
    }

    return NextResponse.json({
      enabled: user.twoFactorEnabled || false,
      phoneNumber: user.phoneNumber || null,
    });
  } catch (error) {
    console.error("Error fetching 2FA status:", error);
    return NextResponse.json(
      { error: "Failed to fetch 2FA status" },
      { status: 500 }
    );
  }
}

// POST /api/users/2fa - Enable 2FA
export async function POST(request: NextRequest) {
  try {
    // Get user ID from middleware
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToMongoDB();
    const { enable } = await request.json();

    //GET USER FROM DATABASE
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has a phone number
    if (enable && !user.phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required for 2FA" },
        { status: 400 }
      );
    }

    // Update user's 2FA settings
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          twoFactorEnabled: enable,
          updatedAt: new Date(),
        },
      }
    );
    return NextResponse.json({
      message: enable
        ? "Two-factor authentication enabled"
        : "Two-factor authentication disabled",
      enabled: enable,
    });
  } catch (error) {
    console.error("Error updating 2FA settings:", error);
    return NextResponse.json(
      { error: "Failed to update 2FA settings" },
      { status: 500 }
    );
  }
}
