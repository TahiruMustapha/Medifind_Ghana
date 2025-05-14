import { connectToMongoDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import crypo from "crypto";
import { sendSMS } from "@/lib/sms";
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToMongoDB();
    const { email } = await request.json();

    // Validate required fields
    if (!email) {
      return NextResponse.json({ message: "Email.required!" }, { status: 400 });
    }

    //FIND USER BY EMAIL
    const user = await db.collection("users").findOne({ email: email });
    if (!user) {
      return NextResponse.json({ error: "User not found!" }, { status: 404 });
    }

    // CHECK IF USER IS ALREADY VERIFIED
    if (user.emailVerified) {
      return NextResponse.json({ message: "Email already verified" });
    }

    // Check if user has a phone number
    if (!user.phoneNumber) {
      return NextResponse.json(
        { error: "No phone number associated with this account" },
        { status: 400 }
      );
    }

    // Generate new verification code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const verificationCodeHash = crypo
      .createHash("sha256")
      .update(verificationCode)
      .digest("hex");

    // Update user with new verification code
    await db.collection("users").updateOne(
      { _id: user._id },
      {
        $set: {
          verificationCode: verificationCodeHash,
          verificationCodeExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          updatedAt: new Date(),
        },
      }
    );

    // Send verification code via SMS
    await sendSMS(
      user.phoneNumber,
      `Your MediFind Ghana verification code is: ${verificationCode}. This code will expire in 24 hours.`
    );
    return NextResponse.json({
      message: "Verification code sent successfully",
      code: verificationCode,
    });
  } catch (error) {
    console.error("Error resending verification code:", error);
    return NextResponse.json(
      { error: "Failed to resend verification code" },
      { status: 500 }
    );
  }
}
