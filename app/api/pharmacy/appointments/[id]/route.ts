import { verifyToken } from "@/lib/auth";
import { connectToMongoDB } from "@/lib/mongodb";
import { sendSMS } from "@/lib/sms";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  // { params }: { params: { id: string } }
  context: { params: { id: string } }
) {
  try {
    const { db } = await connectToMongoDB();

    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    const payload = await verifyToken(token);
    const userId = payload?.userId;
    const pharmacy = await db
      .collection("pharmacies")
      .findOne({ userId: userId });

    if (!pharmacy) {
      return NextResponse.json(
        { error: "Pharmacy not found" },
        { status: 404 }
      );
    }
    const { params } = context;
    const appointmentId =  params.id;
    const { status, pharmacistNotes } = await request.json();
    //Find and update appointment
    const appointment = await db
      .collection("appointments")
      .findOne({ _id: new ObjectId(appointmentId), pharmacy: pharmacy._id });

    if (!appointment) {
      return NextResponse.json(
        { error: "Appointment not found" },
        { status: 404 }
      );
    }
    const updateData: any = {};
    if (status) {
      updateData.status = status;
    }
    if (pharmacistNotes) {
      updateData.pharmacistNotes = pharmacistNotes;
    }

    const result = await db
      .collection("appointments")
      .updateOne({ _id: new ObjectId(appointmentId) }, { $set: updateData });

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to update appointment" },
        { status: 500 }
      );
    }

    // appointment.status = status;
    // if (pharmacistNotes) {
    //   appointment.pharmacistNotes = pharmacistNotes;
    // }
    // await appointment.save();

    // Send SMS notification to patient
    try {
      let message = "";
      const appointmentDate = new Date(
        appointment.appointmentDate
      ).toLocaleDateString("en-GB");
      const appointmentTime = appointment.appointmentTime;
      const ref = appointment._id.toString().slice(-6);

      switch (status) {
        case "confirmed":
          message = `MediFind: Your appointment at ${pharmacy.name} on ${appointmentDate} at ${appointmentTime} has been CONFIRMED. Please arrive 10 minutes early. Ref: ${ref}`;
          break;
        case "cancelled":
          message = `MediFind: Your appointment at ${pharmacy.name} on ${appointmentDate} at ${appointmentTime} has been CANCELLED. Please contact the pharmacy for rescheduling. Ref: ${ref}`;
          break;
        case "completed":
          message = `MediFind: Thank you for your visit to ${pharmacy.name}. Your consultation has been completed. Please follow the pharmacist's recommendations. Ref: ${ref}`;
          break;
      }

      if (message) {
        await sendSMS(appointment.patientPhone, message);
      }
    } catch (smsError) {
      console.error("Failed to send SMS:", smsError);
    }

    return NextResponse.json({
      message: "Appointment updated successfully",
      appointment,
    });
  } catch (error) {
    console.error("Update appointment error:", error);
    return NextResponse.json(
      { error: "Failed to update appointment" },
      { status: 500 }
    );
  }
}
