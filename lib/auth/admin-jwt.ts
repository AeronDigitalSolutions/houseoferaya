import jwt from "jsonwebtoken";
import { ADMIN_AUTH_TOKEN_EXPIRY_SECONDS } from "@/lib/auth/constants";

type AdminSessionTokenPayload = {
  sub: string;
  role: "SUPER_ADMIN" | "ADMIN";
};

function getJwtSecret() {
  return process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "dev_jwt_secret_change_me";
}

export function signAdminSessionToken(payload: AdminSessionTokenPayload) {
  return jwt.sign(payload, getJwtSecret(), {
    algorithm: "HS256",
    expiresIn: ADMIN_AUTH_TOKEN_EXPIRY_SECONDS
  });
}

export function verifyAdminSessionToken(token: string): AdminSessionTokenPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AdminSessionTokenPayload;
    if (!decoded?.sub || !decoded?.role) return null;
    return decoded;
  } catch {
    return null;
  }
}
