// app/api/send-verification/route.ts
export const runtime = "nodejs"; // Force Node.js runtime

import { validateEnv } from "@/helpers/validateEnv";
import { sendSMS } from "@/lib/sms";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

validateEnv();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, phoneNumber, verificationCode } = await req.json();

    if (!verificationCode || (!email && !phoneNumber)) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Send Email
    if (email) {
      await resend.emails.send({
        from: "onboarding@resend.dev", // or your verified domain email
        to: email,
        subject: "Verify your MediFind Account",
        html: `<p>Your MediFind Ghana verification code is: <strong>${verificationCode}</strong>.</p><p>This code will expire in 24 hours.</p>`,
      });
    }

    // Send SMS
    if (phoneNumber) {
      await sendSMS(
        phoneNumber,
        `Your MediFind Ghana verification code is: ${verificationCode}. This code will expire in 24 hours.`
      );
    }

    return NextResponse.json({ message: "Verification sent successfully" });
  } catch (error) {
    console.error("Error sending verification:", error);
    return NextResponse.json({ error: "Failed to send verification" }, { status: 500 });
  }
}
