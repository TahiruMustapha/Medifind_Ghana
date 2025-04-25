import { connectToMongoDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

// POST /api/sms - Handle incoming SMS
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToMongoDB();
    const data = await request.json();

    // Extract SMS data from Africa's Talking API format
    const { from, text } = data;

    if (!from || !text) {
      return NextResponse.json({ error: "Missing SMS data" }, { status: 400 });
    }

    // Log the incoming SMS
    await db.collection("smsLogs").insertOne({
      from,
      text,
      receivedAt: new Date(),
    });

    // Parse the SMS command
    // Format examples:
    // FIND PARACETAMOL ACCRA
    // UPDATE PARACETAMOL YES PHARMACY_ID
    const parts = text.trim().toUpperCase().split(" ");
    const command = parts[0];
    let response = "";

    if (command === "FIND") {
      // Handle medicine search
      const medicineName = parts[1];
      const location = parts[2] || null;

      const query = { name: { $regex: medicineName, $options: "i" } };

      const medicines = await db
        .collection("medicines")
        .aggregate([
          { $match: query },
          {
            $lookup: {
              from: "pharmacies",
              localField: "availability.pharmacyId",
              foreignField: "_id",
              as: "pharmacyDetails",
            },
          },
        ])
        .toArray();

      if (medicines.length === 0) {
        response = `No results found for ${medicineName}`;
      } else {
        // Filter by location if provided
        const availableAt = [];

        for (const medicine of medicines) {
          for (let i = 0; i < medicine.availability?.length || 0; i++) {
            const avail = medicine.availability[i];
            const pharmacy = medicine.pharmacyDetails.find(
              (p: any) => p._id.toString() === avail.pharmacyId.toString()
            );

            if (
              avail.inStock &&
              pharmacy &&
              (!location || pharmacy.location.toUpperCase().includes(location))
            ) {
              availableAt.push(`${pharmacy.name} (${pharmacy.contactNumber})`);

              // Limit to 3 results for SMS
              if (availableAt.length >= 3) break;
            }
          }
        }

        if (availableAt.length === 0) {
          response = `${medicineName} is currently out of stock in ${
            location || "all locations"
          }`;
        } else {
          response = `${medicineName} available at: ${availableAt.join(", ")}`;
        }
      }
    } else if (command === "UPDATE") {
      // Handle availability update
      // This would require authentication in a real system
      response = "Update feature coming soon. Please use the web app for now.";
    } else {
      response =
        "Invalid command. Use FIND [MEDICINE] [LOCATION] or UPDATE [MEDICINE] [YES/NO] [PHARMACY_ID]";
    }

    // In a real implementation, you would send this response back via the SMS gateway
    return NextResponse.json({
      response,
      success: true,
    });
  } catch (error) {
    console.error("Error processing SMS:", error);
    return NextResponse.json(
      { error: "Failed to process SMS" },
      { status: 500 }
    );
  }
}
