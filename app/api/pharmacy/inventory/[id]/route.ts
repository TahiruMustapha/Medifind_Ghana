import { verifyToken } from "@/lib/auth";
import { connectToMongoDB } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

// GET /api/pharmacy/inventory/[id] - Get a specific medicine in the inventory
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user ID from middleware

    // const userId = request.headers.get("x-user-id");
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const userId = payload.userId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = params;
    const { db } = await connectToMongoDB();

    // Find pharmacy associated with user
    const pharmacy = await db.collection("pharmacies").findOne({
      // userId: new ObjectId(userId),
      userId: payload.userId,
    });

    if (!pharmacy) {
      return NextResponse.json(
        { error: "Pharmacy not found" },
        { status: 404 }
      );
    }

    // Get medicine from inventory
    const medicine = await db.collection("inventory").findOne({
      _id: new ObjectId(id),
      pharmacyId: pharmacy._id,
    });

    if (!medicine) {
      return NextResponse.json(
        { error: "Medicine not found in inventory" },
        { status: 404 }
      );
    }

    return NextResponse.json({ medicine });
  } catch (error) {
    console.error("Error fetching medicine:", error);
    return NextResponse.json(
      { error: "Failed to fetch medicine" },
      { status: 500 }
    );
  }
}

// PUT /api/pharmacy/inventory/[id] - Update a medicine in the inventory
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user ID from middleware
    // const userId = request.headers.get("x-user-id");
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const userId = payload.userId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { db } = await connectToMongoDB();

    // Find pharmacy associated with user
    const pharmacy = await db.collection("pharmacies").findOne({
      // userId: new ObjectId(userId),
      userId: payload.userId,
    });

    if (!pharmacy) {
      return NextResponse.json(
        { error: "Pharmacy not found" },
        { status: 404 }
      );
    }

    // Get data from request
    const data = await request.json();

    // Get medicine from inventory
    const medicine = await db.collection("inventory").findOne({
      _id: new ObjectId(id),
      pharmacyId: pharmacy._id,
    });

    if (!medicine) {
      return NextResponse.json(
        { error: "Medicine not found in inventory" },
        { status: 404 }
      );
    }

    // Update medicine in inventory
    const result = await db.collection("inventory").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          price: data.price,
          quantity: data.quantity,
          lowStockThreshold: data.lowStockThreshold,
          inStock: data.inStock,
          notes: data.notes,
          lastUpdated: new Date(),
        },
      }
    );

    // Update medicine availability in the global availability collection
    await db.collection("availability").updateOne(
      {
        medicineId: medicine.medicineId,
        pharmacyId: pharmacy._id,
      },
      {
        $set: {
          inStock: data.inStock,
          price: data.price,
          lastUpdated: new Date(),
          reportedBy: "pharmacy",
          verified: true,
        },
      },
      { upsert: true }
    );
    return NextResponse.json({
      message: "Medicine updated successfully",
      updated: result.modifiedCount > 0,
    });
  } catch (error) {
    console.error("Error updating medicine:", error);
    return NextResponse.json(
      { error: "Failed to update medicine" },
      { status: 500 }
    );
  }
}

// DELETE /api/pharmacy/inventory/[id] - Remove a medicine from the inventory
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user ID from middleware
    // const userId = request.headers.get("x-user-id");
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const userId = payload.userId;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { db } = await connectToMongoDB();

    // Find pharmacy associated with user
    const pharmacy = await db.collection("pharmacies").findOne({
      // userId: new ObjectId(userId),
      userId: payload.userId,
    });

    if (!pharmacy) {
      return NextResponse.json(
        { error: "Pharmacy not found" },
        { status: 404 }
      );
    }

    // Get medicine from inventory
    const medicine = await db.collection("inventory").findOne({
      _id: new ObjectId(id),
      pharmacyId: pharmacy._id,
    });
    if (!medicine) {
      return NextResponse.json(
        { error: "Medicine not found in inventory" },
        { status: 404 }
      );
    }

    // Remove medicine from inventory
    const result = await db
      .collection("inventory")
      .deleteOne({ _id: new ObjectId(id) });

    // Update medicine availability in the global availability collection
    await db.collection("availability").updateOne(
      {
        medicineId: medicine.medicineId,
        pharmacyId: pharmacy._id,
      },
      {
        $set: {
          inStock: false,
          lastUpdated: new Date(),
          reportedBy: "pharmacy",
          verified: true,
        },
      },
      { upsert: true }
    );

    return NextResponse.json({
      message: "Medicine removed from inventory successfully",
      deleted: result.deletedCount > 0,
    });
  } catch (error) {
    console.error("Error removing medicine:", error);
    return NextResponse.json(
      { error: "Failed to remove medicine" },
      { status: 500 }
    );
  }
}
