import { connectToMongoDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

// GET /api/medicines - Get all medicines with availability
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToMongoDB();
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get("name");
    const location = searchParams.get("location");

    let query = {};

    if (name) {
      query = { ...query, name: { $regex: name, $options: "i" } };
    }
    if (location) {
      query = {
        ...query,
        "availability.location": { $regex: location, $options: "i" },
      };
    }

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

    return NextResponse.json({ medicines });
  } catch (error) {
    console.error("Error fetching medicines:", error);
    return NextResponse.json(
      { error: "Failed to fetch medicines" },
      { status: 500 }
    );
  }
}

// POST /api/medicines - Add a new medicine
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToMongoDB();
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.genericName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await db.collection("medicines").insertOne({
      name: data.name,
      genericName: data.genericName,
      category: data.category,
      description: data.description,
      availability: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(
      {
        message: "Medicine added successfully",
        id: result.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding medicine:", error);
    return NextResponse.json(
      { error: "Failed to add medicine" },
      { status: 500 }
    );
  }
}
