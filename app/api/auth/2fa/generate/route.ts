import { connectToMongoDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sendSMS } from "@/lib/sms";
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToMongoDB();
    const { email } = await request.json();

    //VALIDATE REQUIRED FIELDS;
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    //FIND USER BY EMAIL;
    const user = await db.collection("users").findOne({ email: email });
    if (!user) {
      return NextResponse.json({ error: "User not found!" }, { status: 404 });
    }

    // CHECK IF 2FA IS ENABLED
    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        { error: "Two-factor authentication is not enabled" },
        { status: 400 }
      );
    }
    //CHECK IF USER HAS A PHONE NUMBER
    if (!user.phoneNumber) {
      return NextResponse.json(
        { error: "No phone number associated with this account" },
        { status: 400 }
      );
    }

    //GENERATE A 2FA CODE
    const twoFactorCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const twoFactorCodeHash = crypto
      .createHash("sha256")
      .update(twoFactorCode)
      .digest("hex");

    //STORE TWO FACTOR CODE IN DATABASE
    await db.collection("users").updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          twoFactorCode: twoFactorCodeHash,
          twoFactorCodeExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
          updatedAt: new Date(),
        },
      }
    );

    //SEND 2FA VIA SMS
    await sendSMS(
      user.phoneNumber,
      `Your MediFind Ghana login code is: ${twoFactorCode}. This code will expire in 10 minutes.`
    );

    return NextResponse.json({
      message: "Two-factor authentication code sent",
      email: user.email,
      requiresTwoFactor: true,
    });
  } catch (error) {
    console.error("Error generating 2FA code:", error);
    return NextResponse.json(
      { error: "Failed to generate 2FA code" },
      { status: 500 }
    );
  }
}
