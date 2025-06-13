import { connectToMongoDB } from "@/lib/mongodb";
import { paystackService } from "@/lib/paystack";
import { sendSMS } from "@/lib/sms";
import { NetworkIcon } from "lucide-react";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToMongoDB();
    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 }
      );
    }

    // Find appointment by payment reference
    const appointment = await db
      .collection("appointment")
      .findOne({ paymentReference: reference });
    //   .populate("pharmacy");

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }

    // Verify payment with Paystack
    const verificationResponse =
      await paystackService.verifyTransaction(reference);

    if (!verificationResponse.status) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    const paymentData = verificationResponse.data;

    // Check if payment was successful
    if (paymentData.status === "success") {
      // Update appointment payment status
      appointment.paymentStatus = "paid";
      appointment.paidAt = new Date(paymentData.paid_at);
      appointment.paymentMethod = paymentData.channel;
      await appointment.save();

      // Send SMS confirmation to patient
      try {
        const appointmentDate = new Date(
          appointment.appointmentDate
        ).toLocaleDateString("en-GB");
        const appointmentTime = appointment.appointmentTime;
        const amount = (paymentData.amount / 100).toFixed(2); // Convert from kobo to cedis

        await sendSMS(
          appointment.patientPhone,
          `MediFind: Payment of GHS ${amount} confirmed for your appointment at ${appointment.pharmacy.name} on ${appointmentDate} at ${appointmentTime}. Ref: ${appointment._id.toString().slice(-6)}`
        );
      } catch (smsError) {
        console.error("Failed to send payment confirmation SMS:", smsError);
      }

      // Send SMS notification to pharmacy
      try {
        const appointmentDate = new Date(
          appointment.appointmentDate
        ).toLocaleDateString("en-GB");
        const appointmentTime = appointment.appointmentTime;

        await sendSMS(
          appointment.pharmacy.phone,
          `MediFind: Payment received for appointment with ${appointment.patientName} on ${appointmentDate} at ${appointmentTime}. Amount: GHS ${(paymentData.amount / 100).toFixed(2)}. Ref: ${appointment._id.toString().slice(-6)}`
        );
      } catch (smsError) {
        console.error("Failed to send pharmacy payment SMS:", smsError);
      }

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
        data: {
          appointmentId: appointment._id,
          amount: paymentData.amount / 100,
          paidAt: paymentData.paid_at,
          reference: reference,
        },
      });
    } else {
      // Payment failed
      appointment.paymentStatus = "failed";
      await appointment.save();

      return NextResponse.json(
        { error: "Payment was not successful" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
