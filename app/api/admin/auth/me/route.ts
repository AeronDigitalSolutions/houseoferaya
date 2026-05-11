import { NextResponse } from "next/server";
import { getAdminAuthFromRequest } from "@/lib/auth/admin-session";

export async function GET(request: import("next/server").NextRequest) {
  try {
    const admin = await getAdminAuthFromRequest(request);
    if (!admin || !admin.isActive) {
      return NextResponse.json({ success: false, admin: null }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        mustResetPassword: admin.mustResetPassword,
        permissions: admin.permissions
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unable to fetch admin session." },
      { status: 500 }
    );
  }
}
