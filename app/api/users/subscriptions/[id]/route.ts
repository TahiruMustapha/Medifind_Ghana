import { verifyToken } from "@/lib/auth";
import { connectToMongoDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

// PUT /api/users/subscriptions/[id] - Update subscription
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user ID from middleware
    // const userId = request.headers.get("x-user-id");
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

    const { id } = params;
    const { db } = await connectToMongoDB();
    const { enabled } = await request.json();

    // Update subscription
    const result = await db.collection("subscriptions").updateOne(
      {
        _id: new ObjectId(id),
        userId: new ObjectId(userId),
      },
      {
        $set: {
          enabled,
          updatedAt: new Date(),
        },
      }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Subscription updated successfully" });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/subscriptions/[id] - Delete subscription
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { id } = params;
    const { db } = await connectToMongoDB();

    // Delete subscription
    const result = await db.collection("subscriptions").deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Subscription deleted successfully" });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 }
    );
  }
}
