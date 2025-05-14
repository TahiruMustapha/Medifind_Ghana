import { validateEnv } from "@/helpers/validateEnv";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToMongoDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/lib/auth";
validateEnv();
const JWT_SECRET = process.env.JWT_SECRET;

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

    //VERIFY TOKEN
    const decoded = jwt.verify(token, JWT_SECRET!) as {
      userId: string;
      email: string;
      role: string;
    };

    //GET USER FROM DATABASE;
    const { db } = await connectToMongoDB();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(decoded.userId) });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
}
