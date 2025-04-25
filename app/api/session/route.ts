// pages/api/session/update.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { ObjectId } from "mongodb";
import { connectToMongoDB } from "@/lib/mongodb";
import { validateEnv } from "@/helpers/validateEnv";
import { NextResponse } from "next/server";

validateEnv();

export async function POST(req: NextApiRequest) {
  if (req.method !== "POST")
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });

  const { token, userId } = req.body;

  if (!token || !userId) {
    return NextResponse.json(
      { error: "Missing token or userId" },
      { status: 400 }
    );
  }

  try {
    const { db } = await connectToMongoDB();

    await db
      .collection("sessions")
      .updateOne(
        { token, userId: new ObjectId(userId) },
        { $set: { lastActive: new Date() } }
      );

    return NextResponse.json({ message: "Session updated" }, { status: 200 });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
