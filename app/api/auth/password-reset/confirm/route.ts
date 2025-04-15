import { connectToMongoDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToMongoDB();
    const { token, password } = await request.json();

    // Hash the provided token to compare with stored hash
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Find the password reset record
    const resetRecord = await db.collection("passwordResets").findOne({
      resetCode: tokenHash,
      expiresAt: { $gt: new Date() },
    });
    if (!resetRecord) {
      return NextResponse.json(
        { error: "Invalid or expired reset code" },
        { status: 400 }
      );
    }

    //HASH THE NEW PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //UPDATE THE USERS PASSWORD
    await db.collection("users").updateOne(
      { _id: resetRecord.userId },
      {
        $set: {
          passwordHash: hashedPassword,
          updatedAt: new Date(),
        },
      }
    );

    //DELETE THE RESET RECORD
    await db.collection("passwordResets").deleteOne({
      _id: resetRecord._id,
    });
    return NextResponse.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
