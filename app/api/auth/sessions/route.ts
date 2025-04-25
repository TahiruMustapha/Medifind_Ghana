import { validateEnv } from "@/helpers/validateEnv";
import { connectToMongoDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/lib/auth";
validateEnv();
const JWT_SECRET = process.env.JWT_SECRET;

// GET /api/auth/sessions - Get all sessions for the current user
export async function GET(request: NextRequest) {
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
    const userId = new ObjectId(payload.userId)
    // const token = request.cookies.get("auth_token")?.value;
    // const userId = request.headers.get("x-user-id");
    
    const { db } = await connectToMongoDB();

    //GET CURRRENT SESSION TOKEN
    // Get all sessions for the user
    const sessions = await db
      .collection("sessions")
      .find({userId})
      .sort({ lastActive: -1 })
      .toArray();

    //MARK THE CURRENT SESSION
    const sessions_with_current = sessions.map((session) => ({
      ...session,
      current: session.token === token,
    }));
    return NextResponse.json({ sessions: sessions_with_current });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

// DELETE /api/auth/sessions - Terminate all sessions except current
export async function DELETE(request: NextRequest) {
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
    const userId = new ObjectId(payload.userId)
    // const token = request.cookies.get("auth_token")?.value;
    // const userId = request.headers.get("x-user-id");
    const { db } = await connectToMongoDB();

    //GET CURRENT SESSION TOKEN
    // const token = (await cookies()).get("auth_token")?.value;
    // if (!token) {
    //   return NextResponse.json({ error: "No active session" }, { status: 401 });
    // }

    // Delete all sessions except current
    const result = await db.collection("sessions").deleteMany({
      userId: new ObjectId(userId),
      token: { $ne: token },
    });
    return NextResponse.json({
      message: "All other sessions terminated successfully",
      terminatedAccount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error terminating sessions:", error);
    return NextResponse.json(
      { error: "Failed to terminate sessions" },
      { status: 500 }
    );
  }
}
