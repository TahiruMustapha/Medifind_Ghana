// app/api/chat-history/route.ts
import { verifyToken } from "@/lib/auth";
import { connectToMongoDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message, response } = await request.json();
    
    // Authenticate the user
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    
    // Log the chat history
    const { db } = await connectToMongoDB();
    await db.collection("chatHistory").insertOne({
      userId: payload.userId,
      message,
      response,
      timestamp: new Date(),
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging chat history:", error);
    return NextResponse.json(
      { error: "Failed to log chat history" },
      { status: 500 }
    );
  }
}
