import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_AUTH_COOKIE_NAME, ADMIN_AUTH_TOKEN_EXPIRY_SECONDS } from "@/lib/auth/constants";
import { getPermissionsForAdminRole, type AdminPermissionSet } from "@/lib/auth/admin-permissions";
import { signAdminSessionToken, verifyAdminSessionToken } from "@/lib/auth/admin-jwt";

const DEFAULT_SUPER_ADMIN_EMAIL = "admin@local.com";
const DEFAULT_SUPER_ADMIN_PASSWORD = "admin@123";

type AdminRole = "SUPER_ADMIN" | "ADMIN";

export type AdminSessionUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  mustResetPassword: boolean;
  permissions: AdminPermissionSet;
};

function buildCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: ADMIN_AUTH_TOKEN_EXPIRY_SECONDS
  };
}

function normalizeAdminRole(value: string): AdminRole {
  return value === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN";
}

function toAdminSessionUser(admin: {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  mustResetPassword: boolean;
  permissions: unknown;
}): AdminSessionUser {
  const role = normalizeAdminRole(admin.role);
  const storedPermissions =
    admin.permissions && typeof admin.permissions === "object"
      ? (admin.permissions as Partial<AdminPermissionSet>)
      : null;

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role,
    isActive: admin.isActive,
    mustResetPassword: admin.mustResetPassword,
    permissions: getPermissionsForAdminRole(role, storedPermissions)
  };
}

export async function ensureDefaultSuperAdmin() {
  const email = (process.env.DEFAULT_ADMIN_EMAIL || DEFAULT_SUPER_ADMIN_EMAIL).toLowerCase();
  const password = process.env.DEFAULT_ADMIN_PASSWORD || DEFAULT_SUPER_ADMIN_PASSWORD;
  const name = process.env.DEFAULT_ADMIN_NAME || "Super Admin";

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== "SUPER_ADMIN" || !existing.isActive || existing.mustResetPassword) {
      await prisma.adminUser.update({
        where: { id: existing.id },
        data: {
          role: "SUPER_ADMIN",
          isActive: true,
          mustResetPassword: false
        }
      });
    }
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.create({
    data: {
      name,
      email,
      passwordHash,
      role: "SUPER_ADMIN",
      mustResetPassword: false
    }
  });
}

export function attachAdminSessionCookie(
  response: NextResponse,
  payload: {
    id: string;
    role: AdminRole;
  }
) {
  const token = signAdminSessionToken({
    sub: payload.id,
    role: payload.role
  });

  response.cookies.set(ADMIN_AUTH_COOKIE_NAME, token, buildCookieOptions());
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_AUTH_COOKIE_NAME, "", {
    ...buildCookieOptions(),
    maxAge: 0
  });
}

export async function getAdminAuthFromRequest(request: NextRequest): Promise<AdminSessionUser | null> {
  const token = request.cookies.get(ADMIN_AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const decoded = verifyAdminSessionToken(token);
  if (!decoded) return null;

  const admin = await prisma.adminUser.findUnique({
    where: { id: decoded.sub },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      mustResetPassword: true,
      permissions: true
    }
  });

  if (!admin) return null;
  return toAdminSessionUser(admin);
}

export async function getAdminAuthFromCookies(): Promise<AdminSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const decoded = verifyAdminSessionToken(token);
  if (!decoded) return null;

  const admin = await prisma.adminUser.findUnique({
    where: { id: decoded.sub },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      mustResetPassword: true,
      permissions: true
    }
  });

  if (!admin) return null;
  return toAdminSessionUser(admin);
}
