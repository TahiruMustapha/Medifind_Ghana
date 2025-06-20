import { connectToMongoDB } from "@/lib/mongodb";
import { paystackService } from "@/lib/paystack";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToMongoDB();

    const { appointmentId, email } = await request.json();
    if (!appointmentId || !email) {
      return NextResponse.json(
        { error: "Appointment ID and email are required" },
        { status: 400 }
      );
    }

    // Find the appointment
    const appointment = await db
      .collection("appointments")
      .findOne({ _id: new ObjectId(appointmentId) });
    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Check if payment is required
    if (!appointment.paymentRequired || appointment.consultationFee <= 0) {
      return NextResponse.json(
        { error: "No payment required for this appointment" },
        { status: 400 }
      );
    }

    // Check if already paid
    if (appointment.paymentStatus === "paid") {
      return NextResponse.json(
        { error: "Appointment already paid for" },
        { status: 400 }
      );
    }

    // Generate payment reference
    const paymentReference = paystackService.generateReference();

    // Initialize Paystack transaction
    const paystackResponse = await paystackService.initializeTransaction({
      email,
      amount: appointment.consultationFee,
      reference: paymentReference,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
      metadata: {
        appointmentId: appointment._id.toString(),
        patientName: appointment.patientName,
        pharmacyName: appointment.pharmacy.name,
        service: appointment.service,
        appointmentDate: appointment.appointmentDate,
        appointmentTime: appointment.appointmentTime,
      },
    });

    if (!paystackResponse.status) {
      return NextResponse.json(
        { error: "Failed to initialize payment" },
        { status: 500 }
      );
    }

    // Update appointment with payment reference
    await db.collection("appointments").updateOne(
      { _id: new ObjectId(appointmentId) },
      {
        $set: {
          paymentReference: paymentReference,
          paystackReference: paystackResponse.data.reference,
        },
      }
    );
    // appointment.paymentReference = paymentReference;
    // appointment.paystackReference = paystackResponse.data.reference;
    // await appointment.save();

    return NextResponse.json({
      success: true,
      data: {
        authorization_url: paystackResponse.data.authorization_url,
        access_code: paystackResponse.data.access_code,
        reference: paymentReference,
        amount: appointment.consultationFee,
      },
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
