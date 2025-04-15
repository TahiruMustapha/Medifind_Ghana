import { connectToMongoDB } from "@/lib/mongodb";
import { sendSMS } from "@/lib/sms";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToMongoDB();
    const { data } = await request.json();

    //VALIDATE REQUIRED FIELDS;

    if (!data.name || !data.email || !data.password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    //CHECK IF USER ALREADY EXIST;

    const existingUser = await db
      .collection("users")
      .findOne({ email: data.email });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exist!" },
        { status: 409 }
      );
    }

    //HASH PASSWORD
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(data.password, salt);

    //GENERATE VERIFICATION CODE
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const verificationCodeHash = crypto
      .createHash("sha256")
      .update(verificationCode)
      .digest("hex");

    //CREATE USER
    const result = await db.collection("users").insertOne({
      name: data.name,
      email: data.email,
      password: hashPassword,
      role: data.role || "user", // user, pharmacy, admin
      verified: false,
      emailVarified: false,
      phoneNumber: data.phoneNumber || null,
      verificationCode: verificationCodeHash,
      verificationCodeExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 Hours
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // IF PHONE NUMBER IS PROVIDED , SEND VERIFICATION CODE THROUGH SMS
    if (data.phoneNumber) {
      try {
        await sendSMS(
          data.phoneNumber,
          `Your MediFind Ghana verification code is: ${verificationCode}. This code will expire in 24 hours.`
        );
      } catch (error) {
        console.error("Error sending verification SMS:", error);
      }
    }

    return NextResponse.json({
      message: "User registered successfully",
      userId: result.insertedId,
      requiresVarification: true,
    });
  } catch (error) {
    console.log("Error registering user!", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
