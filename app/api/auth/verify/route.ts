import { validateEnv } from "@/helpers/validateEnv";
import { connectToMongoDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
validateEnv();
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToMongoDB();
    const { email, code } = await request.json();

    // Validate required fields
    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and verification code are required" },
        { status: 400 }
      );
    }

    //FIND USER BY EMAIL
    const user = await db.collection("users").findOne({ email: email });

    if (!user) {
      return NextResponse.json({ error: "User not found!" }, { status: 404 });
    }

    // Check if user is already verified
    if (user.emailVerified) {
      return NextResponse.json({ message: "Email already varified!" });
    }

    // Check if verification code is valid
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    if (codeHash !== user.verificationCode) {
      return NextResponse.json(
        { error: "Invalid verification code!" },
        { status: 400 }
      );
    }

    // Check if verification code is expired
    if (new Date() > new Date(user.verificationCodeExpires)) {
      return NextResponse.json(
        { error: "Verification has code expired!" },
        { status: 400 }
      );
    }

    //UPDATE USER AS VERIFIED
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          emailVerified: true,
          verified: true,
          updatedAt: new Date(),
        },
        $unset: {
          verificationCode: "",
          verificationCodeExpires: "",
        },
      }
    );

    //CREATE TOKEN
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    //SET COOKIES
    (await cookies()).set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      message: "Email verified successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
