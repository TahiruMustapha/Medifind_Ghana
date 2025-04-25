import { validateEnv } from "@/helpers/validateEnv";
import { jwtVerify } from "jose";

export interface JWTPayload {
  userId: string;
  role: string;
}
export async function verifyToken(token: string) {
    validateEnv();
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
 
  try {
    const { payload }: { payload: JWTPayload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
}
