import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminAuthFromRequest } from "@/lib/auth/admin-session";

export async function POST(request: import("next/server").NextRequest) {
  try {
    const admin = await getAdminAuthFromRequest(request);
    if (!admin || !admin.isActive) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const { currentPassword, newPassword } = (await request.json()) as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Current password and new password are required." },
        { status: 400 }
      );
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const existing = await prisma.adminUser.findUnique({
      where: { id: admin.id },
      select: { passwordHash: true }
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: "Admin not found." }, { status: 404 });
    }

    const matches = await bcrypt.compare(currentPassword, existing.passwordHash);
    if (!matches) {
      return NextResponse.json({ success: false, message: "Current password is incorrect." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        passwordHash,
        mustResetPassword: false
      }
    });

    return NextResponse.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unable to reset password." },
      { status: 500 }
    );
  }
}
