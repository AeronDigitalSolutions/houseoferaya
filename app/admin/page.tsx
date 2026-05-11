import Link from "next/link";
import { Boxes, ClipboardList, GalleryVerticalEnd, Images, IndianRupee, PackageSearch, ShieldCheck, Truck, Users, Wallet } from "lucide-react";
import { requireAdminPermission } from "@/lib/auth/admin-guard";

const quickLinks = [
  { href: "/admin/products", label: "Products", Icon: Boxes, key: "canViewProducts" as const },
  { href: "/admin/categories", label: "Categories", Icon: GalleryVerticalEnd, key: "canViewProducts" as const },
  { href: "/admin/orders", label: "Orders", Icon: ClipboardList, key: "canViewOrders" as const },
  { href: "/admin/shipments", label: "Shipments", Icon: Truck, key: "canViewShipments" as const },
  { href: "/admin/payments", label: "Payments", Icon: Wallet, key: "canViewPayments" as const },
  { href: "/admin/pricing-updates", label: "Pricing Updates", Icon: IndianRupee, key: "canViewPricing" as const },
  { href: "/admin/homepage-media", label: "Homepage Media", Icon: Images, key: "canManageHomepageMedia" as const },
  { href: "/admin/customers", label: "Customers", Icon: Users, key: "canViewCustomers" as const },
  { href: "/admin/admins", label: "Admin Access", Icon: ShieldCheck, key: "canManageAdmins" as const }
];

export default async function AdminDashboardPage() {
  const admin = await requireAdminPermission("canViewDashboard");
  const visibleQuickLinks = quickLinks.filter((link) => admin.role === "SUPER_ADMIN" || admin.permissions[link.key]);

  return (
    <div className="space-y-5">
      <h2 className="font-heading text-3xl sm:text-4xl text-stone-900">Dashboard</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["Total Orders", "Pending Shipments", "Revenue", "Active Customers"].map((metric) => (
          <div key={metric} className="card p-4">
            <p className="text-sm text-stone-600">{metric}</p>
            <p className="mt-2 font-heading text-2xl text-stone-900">--</p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <PackageSearch size={18} className="text-stone-700" />
          <h3 className="font-heading text-2xl text-stone-900">Quick Links</h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visibleQuickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="card flex items-center justify-between p-4 transition hover:border-stone-300 hover:bg-stone-50"
            >
              <p className="text-sm font-medium text-stone-800">{link.label}</p>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700">
                <link.Icon size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
