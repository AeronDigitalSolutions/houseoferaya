import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { attachAdminSessionCookie, ensureDefaultSuperAdmin } from "@/lib/auth/admin-session";

export async function POST(request: Request) {
  try {
    await ensureDefaultSuperAdmin();

    const { email, password } = (await request.json()) as { email?: string; password?: string };
    const normalizedEmail = (email || "").trim().toLowerCase();
    const normalizedPassword = (password || "").trim();

    if (!normalizedEmail || !normalizedPassword) {
      return NextResponse.json({ success: false, message: "Email and password are required." }, { status: 400 });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        role: true,
        isActive: true,
        mustResetPassword: true
      }
    });

    if (!admin || !admin.isActive) {
      return NextResponse.json({ success: false, message: "Invalid admin credentials." }, { status: 401 });
    }

    const validPassword = await bcrypt.compare(normalizedPassword, admin.passwordHash);
    if (!validPassword) {
      return NextResponse.json({ success: false, message: "Invalid admin credentials." }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      message: "Admin login successful.",
      redirectTo: admin.mustResetPassword ? "/admin/security" : "/admin"
    });

    attachAdminSessionCookie(response, request, {
      id: admin.id,
      role: admin.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN"
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unable to login." },
      { status: 500 }
    );
  }
}
