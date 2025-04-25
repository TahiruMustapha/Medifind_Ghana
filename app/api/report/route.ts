import { connectToMongoDB } from "@/lib/mongodb";
import { sendSMS } from "@/lib/sms";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
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

    // Create report
    const reportResult = await db.collection("reports").insertOne({
      medicineId,
      pharmacyId,
      inStock: data.inStock,
      price: data.price,
      phoneNumber: data.phoneNumber,
      verified: false,
      createdAt: new Date(),
    });
    // Update availability in the global availability collection
    // Note: For user reports, we don't immediately update the availability
    // Instead, we wait for verification or use a threshold of reports

    // Check if there are multiple recent reports with the same status
    const recentReports = await db
      .collection("reports")
      .find({
        medicineId,
        pharmacyId,
        inStock: data.inStock,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
      })
      .toArray();

    // If there are at least 3 reports with the same status, update the availability
    if (recentReports.length >= 3) {
      await db.collection("availability").updateOne(
        {
          medicineId,
          pharmacyId,
        },
        {
          $set: {
            inStock: data.inStock,
            price: data.price,
            lastUpdated: new Date(),
            reportedBy: "user",
            verified: false,
          },
        },
        { upsert: true }
      );

      // If medicine is reported as out of stock, notify the pharmacy
      if (!data.inStock) {
        try {
          // Send notification to pharmacy
          if (pharmacy.contactNumber) {
            await sendSMS(
              pharmacy.contactNumber,
              `MediFind Ghana: Multiple users have reported that ${medicine.name} is out of stock at your pharmacy. Please update your inventory if this is incorrect.`
            );
          }
        } catch (error) {
          console.error("Error sending notification to pharmacy:", error);
        }
      }
    }
    // If user provided a phone number, save it for notifications
    if (data.phoneNumber) {
      // Check if user has subscribed to notifications for this medicine
      const existingSubscription = await db
        .collection("subscriptions")
        .findOne({
          medicineId,
          phoneNumber: data.phoneNumber,
        });

      if (!existingSubscription) {
        await db.collection("subscriptions").insertOne({
          medicineId,
          phoneNumber: data.phoneNumber,
          createdAt: new Date(),
        });
      }
    }
    return NextResponse.json(
      {
        message: "Report submitted successfully",
        reportId: reportResult.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting report:", error);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}
