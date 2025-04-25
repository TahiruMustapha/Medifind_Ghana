import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

const protectedPaths = ["/dashboard", "/pharmacy/dashboard", "/admin"];

const roleBasedPaths = {
  "/admin": ["admin"],
  "/pharmacy/dashboard": ["pharmacy", "admin"],
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isProtectedPath = protectedPaths.some((pp) => path.startsWith(pp));
  if (!isProtectedPath) return NextResponse.next();

  const token = request.cookies.get("auth_token")?.value;
  // console.log("token", token);
  if (!token) {
    return NextResponse.redirect(
      new URL("/login?redirect=" + path, request.url)
    );
  }
  try {
    const payload = token ? await verifyToken(token) : null;
    if (!payload) {
      return NextResponse.redirect(
        new URL("/login?redirect=" + path, request.url)
      );
    }

    // Role-based redirect
    for (const [restrictedPath, allowedRoles] of Object.entries(
      roleBasedPaths
    )) {
      if (
        path.startsWith(restrictedPath) &&
        !allowedRoles.includes(payload.role as string)
      ) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    }

    if (!path.startsWith("/api/") && payload.userId) {
      await fetch(`${request.nextUrl.origin}/api/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, userId: payload.userId }),
      });
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload?.userId as string);
    requestHeaders.set("x-user-role", payload?.role as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.redirect(
      new URL("/login?redirect=" + path, request.url)
    );
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/pharmacy/:path*",
    "/admin/:path*",
    "/api/protected/:path*",
  ],
};
