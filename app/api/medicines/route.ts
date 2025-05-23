import { connectToMongoDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Collection, Document, ObjectId } from "mongodb";


// GET /api/medicines - Get all medicines with availability
interface Medicine extends Document {
  _id: ObjectId;
  name: string;
  genericName: string;
  category: string;
  description: string;
}

interface Pharmacy extends Document {
  _id: ObjectId;
  name: string;
  location: string;
}

interface InventoryItem extends Document {
  _id: ObjectId;
  medicineId: ObjectId;
  pharmacyId: ObjectId;
  price: number;
  quantity: number;
  inStock: boolean;
  lastUpdated: Date;
}

interface Availability extends Document {
  _id: ObjectId;
  medicineId: ObjectId;
  pharmacyId: ObjectId;
}

interface PharmacyInfo {
  pharmacyId: ObjectId;
  pharmacyName: string;
  location: string;
  price: number;
  quantity: number;
  lastUpdated: Date;
}

interface MedicineWithPharmacies extends Omit<Medicine, "_id"> {
  _id: ObjectId;
  pharmacies: PharmacyInfo[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  stack?: string;
}

// Haversine formula to calculate distance between two points
function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

// GET /api/medicines - Get all medicines with availability
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToMongoDB();
    const searchParams = request.nextUrl.searchParams;

    // Get query parameters
    const name = searchParams.get("name")?.trim();
    const location = searchParams.get("location")?.trim();

    // Get user coordinates for distance calculation
    const userLat = parseFloat(searchParams.get("latitude") || "0");
    const userLng = parseFloat(searchParams.get("longitude") || "0");
    const hasUserLocation = userLat !== 0 && userLng !== 0;

    // Build the base query for medicines
    const medicineQuery: Document = {};
    if (name) {
      medicineQuery.name = { $regex: name, $options: "i" };
    }

    // Build location filter for pharmacies
    const pharmacyFilter: Document = {};
    if (location) {
      pharmacyFilter["pharmacy.location"] = { $regex: location, $options: "i" };
    }

    // Check if medicines collection has data
    const medicineCount = await db
      .collection<Medicine>("medicines")
      .countDocuments(medicineQuery);

    if (medicineCount === 0) {
      return NextResponse.json<ApiResponse<MedicineWithPharmacies[]>>({
        success: true,
        data: [],
      });
    }

    // Build pipeline in stages
    const pipeline: Document[] = [];

    // Stage 1: Initial medicine match
    pipeline.push({ $match: medicineQuery });

    // Stage 2: Lookup inventory
    pipeline.push({
      $lookup: {
        from: "inventory",
        localField: "_id",
        foreignField: "medicineId",
        as: "inventoryItems",
      },
    });

    // Check if inventoryItems exists before unwinding
    pipeline.push({
      $match: {
        inventoryItems: { $exists: true, $ne: [] },
      },
    });

    // Stage 3: Unwind inventory
    pipeline.push({
      $unwind: { path: "$inventoryItems", preserveNullAndEmptyArrays: false },
    });

    // Stage 4: Lookup availability with ObjectId handling
    pipeline.push({
      $lookup: {
        from: "availability",
        let: {
          medId: { $toString: "$_id" },
          pharmId: { $toString: "$inventoryItems.pharmacyId" },
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: [{ $toString: "$medicineId" }, "$$medId"] },
                  { $eq: [{ $toString: "$pharmacyId" }, "$$pharmId"] },
                ],
              },
            },
          },
        ],
        as: "availability",
      },
    });

    // Keep only in-stock items
    pipeline.push({
      $match: {
        "inventoryItems.inStock": true,
      },
    });

    // Stage 5: Lookup pharmacies
    pipeline.push({
      $lookup: {
        from: "pharmacies",
        localField: "inventoryItems.pharmacyId",
        foreignField: "_id",
        as: "pharmacy",
      },
    });

    // Check if pharmacy exists before unwinding
    pipeline.push({
      $match: {
        pharmacy: { $exists: true, $ne: [] },
      },
    });

    // Stage 6: Unwind pharmacy
    pipeline.push({
      $unwind: { path: "$pharmacy", preserveNullAndEmptyArrays: false },
    });

    // Apply location filter if provided
    if (location) {
      pipeline.push({ $match: pharmacyFilter });
    }

    // Final grouping stage
    // pipeline.push({
    //   $group: {
    //     _id: "$_id",
    //     name: { $first: "$name" },
    //     genericName: { $first: "$genericName" },
    //     category: { $first: "$category" },
    //     description: { $first: "$description" },
    //     pharmacies: {
    //       $push: {
    //         pharmacyId: "$pharmacy._id",
    //         pharmacyName: "$pharmacy.name",
    //         location: "$pharmacy.location",
    //         price: "$inventoryItems.price",
    //         quantity: "$inventoryItems.quantity",
    //         lastUpdated: "$inventoryItems.lastUpdated",
    //       },
    //     },
    //   },
    // });

    pipeline.push({
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        genericName: { $first: "$genericName" },
        category: { $first: "$category" },
        description: { $first: "$description" },
        pharmacies: {
          $push: {
            pharmacyId: "$pharmacy._id",
            pharmacyName: "$pharmacy.name",
            location: "$pharmacy.location",
            latitude: "$pharmacy.latitude",
            longitude: "$pharmacy.longitude",
            price: "$inventoryItems.price",
            quantity: "$inventoryItems.quantity",
            lastUpdated: "$inventoryItems.lastUpdated"
          }
        }
      }
    });

    // Final sort
    pipeline.push({ $sort: { name: 1 } });

    // Execute the full pipeline
    const medicines = await db
      .collection<Medicine>("medicines")
      .aggregate<MedicineWithPharmacies>(pipeline)
      .toArray();
    
     // Calculate distances and sort pharmacies by proximity if user location is provided
     if (hasUserLocation) {
      medicines.forEach(medicine => {
        medicine.pharmacies.forEach((pharmacy: any) => {
          if (pharmacy.latitude && pharmacy.longitude) {
            pharmacy.distance = calculateDistance(
              userLat, 
              userLng, 
              pharmacy.latitude, 
              pharmacy.longitude
            );
          } else {
            pharmacy.distance = Number.MAX_VALUE; // Put pharmacies without coordinates at the end
          }
        });
        
        // Sort pharmacies by distance (nearest first)
        medicine.pharmacies.sort((a: any, b: any) => a.distance - b.distance);
      });
    }

    return NextResponse.json<ApiResponse<MedicineWithPharmacies[]>>({
      success: true,
      data: medicines,
    });
  } catch (error) {
    console.error("Error fetching medicines:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: "Failed to fetch medicines",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
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
