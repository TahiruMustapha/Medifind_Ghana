import { connectToMongoDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// DELETE /api/auth/sessions/[id] - Terminate a specific session
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user ID from middleware
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = params;
    const { db } = await connectToMongoDB();

    // Get current session token
    const token = (await cookies()).get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "No active session" }, { status: 401 });
    }

    //GET THE SESSION TO BE TERMINATED
    const session = await db.collection("sessions").findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });
    if (!session) {
      return NextResponse.json(
        { error: "Session not found!" },
        { status: 404 }
      );
    }
    // Check if trying to terminate current session

    if (session.token === token) {
      return NextResponse.json(
        { error: "Cannot terminate current session" },
        { status: 400 }
      );
    }

    // Delete the session
    await db.collection("sessions").deleteOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error("Error terminating session:", error);
    return NextResponse.json(
      { error: "Failed to terminate session" },
      { status: 500 }
    );
  }
}
