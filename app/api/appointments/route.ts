import { verifyToken } from "@/lib/auth";
import { connectToMongoDB } from "@/lib/mongodb";
import { sendSMS } from "@/lib/sms";
import { Phone } from "lucide-react";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      pharmacy: pharmacyId, // Renamed for clarity
      appointmentDate,
      appointmentTime,
      service,
      description,
      patientName,
      patientPhone,
      patientAge,
      urgency = "normal", // Default value
      notes = "", // Default value
      email,
      consultationFee = 0, // Default value
      paymentRequired = false, // Default value
    } = body;

    // Validate required fields
    const requiredFields = {
      pharmacy: pharmacyId,
      appointmentDate,
      appointmentTime,
      service,
      description,
      patientName,
      patientPhone,
      patientAge,
      email,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          missingFields,
        },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!/^\+?[\d\s-]{10,}$/.test(patientPhone)) {
      return NextResponse.json(
        { error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    const { db } = await connectToMongoDB();

    // Get user from token (optional)
    // let userId = null;
    const token = request.cookies.get("auth_token")?.value;
    // if (token) {
    //   const payload = await verifyToken(token);
    //   userId = payload?.userId;
    // }
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    const payload = await verifyToken(token);
    const userId = payload?.userId;
    // Verify pharmacy exists and is verified
    const pharmacyDoc = await db.collection("pharmacies").findOne({
      _id: new ObjectId(pharmacyId),
    });

    if (!pharmacyDoc) {
      return NextResponse.json(
        { error: "Pharmacy not found" },
        { status: 404 }
      );
    }

    if (!pharmacyDoc.verified) {
      return NextResponse.json(
        { error: "Selected pharmacy is not verified" },
        { status: 400 }
      );
    }

    // Validate appointment date is in the future
    const appointmentDateTime = new Date(
      `${appointmentDate}T${appointmentTime}`
    );
    if (appointmentDateTime < new Date()) {
      return NextResponse.json(
        { error: "Appointment date must be in the future" },
        { status: 400 }
      );
    }

    // Check for existing appointment
    const existingAppointment = await db.collection("appointments").findOne({
      pharmacy: new ObjectId(pharmacyId),
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: { $in: ["pending", "confirmed"] },
    });

    if (existingAppointment) {
      return NextResponse.json(
        { error: "This time slot is already booked" },
        { status: 409 } // 409 Conflict is more appropriate
      );
    }

    // Create appointment
    const appointment = await db.collection("appointments").insertOne({
      userId: userId,
      pharmacy: new ObjectId(pharmacyId),
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      service,
      description,
      patientName,
      patientPhone,
      patientAge: Number(patientAge),
      urgency,
      notes,
      email,
      paymentRequired,
      consultationFee: Number(consultationFee),
      paymentStatus: paymentRequired ? "pending" : "paid",
      status: "pending", // Initial status
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Send notifications (only if no payment required)
    if (!paymentRequired) {
      try {
        const formattedDate = appointmentDateTime.toLocaleDateString("en-GB");
        const formattedTime = appointmentDateTime.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        });
        // Send SMS to patient
        await sendSMS(
          patientPhone,
          `MediFind: Your appointment at ${pharmacyDoc.name} has been requested for ${formattedDate} at ${formattedTime}. Ref: ${appointment.insertedId.toString().slice(-6)}`
        );

        // Send SMS to pharmacy
        await sendSMS(
          pharmacyDoc.contactNumber,
          `MediFind: New appointment request from ${patientName} for ${service} on ${formattedDate} at ${formattedTime}. Ref: ${appointment.insertedId.toString().slice(-6)}`
        );

        // Send email confirmation
        // await sendEmail(email, {
        //   appointmentId: appointment.insertedId,
        //   pharmacyName: pharmacyDoc.name,
        //   date: formattedDate,
        //   time: formattedTime,
        //   service,
        // });
      } catch (notificationError) {
        console.error("Notification error:", notificationError);
        // Don't fail the request just because notifications failed
      }
    }
    return NextResponse.json(
      {
        success: true,
        message: "Appointment booked successfully",
        appointmentId: appointment.insertedId,
        reference: appointment.insertedId.toString().slice(-6),
        paymentRequired,
        consultationFee,
        nextSteps: paymentRequired
          ? "Please complete payment to confirm your appointment"
          : "Your appointment is pending confirmation",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Appointment booking error:", error);
    return NextResponse.json(
      {
        error: "Failed to book appointment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

//GET APPOINTMENTS,
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToMongoDB();

    // Authentication
    const token = request.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    const userId = payload?.userId;

    if (!userId) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Get appointments
    const appointments = await db
      .collection("appointments")
      .find({ userId: userId })
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .toArray();

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Get appointments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
