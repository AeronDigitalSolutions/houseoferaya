import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminAuthFromRequest } from "@/lib/auth/admin-session";

type RouteParams = {
  params: Promise<{
    adminId: string;
  }>;
};

export async function POST(request: import("next/server").NextRequest, context: RouteParams) {
  try {
    const requester = await getAdminAuthFromRequest(request);
    if (!requester || !requester.isActive) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }
    if (requester.role !== "SUPER_ADMIN" && !requester.permissions.canManageAdmins) {
      return NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 });
    }

    const { adminId } = await context.params;
    const { newPassword } = (await request.json()) as { newPassword?: string };

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const target = await prisma.adminUser.findUnique({
      where: { id: adminId },
      select: { id: true, role: true }
    });
    if (!target) {
      return NextResponse.json({ success: false, message: "Admin not found." }, { status: 404 });
    }
    if (target.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, message: "Super Admin password should be reset by Super Admin account only." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.adminUser.update({
      where: { id: adminId },
      data: {
        passwordHash,
        mustResetPassword: true
      }
    });

    return NextResponse.json({ success: true, message: "Admin password reset successfully." });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to reset password." },
      { status: 500 }
    );
  }
}
