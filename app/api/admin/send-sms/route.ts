import { sendSMS } from "@/lib/sms";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin (this should be handled by middleware)
    const userRole = request.headers.get("x-user-role");
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const data = await request.json();

    // Validate required fields
    if (!data.to || !data.message) {
      return NextResponse.json(
        { error: "Phone number and message are required" },
        { status: 400 }
      );
    }

    // Send SMS
    const response = await sendSMS(data.to, data.message);

    return NextResponse.json({
      message: "SMS sent successfully!",
      messageId: response.sid,
    });
  } catch (error) {
    console.error("Error sending SMS:", error);
    return NextResponse.json(
      {
        error: "Failed to send SMS",
      },
      { status: 500 }
    );
  }
}
