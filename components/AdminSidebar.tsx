"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { AdminPermissionKey, AdminPermissionSet } from "@/lib/auth/admin-permissions";
import { defaultAdminPermissions, superAdminPermissions } from "@/lib/auth/admin-permissions";

const links: Array<{ href: string; label: string; key?: AdminPermissionKey }> = [
  { href: "/admin", label: "Dashboard", key: "canViewDashboard" },
  { href: "/admin/products", label: "Products", key: "canViewProducts" },
  { href: "/admin/categories", label: "Categories", key: "canViewProducts" },
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const activeLink = useMemo(
    () => visibleLinks.find((link) => pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href))),
    [pathname, visibleLinks]
  );

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <aside className="card h-fit p-4">
      <p className="mb-3 font-heading text-lg text-stone-900">Admin Panel</p>

      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-left text-sm font-medium text-stone-900 transition hover:border-[#b99a6b]"
          aria-expanded={isMenuOpen}
          aria-controls="admin-nav-dropdown"
        >
          <span>{activeLink?.label ?? "Dashboard"}</span>
          <ChevronDown
            className={`h-4 w-4 text-stone-500 transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`}
          />
        </button>

        <nav
          id="admin-nav-dropdown"
          className={`overflow-hidden transition-all duration-200 ${
            isMenuOpen ? "mt-2 max-h-[420px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-1 rounded-xl border border-stone-200 bg-white p-2 shadow-[0_10px_24px_-16px_rgba(0,0,0,0.35)]">
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
          </div>
        </nav>
      </div>

      <nav className="hidden space-y-1 lg:block">
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
