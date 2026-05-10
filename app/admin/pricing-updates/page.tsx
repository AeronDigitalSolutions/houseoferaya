import { requireAdminPermission } from "@/lib/auth/admin-guard";
import PricingUpdatesPageClient from "@/components/admin/pricing/PricingUpdatesPageClient";

export default async function AdminPricingUpdatesPage() {
  await requireAdminPermission("canViewPricing");
  return <PricingUpdatesPageClient />;
}
