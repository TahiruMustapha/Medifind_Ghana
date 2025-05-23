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

// // POST /api/pharmacies - Add a new pharmacy
// export async function POST(request: NextRequest) {
//   try {
//     const { db } = await connectToMongoDB();
//     const data = await request.json();

//     // Validate required fields
//     if (!data.name || !data.location || !data.contactNumber) {
//       return NextResponse.json(
//         { error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     //ADDING PHARMACY
//     const result = await db.collection("pharmacies").insertOne({
//       name: data.name,
//       location: data.location,
//       region: data.region,
//       address:data.address,
//       coordinates: data.coordinates || null,
//       contactNumber: data.contactNumber,
//       email: data.email || null,
//       operatingHours: data.operatingHours || null,
//       userId: data.userId,
//       verified: false,
//       licenseNumber: data.licenseNumber || null,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     });
//     return NextResponse.json(
//       {
//         message: "Pharmacy added successfully",
//         id: result.insertedId,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Error adding pharmacy:", error);
//     return NextResponse.json(
//       { error: "Failed to add pharmacy" },
//       { status: 500 }
//     );
//   }
// }

// POST /api/pharmacies - Add a new pharmacy with geocoding

// Geocoding function to get coordinates from address
async function geocodeAddress(address: string): Promise<{latitude: number, longitude: number} | null> {
  try {
    // Using OpenStreetMap Nominatim API (free, no API key required)
    // Note: For production, consider using a paid service with better rate limits
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'Medifind-GH' // Required by Nominatim ToS
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

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

    // Prepare full address for geocoding
    const fullAddress = [
      data.address,
      data.location,
      data.region,
    ].filter(Boolean).join(', ');

    // Get coordinates from address if not provided
    let latitude = null;
    let longitude = null;

    // Check if coordinates are already provided
    if (data.coordinates && 
        typeof data.coordinates.latitude === 'number' && 
        typeof data.coordinates.longitude === 'number') {
      latitude = data.coordinates.latitude;
      longitude = data.coordinates.longitude;
    } else {
      // Geocode the address
      const coordinates = await geocodeAddress(fullAddress);
      if (coordinates) {
        latitude = coordinates.latitude;
        longitude = coordinates.longitude;
      }
    }

    // ADDING PHARMACY with latitude and longitude
    const result = await db.collection("pharmacies").insertOne({
      name: data.name,
      location: data.location,
      region: data.region,
      address: data.address || null,
      // Add separate latitude and longitude fields
      latitude: latitude,
      longitude: longitude,
      // Keep coordinates object for backward compatibility
      // coordinates: latitude && longitude ? { latitude, longitude } : null,
      contactNumber: data.contactNumber,
      email: data.email || null,
      operatingHours: data.operatingHours || null,
      userId: data.userId,
      verified: false,
      licenseNumber: data.licenseNumber || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Return success response with geocoding status
    return NextResponse.json(
      {
        message: "Pharmacy added successfully",
        id: result.insertedId,
        geocoded: latitude !== null && longitude !== null,
        coordinates: latitude && longitude ? { latitude, longitude } : null
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

// Migration script to add coordinates to existing pharmacies
// export async function migratePharmacyCoordinates() {
//   try {
//     const { db } = await connectToMongoDB();
    
//     // Get all pharmacies without coordinates
//     const pharmacies = await db.collection("pharmacies")
//       .find({ 
//         $or: [
//           { latitude: { $exists: false } },
//           { longitude: { $exists: false } },
//           { latitude: null },
//           { longitude: null }
//         ] 
//       })
//       .toArray();
    
//     console.log(`Found ${pharmacies.length} pharmacies without coordinates`);
    
//     let successCount = 0;
//     let failCount = 0;
    
//     for (const pharmacy of pharmacies) {
//       // Prepare full address for geocoding
//       const fullAddress = [
//         pharmacy.address,
//         pharmacy.location,
//         pharmacy.region,
//       ].filter(Boolean).join(', ');
      
//       if (!fullAddress) {
//         console.log(`Skipping pharmacy ${pharmacy._id}: No address information`);
//         failCount++;
//         continue;
//       }
      
//       console.log(`Geocoding ${pharmacy.name}: ${fullAddress}`);
      
//       // Add delay to respect API rate limits (important for free APIs)
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       // Geocode the address
//       const coordinates = await geocodeAddress(fullAddress);
      
//       if (coordinates) {
//         // Update the pharmacy with coordinates
//         await db.collection("pharmacies").updateOne(
//           { _id: pharmacy._id },
//           { 
//             $set: { 
//               latitude: coordinates.latitude,
//               longitude: coordinates.longitude,
//               coordinates: coordinates,
//               updatedAt: new Date()
//             } 
//           }
//         );
//         console.log(`Updated coordinates for ${pharmacy.name}`);
//         successCount++;
//       } else {
//         console.log(`Failed to geocode ${pharmacy.name}`);
//         failCount++;
//       }
//     }
    
//     console.log(`Migration complete: ${successCount} succeeded, ${failCount} failed`);
//     return { success: true, updated: successCount, failed: failCount };
//   } catch (error) {
//     console.error("Migration error:", error);
    
//   }
// }

