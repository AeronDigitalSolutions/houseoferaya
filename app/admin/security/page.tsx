import { requireAdminAuth } from "@/lib/auth/admin-guard";
import { AdminPasswordResetPanel } from "@/components/admin/AdminPasswordResetPanel";

export default async function AdminSecurityPage() {
  await requireAdminAuth();
  return <AdminPasswordResetPanel />;
}
