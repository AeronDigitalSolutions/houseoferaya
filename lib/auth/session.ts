import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, AUTH_TOKEN_EXPIRY_SECONDS } from "@/lib/auth/constants";
import { signSessionToken, verifySessionToken } from "@/lib/auth/jwt";

type SessionUser = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: UserRole;
};

function shouldUseSecureCookies(request?: Request) {
  if (process.env.NODE_ENV !== "production") {
    return false;
  }

  if (!request) {
    return true;
  }

  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.split(",")[0].trim() === "https";
  }

  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return true;
  }
}

function buildCookieOptions(request?: Request) {
  return {
    httpOnly: true,
    secure: shouldUseSecureCookies(request),
    sameSite: "lax" as const,
    path: "/",
    maxAge: AUTH_TOKEN_EXPIRY_SECONDS
  };
}

export function attachSessionCookie(response: NextResponse, request: Request, user: SessionUser) {
  const token = signSessionToken({
    sub: user.id,
    role: user.role,
    email: user.email || undefined,
    phone: user.phone || undefined
  });

  response.cookies.set(AUTH_COOKIE_NAME, token, buildCookieOptions(request));
}

export function clearSessionCookie(response: NextResponse, request?: Request) {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...buildCookieOptions(request),
    maxAge: 0
  });
}

export async function getAuthUserFromRequest(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  const decoded = verifySessionToken(token);
  if (!decoded) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: decoded.sub },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true
    }
  });
}

export async function getAuthUserFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const decoded = verifySessionToken(token);
  if (!decoded) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: decoded.sub },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true
    }
  });
}
