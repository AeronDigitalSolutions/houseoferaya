import { HomepageMediaManager } from "@/components/admin/homepage-media/HomepageMediaManager";
import { requireAdminPermission } from "@/lib/auth/admin-guard";

export default async function AdminHomepageMediaPage() {
  await requireAdminPermission("canManageHomepageMedia");
  return <HomepageMediaManager />;
}

