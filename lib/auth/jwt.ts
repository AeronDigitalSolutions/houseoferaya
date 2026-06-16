import jwt from "jsonwebtoken";
import { AUTH_TOKEN_EXPIRY_SECONDS, OTP_TOKEN_EXPIRY_SECONDS } from "@/lib/auth/constants";

type SessionTokenPayload = {
  sub: string;
  role: "CUSTOMER" | "ADMIN";
  email?: string;
  phone?: string;
};

type AuthChallengePayload = {
  purpose: "register" | "login" | "profile_contact_update" | "profile_contact_verified";
  fullName?: string;
  email?: string;
  phone?: string;
  userId?: string;
  emailOtpHash?: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || "dev_jwt_secret_change_me";
  return secret;
}

export function signSessionToken(payload: SessionTokenPayload) {
  return jwt.sign(payload, getJwtSecret(), {
    algorithm: "HS256",
    expiresIn: AUTH_TOKEN_EXPIRY_SECONDS
  });
}

export function verifySessionToken(token: string): SessionTokenPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as SessionTokenPayload;
    if (!decoded?.sub) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export function signAuthChallengeToken(payload: AuthChallengePayload) {
  return jwt.sign(payload, getJwtSecret(), {
    algorithm: "HS256",
    expiresIn: OTP_TOKEN_EXPIRY_SECONDS
  });
}

export function verifyAuthChallengeToken(token: string): AuthChallengePayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AuthChallengePayload;
    if (!decoded?.purpose) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}
