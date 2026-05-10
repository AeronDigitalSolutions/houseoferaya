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

function buildCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: AUTH_TOKEN_EXPIRY_SECONDS
  };
}

export function attachSessionCookie(response: NextResponse, user: SessionUser) {
  const token = signSessionToken({
    sub: user.id,
    role: user.role,
    email: user.email || undefined,
    phone: user.phone || undefined
  });

  response.cookies.set(AUTH_COOKIE_NAME, token, buildCookieOptions());
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...buildCookieOptions(),
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

