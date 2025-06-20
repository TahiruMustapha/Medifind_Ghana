import { validateEnv } from "@/helpers/validateEnv";
import { connectToMongoDB } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";

validateEnv();
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToMongoDB();
    const data = await request.json();

    // VALIDATE REQUIRED FIELDS
    if (!data.email || !data.password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // FIND USER
    const user = await db.collection("users").findOne({ email: data.email });
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // VERIFY PASSWORD
    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // CHECK IF USER IS VERIFIED
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          error: "Account not verified",
          requiresVerification: true,
          email: user.email,
        },
        { status: 403 }
      );
    }

    // CHECK IF TWO FACTOR AUTHENTICATION IS ENABLED
    if (user.twoFactorEnabled) {
      // Generate and send 2FA code
      const response = await fetch(
        new URL("/api/auth/2fa/generate", request.url).toString(),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: user.email }),
        }
      );

      return NextResponse.json(
        {
          requiresTwoFactor: true,
          email: user.email,
          message: "Two-factor authentication required",
        },
        { status: 200 }
      );
    }

    // CREATE TOKEN USING jose
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    // SET COOKIES
    (await cookies()).set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // PARSE USER AGENT
    const userAgent = request.headers.get("user-agent") || "";
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();

    // GET IP ADDRESS
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // STORE SESSION INFORMATION
    await db.collection("sessions").insertOne({
      userId: user._id,
      token: token,
      userAgent: userAgent,
      browser: `${browser.name || "Unknown"} ${browser.version || ""}`,
      os: `${os.name || "Unknown"} ${os.version || ""}`,
      device: device.type
        ? `${device.vendor || ""} ${device.model || ""} (${device.type})`
        : "Desktop",
      ip: ip,
      createdAt: new Date(),
      lastActive: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return NextResponse.json({ error: "Failed to log in" }, { status: 500 });
  }
}
