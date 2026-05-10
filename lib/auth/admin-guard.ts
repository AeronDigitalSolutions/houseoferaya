import { redirect } from "next/navigation";
import { getAdminAuthFromCookies } from "@/lib/auth/admin-session";
import type { AdminPermissionKey } from "@/lib/auth/admin-permissions";

export async function requireAdminAuth() {
  const admin = await getAdminAuthFromCookies();
  if (!admin || !admin.isActive) {
    redirect("/admin-auth/login");
  }
  return admin;
}

export async function requireAdminPermission(permission: AdminPermissionKey) {
  const admin = await requireAdminAuth();
  if (admin.role === "SUPER_ADMIN") {
    return admin;
  }
  if (!admin.permissions[permission]) {
    if (permission === "canViewDashboard") {
      redirect("/admin-auth/login");
    }
    redirect("/admin");
  }
  return admin;
}
