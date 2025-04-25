import { verifyToken } from "@/lib/auth";
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
    //GET USERID FROM MIDDLEWARE
    const token = (await cookies()).get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const userId = new ObjectId(payload.userId);
    // const token = request.cookies.get("auth_token")?.value;
    // const userId = request.headers.get("x-user-id");

    const { id } = params;
    const { db } = await connectToMongoDB();
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
    return NextResponse.json(
      { message: "Session terminated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error terminating session:", error);
    return NextResponse.json(
      { error: "Failed to terminate session" },
      { status: 500 }
    );
  }
}
