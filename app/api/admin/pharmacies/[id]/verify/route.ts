import { connectToMongoDB } from "@/lib/mongodb";
import { sendPharmacyVerificationNotification } from "@/lib/notification";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

// POST /api/admin/pharmacies/[id]/verify - Verify or unverify a pharmacy
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin (this should be handled by middleware)
    const userRole = request.headers.get("x-user-role");
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { id } = params;
    const { db } = await connectToMongoDB();
    const data = await request.json();

    // Validate required fields
    if (data.verified === undefined) {
      return NextResponse.json(
        { error: "Verification status is required" },
        { status: 400 }
      );
    }

    // Update pharmacy verification status
    const result = await db.collection("pharmacies").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          verified: data.verified,
          verifiedAt: data.verified ? new Date() : null,
          updatedAt: new Date(),
        },
      }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Pharmacy not found" },
        { status: 404 }
      );
    }
    // If verifying, also update the user account and send notification
    if (data.varified) {
      const pharmacy = await db
        .collection("pharmacies")
        .findOne({ _id: new ObjectId(id) });

      if (pharmacy && pharmacy.userId) {
        await db
          .collection("users")
          .updateOne(
            { _id: new ObjectId(pharmacy.userId) },
            { $set: { verified: true, updatedAt: new Date() } }
          );

        // Send SMS notification
        if (pharmacy.contactNumber) {
          await sendPharmacyVerificationNotification(
            pharmacy.contactNumber,
            pharmacy.name
          );
        }
      }
    }
    return NextResponse.json({
      message: `Pharmacy ${
        data.verified ? "verified" : "unverified"
      } successfully`,
      updated: result.modifiedCount > 0,
    });
  } catch (error) {
    console.error("Error updating pharmacy verification:", error);
    return NextResponse.json(
      { error: "Failed to update pharmacy verification" },
      { status: 500 }
    );
  }
}
