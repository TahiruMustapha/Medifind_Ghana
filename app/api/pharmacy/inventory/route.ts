import { connectToMongoDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get user ID from middleware
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToMongoDB();

    // Find pharmacy associated with user
    const pharmacy = await db.collection("pharmacies").findOne({
      userId: new ObjectId(userId),
    });

    if (!pharmacy) {
      return NextResponse.json(
        { error: "Pharmacy not found" },
        { status: 404 }
      );
    }

    // Get pharmacy's inventory

    const inventory = await db
      .collection("inventory")
      .find({
        pharmacyId: pharmacy._id,
      })
      .toArray();

    // Get search count (how many times medicines from this pharmacy appeared in search results)
    const searchCount = await db.collection("searchLogs").countDocuments({
      "results.pharmacyId": pharmacy._id,
    });

    return NextResponse.json({
      inventory,
      searchCount,
    });
  } catch (error) {
    console.error("Error fetching pharmacy inventory:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}

//POST TO PHARMACY INVENTORY

export async function POST(request: NextRequest) {
  try {
    // Get user ID from middleware
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { db } = await connectToMongoDB();

    // Find pharmacy associated with user
    const pharmacy = await db.collection("pharmacies").findOne({
      userId: new ObjectId(userId),
    });
    if (!pharmacy) {
      return NextResponse.json(
        { error: "Pharmacy not found" },
        { status: 404 }
      );
    }
    // Get data from request
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.genericName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if medicine already exists in global medicines collection
    let medicine = await db.collection("medicines").findOne({
      $or: [
        { name: { $regex: new RegExp(`^${data.name}$`, "i") } },
        { genericName: { $regex: new RegExp(`^${data.genericName}$`, "i") } },
      ],
    });

    // If medicine doesn't exist, create it
    if (!medicine) {
      const result = await db.collection("medicines").insertOne({
        name: data.name,
        genericName: data.genericName,
        category: data.category || null,
        description: data.description || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      medicine = {
        _id: result.insertedId,
        name: data.name,
        genericName: data.genericName,
      };
    }
    // Check if medicine already exists in pharmacy's inventory
    const existingInventory = await db.collection("inventory").findOne({
      pharmacyId: pharmacy._id,
      medicineId: medicine._id,
    });

    if (existingInventory) {
      return NextResponse.json(
        {
          error: "This medicine is already in your inventory",
          inventoryId: existingInventory._id,
        },
        { status: 409 }
      );
    }

    // Add medicine to pharmacy's inventory
    const inventoryResult = await db.collection("inventory").insertOne({
      pharmacyId: pharmacy._id,
      medicineId: medicine._id,
      name: medicine.name,
      genericName: medicine.genericName,
      price: data.price || null,
      quantity: data.quantity || 0,
      lowStockThreshold: data.lowStockThreshold || 5,
      inStock: data.inStock !== undefined ? data.inStock : data.quantity > 0,
      notes: data.notes || null,
      lastUpdated: new Date(),
      createdAt: new Date(),
    });

    // Update medicine availability in the global availability collection
    await db.collection("availability").updateOne(
      {
        medicineId: medicine._id,
        pharmacyId: pharmacy._id,
      },
      {
        $set: {
          inStock:
            data.inStock !== undefined ? data.inStock : data.quantity > 0,
          price: data.price || null,
          lastUpdated: new Date(),
          reportedBy: "pharmacy",
          verified: true,
        },
      },
      { upsert: true }
    );

    return NextResponse.json(
      {
        message: "Medicine added to inventory successfully",
        inventoryId: inventoryResult.insertedId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding medicine to inventory:", error);
    return NextResponse.json(
      { error: "Failed to add medicine to inventory" },
      { status: 500 }
    );
  }
}
