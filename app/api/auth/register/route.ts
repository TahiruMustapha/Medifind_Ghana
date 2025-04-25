import { connectToMongoDB } from "@/lib/mongodb";
import { sendSMS, sendVerification } from "@/lib/sms";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToMongoDB();
    const  data = await request.json();
    console.log("Data",data)
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
      emailVerified: false,
      phoneNumber: data.phoneNumber || null,
      verificationCode: verificationCodeHash,
      verificationCodeExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 Hours
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    //IF PHONE NUMBER IS PROVIDED , SEND VERIFICATION CODE THROUGH SMS
    // if (data.phoneNumber) {
    //   try {
    //     await sendSMS(
    //       data.phoneNumber,
    //       `Your MediFind Ghana verification code is: ${verificationCode}. This code will expire in 24 hours.`
    //     );
    //   } catch (error) {
    //     console.error("Error sending verification SMS:", error);
    //   }
    // }
    try {
      await fetch(`http://localhost:3000/api/send-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          phoneNumber: data.phoneNumber,
          verificationCode: verificationCode,
        }),
      });
    } catch (error) {
      console.error("Error triggering verification endpoint:", error);
    }

    // await sendVerification(
    //   {
    //     phoneNumber: data.phoneNumber,
    //     email: data.email
    //   },
    //   verificationCode
    // );

    return NextResponse.json({
      message: "User registered successfully",
      userId: result.insertedId,
      requiresVerification: true,
    });
  } catch (error) {
    console.log("Error registering user!", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
