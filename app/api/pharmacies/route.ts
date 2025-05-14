import { connectToMongoDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

// GET /api/pharmacies - Get all pharmacies
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToMongoDB();

    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get("name");
    const location = searchParams.get("location");
    const verified = searchParams.get("verified");

    let query = {};
    if (name) {
      query = { ...query, name: { $regex: name, $options: "i" } };
    }
    if (location) {
      query = { ...query, location: { $regex: location, $options: "i" } };
    }
    if (verified) {
      query = { ...query, verified: verified === "true" };
    }

    const pharmacies = await db.collection("pharmacies").find(query).toArray();

    return NextResponse.json({ pharmacies });
  } catch (error) {
    console.error("Error fetching pharmacies:", error);
    return NextResponse.json(
      { error: "Failed to fetch pharmacies" },
      { status: 500 }
    );
  }
}

// POST /api/pharmacies - Add a new pharmacy
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToMongoDB();
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.location || !data.contactNumber) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    //ADDING PHARMACY
    const result = await db.collection("pharmacies").insertOne({
      name: data.name,
      location: data.location,
      region: data.region,
      coordinates: data.coordinates || null,
      contactNumber: data.contactNumber,
      email: data.email || null,
      operatingHours: data.operatingHours || null,
      userId: data.userId,
      verified: false,
      licenseNumber: data.licenseNumber || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return NextResponse.json(
      {
        message: "Pharmacy added successfully",
        id: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding pharmacy:", error);
    return NextResponse.json(
      { error: "Failed to add pharmacy" },
      { status: 500 }
    );
  }
}
