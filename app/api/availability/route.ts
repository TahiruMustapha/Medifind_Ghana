import { connectToMongoDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

// POST /api/availability - Update medicine availability
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToMongoDB();
    const data = await request.json();

    // Validate required fields
    if (!data.medicineId || !data.pharmacyId || data.inStock === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert string IDs to ObjectId
    const medicineId = new ObjectId(data.medicineId);
    const pharmacyId = new ObjectId(data.pharmacyId);

    // Check if medicine and pharmacy exist
    const medicine = await db
      .collection("medicines")
      .findOne({ _id: medicineId });
    const pharmacy = await db
      .collection("pharmacies")
      .findOne({ _id: pharmacyId });

    if (!medicine || !pharmacy) {
      return NextResponse.json(
        { error: "Medicine or pharmacy not found" },
        { status: 404 }
      );
    }

    // Update availability
    const availabilityUpdate = {
      pharmacyId,
      inStock: data.inStock,
      price: data.price,
      lastUpdated: new Date(),
      reportedBy: data.reportedBy || "user",
      verified: data.verified || false,
    } as any;

    // Check if this pharmacy already has an availability record for this medicine
    const existingAvailabilityIndex = medicine.availability
      ? medicine.availability.findIndex(
          (a: any) => a.pharmacyId.toString() === pharmacyId.toString()
        )
      : -1;

    let result;
    if (existingAvailabilityIndex >= 0) {
      // Update existing availability record
      result = await db
        .collection("medicines")
        .updateOne(
          { _id: medicineId, "availability.pharmacyId": pharmacyId },
          {
            $set: {
              [`availability.${existingAvailabilityIndex}`]: availabilityUpdate,
              updatedAt: new Date(),
            },
          }
        );
    } else {
      // Add new availability record
      result = await db.collection("medicines").updateOne(
        { _id: medicineId },
        {
          $push: { availability: availabilityUpdate },
          $set: { updatedAt: new Date() },
        }
      );
    }

    // Create availability history record
    await db.collection("availabilityHistory").insertOne({
      medicineId,
      pharmacyId,
      inStock: data.inStock,
      price: data.price,
      reportedBy: data.reportedBy || "user",
      createdAt: new Date(),
    });

    return NextResponse.json({
      message: "Availability updated successfully",
      updated: result.modifiedCount > 0,
    });
  } catch (error) {
    console.error("Error updating availability:", error);
    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    );
  }
}
