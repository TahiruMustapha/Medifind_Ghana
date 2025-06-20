import { validateEnv } from "@/helpers/validateEnv";
import { connectToMongoDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { SignJWT } from "jose";


validateEnv();
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: NextRequest) {
  try {
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const { db } = await connectToMongoDB();
    const { email, code } = await request.json();

    // Validate required fields
    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and verification code are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db.collection("users").findOne({ 
      email: email.toLowerCase().trim() 
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is already verified
    if (user.emailVerified) {
      return NextResponse.json({ 
        message: "Email already verified",
        verified: true 
      });
    }

    // Validate verification code
    const codeHash = crypto
      .createHash("sha256")
      .update(code.toString())
      .digest("hex");

    if (codeHash !== user.verificationCode) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Check if verification code is expired
    if (new Date() > new Date(user.verificationCodeExpires)) {
      return NextResponse.json(
        { error: "Verification code has expired" },
        { status: 400 }
      );
    }

    // Update user verification status
    const updateResult = await db.collection("users").updateOne(
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

    if (updateResult.modifiedCount === 0) {
      throw new Error("Failed to update user verification status");
    }

    // Create JWT token
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Email verified successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error) {
    console.error("Error in verification:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Verification failed" 
      },
      { status: 500 }
    );
  }
}