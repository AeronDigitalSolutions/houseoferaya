import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminAuthFromRequest } from "@/lib/auth/admin-session";
import { sanitizeAdminPermissions, superAdminPermissions } from "@/lib/auth/admin-permissions";

export async function GET(request: import("next/server").NextRequest) {
  try {
    const admin = await getAdminAuthFromRequest(request);
    if (!admin || !admin.isActive) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }
    if (admin.role !== "SUPER_ADMIN" && !admin.permissions.canManageAdmins) {
      return NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 });
    }

    const users = await prisma.adminUser.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        mustResetPassword: true,
        permissions: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      users: users.map((item) => ({
        ...item,
        permissions:
          item.role === "SUPER_ADMIN"
            ? superAdminPermissions
            : sanitizeAdminPermissions(item.permissions as Record<string, boolean> | null)
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to fetch admins." },
      { status: 500 }
    );
  }
}

export async function POST(request: import("next/server").NextRequest) {
  try {
    const requester = await getAdminAuthFromRequest(request);
    if (!requester || !requester.isActive) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }
    if (requester.role !== "SUPER_ADMIN" && !requester.permissions.canManageAdmins) {
      return NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 });
    }

    const { name, email, password, permissions } = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      permissions?: Record<string, boolean>;
    };

    const normalizedName = (name || "").trim();
    const normalizedEmail = (email || "").trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password) {
      return NextResponse.json({ success: false, message: "Name, email, and password are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ success: false, message: "Password must be at least 8 characters." }, { status: 400 });
    }

    const existing = await prisma.adminUser.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ success: false, message: "Admin already exists with this email." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const cleanPermissions = sanitizeAdminPermissions(permissions);

    const created = await prisma.adminUser.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        passwordHash,
        role: "ADMIN",
        permissions: cleanPermissions,
        mustResetPassword: true,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        mustResetPassword: true,
        permissions: true,
        createdAt: true
      }
    });

    return NextResponse.json(
      { success: true, message: "Admin created successfully.", admin: created },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to create admin." },
      { status: 500 }
    );
  }
}
