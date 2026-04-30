"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/shipments", label: "Shipments" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/customers", label: "Customers" }
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="card h-fit p-4">
      <p className="mb-3 font-heading text-lg text-stone-900">Admin Panel</p>
      <nav className="space-y-1">
        {links.map((link) => {
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
