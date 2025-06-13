import { verifyToken } from "@/lib/auth";
import { connectToMongoDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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
    const pharmacy = await db.collection("pharmacies").findOne({
      userId: userId,
    });

    if (!pharmacy) {
      return NextResponse.json(
        { error: "Pharmacy not found" },
        { status: 404 }
      );
    }

    // Get appointments for this pharmacy
    // const appointments = await db
    //   .collection("appointments")
    //   .find({ pharmacy: new ObjectId(pharmacy._id) })
    //   .sort({
    //     appointmentDate: 1,
    //     appointmentTime: 1,
    //   });
    const pharmacyId =
      typeof pharmacy._id === "string"
        ? new ObjectId(pharmacy._id)
        : pharmacy._id;

    const appointments = await db
      .collection("appointments")
      .find({ pharmacy: pharmacyId })
      .sort({
        appointmentDate: 1,
        appointmentTime: 1,                                                                                                                                                                                                                     
      })
      .toArray();
    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Get pharmacy appointments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
