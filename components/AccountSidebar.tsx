"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/account/profile", label: "Profile" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/orders", label: "My Orders" },
  { href: "/wishlist", label: "Wishlist" }
];

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside className="card h-fit p-4">
      <p className="mb-3 font-heading text-lg text-stone-900">Account</p>
      <nav className="space-y-1">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
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
