"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { AdminPermissionKey, AdminPermissionSet } from "@/lib/auth/admin-permissions";
import { defaultAdminPermissions, superAdminPermissions } from "@/lib/auth/admin-permissions";

const links: Array<{ href: string; label: string; key?: AdminPermissionKey }> = [
  { href: "/admin", label: "Dashboard", key: "canViewDashboard" },
  { href: "/admin/products", label: "Products", key: "canViewProducts" },
  { href: "/admin/orders", label: "Orders", key: "canViewOrders" },
  { href: "/admin/shipments", label: "Shipments", key: "canViewShipments" },
  { href: "/admin/payments", label: "Payments", key: "canViewPayments" },
  { href: "/admin/pricing-updates", label: "Pricing Updates", key: "canViewPricing" },
  { href: "/admin/homepage-media", label: "Homepage Media", key: "canManageHomepageMedia" },
  { href: "/admin/customers", label: "Customers", key: "canViewCustomers" },
  { href: "/admin/admins", label: "Admin Access", key: "canManageAdmins" },
  { href: "/admin/security", label: "Security" }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<"SUPER_ADMIN" | "ADMIN">("ADMIN");
  const [permissions, setPermissions] = useState<AdminPermissionSet>(defaultAdminPermissions);

  useEffect(() => {
    let isMounted = true;
    const loadAdmin = async () => {
      try {
        const response = await fetch("/api/admin/auth/me", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as {
          success: boolean;
          admin?: {
            role: "SUPER_ADMIN" | "ADMIN";
            permissions: AdminPermissionSet;
          };
        };
        if (!payload.admin || !isMounted) return;
        setRole(payload.admin.role);
        setPermissions(payload.admin.role === "SUPER_ADMIN" ? superAdminPermissions : payload.admin.permissions);
      } catch {
        if (!isMounted) return;
      }
    };
    void loadAdmin();
    return () => {
      isMounted = false;
    };
  }, []);

  const visibleLinks = useMemo(
    () =>
      links.filter((link) => {
        if (role === "SUPER_ADMIN") return true;
        if (!link.key) return true;
        return Boolean(permissions[link.key]);
      }),
    [permissions, role]
  );

  return (
    <aside className="card h-fit p-4">
      <p className="mb-3 font-heading text-lg text-stone-900">Admin Panel</p>
      <nav className="space-y-1">
        {visibleLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-lg px-3 py-2 text-sm transition ${
                isActive ? "bg-stone-900 text-white" : "text-stone-700 hover:bg-stone-100"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
