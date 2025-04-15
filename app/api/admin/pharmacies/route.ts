import { connectToMongoDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/pharmacies - Get all pharmacies for admin
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin (this should be handled by middleware)
    const userRole = request.headers.get("x-user-role");
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { db } = await connectToMongoDB();
    const searchParams = request.nextUrl.searchParams;
    const verified = searchParams.get("verified");
    let query = {};
    if (verified) {
      query = { ...query, verified: verified === "true" };
    }

    // Sort by creation date, newest first
    const pharmacies = await db
      .collection("pharmacies")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json({ pharmacies });
  } catch (error) {
    console.error("Error fetching pharmacies:", error);
    return NextResponse.json(
      { error: "Failed to fetch pharmacies" },
      { status: 500 }
    );
  }
}
