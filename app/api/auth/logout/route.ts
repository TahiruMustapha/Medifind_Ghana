import { connectToMongoDB } from "@/lib/mongodb";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    //GET TOKEN FROM COOKIES
    const token = (await cookies()).get("auth_token")?.value;

    //IF TOKEN EXIST, REMOVE THE TOKEN FROM DATABASE
    if (token) {
      const { db } = await connectToMongoDB();
      await db.collection("sessions").deleteOne({ token });
    }

    //CLEAR AUTH COOKIE;
    (await cookies()).delete("auth_token");
    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out:", error);
    return NextResponse.json({ error: "Failed to log out" }, { status: 500 });
  }
}
