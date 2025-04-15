import { connectToMongoDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { sendSMS } from "@/lib/sms";
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToMongoDB();
    const { email } = await request.json();

    //FIND USER BY EMAIL
    const user = await db.collection("users").findOne({
      email: email,
    });

    // Don't reveal if user exists or not for security
    if (!user) {
      return NextResponse.json({
        error:
          "If an account with this email exists, a reset code has been sent",
      });
    }

    // Generate a random 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash the code for storage
    const resetCodeHash = crypto
      .createHash("sha256")
      .update(resetCode)
      .digest("hex");

    // Store the reset code and expiration (1 hour from now)
    await db.collection("passwordResets").updateOne(
      {
        userId: user._id,
      },
      {
        $set: {
          resetCode: resetCodeHash,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
          createdAt: new Date(),
        },
      },
      {
        upsert: true,
      }
    );

    //GETB USERS PHONE NUMBER
    let phoneNumber = user.phoneNumber;

    // If user doesn't have a phone number, check if they have a pharmacy
    if (!phoneNumber) {
      const pharmacy = await db
        .collection("pharmacies")
        .findOne({ userId: user._id });
      if (pharmacy && pharmacy.contactNumber) {
        phoneNumber = pharmacy.contactNumber;
      }
    }
    // If we have a phone number, send the reset code
    if (phoneNumber) {
      await sendSMS(
        phoneNumber,
        `Your MediFind Ghana password reset code is: ${resetCode}. This code will expire in 1 hour.`
      );
    } else {
      return NextResponse.json(
        { error: "No phone number found for this account" },
        { status: 400 }
      );
    }
    return NextResponse.json({
      message:
        "If an account with this email exists, a reset code has been sent",
    });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    return NextResponse.json(
      { error: "Failed to request password reset" },
      { status: 500 }
    );
  }
}
