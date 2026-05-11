import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminAuthFromRequest } from "@/lib/auth/admin-session";
import { sanitizeAdminPermissions, superAdminPermissions } from "@/lib/auth/admin-permissions";

type RouteParams = {
  params: Promise<{
    adminId: string;
  }>;
};

export async function PATCH(request: import("next/server").NextRequest, context: RouteParams) {
  try {
    const requester = await getAdminAuthFromRequest(request);
    if (!requester || !requester.isActive) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }
    if (requester.role !== "SUPER_ADMIN" && !requester.permissions.canManageAdmins) {
      return NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 });
    }

    const { adminId } = await context.params;
    const { permissions, isActive } = (await request.json()) as {
      permissions?: Record<string, boolean>;
      isActive?: boolean;
    };

    const target = await prisma.adminUser.findUnique({
      where: { id: adminId },
      select: { id: true, role: true }
    });
    if (!target) {
      return NextResponse.json({ success: false, message: "Admin not found." }, { status: 404 });
    }
    if (target.role === "SUPER_ADMIN") {
      return NextResponse.json({ success: false, message: "Cannot modify Super Admin permissions." }, { status: 400 });
    }

    const updated = await prisma.adminUser.update({
      where: { id: adminId },
      data: {
        permissions: permissions ? sanitizeAdminPermissions(permissions) : undefined,
        isActive: typeof isActive === "boolean" ? isActive : undefined
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

    return NextResponse.json({
      success: true,
      message: "Admin permissions updated.",
      admin: {
        ...updated,
        permissions:
          updated.role === "SUPER_ADMIN"
            ? superAdminPermissions
            : sanitizeAdminPermissions(updated.permissions as Record<string, boolean> | null)
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to update admin permissions." },
      { status: 500 }
    );
  }
}
