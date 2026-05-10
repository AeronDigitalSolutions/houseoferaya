import { requireAdminPermission } from "@/lib/auth/admin-guard";
import { AdminAccessManager } from "@/components/admin/AdminAccessManager";

export default async function AdminAdminsPage() {
  await requireAdminPermission("canManageAdmins");
  return <AdminAccessManager />;
}
