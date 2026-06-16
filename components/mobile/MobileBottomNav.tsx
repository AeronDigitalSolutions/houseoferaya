"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Crown, Diamond, Heart, IndianRupee, LayoutDashboard, ShoppingBag, UserRound, Users } from "lucide-react";
import { useEffect, useState } from "react";

const storeSideItems = [
  {
    label: "Curate",
    href: "/curate",
    icon: Diamond,
    match: (pathname: string) => pathname === "/curate"
  },
  {
    label: "Wishlist",
    href: "/wishlist",
    icon: Heart,
    match: (pathname: string) => pathname.startsWith("/wishlist") || pathname.startsWith("/account/wishlist")
  },
  {
    label: "Cart",
    href: "/cart",
    icon: ShoppingBag,
    match: (pathname: string) => pathname.startsWith("/cart")
  },
  {
    label: "Profile",
    href: "/profile",
    icon: UserRound,
    match: (pathname: string) => pathname.startsWith("/profile") || pathname.startsWith("/account/profile")
  }
] as const;

const adminItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    match: (pathname: string) => pathname === "/admin"
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: Diamond,
    match: (pathname: string) => pathname.startsWith("/admin/products")
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ClipboardList,
    match: (pathname: string) => pathname.startsWith("/admin/orders")
  },
  {
    label: "Rates",
    href: "/admin/pricing-updates",
    icon: IndianRupee,
    match: (pathname: string) => pathname.startsWith("/admin/pricing-updates")
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: Users,
    match: (pathname: string) => pathname.startsWith("/admin/customers")
  }
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<"ADMIN" | "CUSTOMER" | null>(null);
  const [isAdminSessionActive, setIsAdminSessionActive] = useState(false);
  const hideOnAuthPages = pathname === "/login" || pathname === "/signup";
  const isAdminRoute = pathname.startsWith("/admin");
  const isSignatureTheme = pathname.startsWith("/signature-pieces");

  useEffect(() => {
    let isMounted = true;

    const loadAuthState = async () => {
      try {
        if (isAdminRoute) {
          const adminResponse = await fetch("/api/admin/auth/me", { cache: "no-store" });
          if (!isMounted) return;
          setIsAdminSessionActive(adminResponse.ok);
          return;
        }

        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (!response.ok) {
          if (isMounted) setUserRole(null);
          return;
        }
        const payload = (await response.json()) as { user?: { role?: "ADMIN" | "CUSTOMER" } };
        if (!isMounted) return;
        setUserRole(payload.user?.role || null);
      } catch {
        if (!isMounted) return;
        if (isAdminRoute) {
          setIsAdminSessionActive(false);
          return;
        }
        setUserRole(null);
      }
    };

    void loadAuthState();
    return () => {
      isMounted = false;
    };
  }, [isAdminRoute]);

  if (hideOnAuthPages) {
    return null;
  }

  if (isAdminRoute && !isAdminSessionActive) {
    return null;
  }

  const showAdminBar = isAdminRoute && isAdminSessionActive;
  const inactiveClass = isSignatureTheme
    ? "text-[#d8c7a3] drop-shadow-[0_1px_1px_rgba(7,11,34,0.5)]"
    : "text-[#4b4138] drop-shadow-[0_1px_1px_rgba(255,255,255,0.46)]";
  const activeClass = isSignatureTheme
    ? "text-[#f3e5c6] drop-shadow-[0_1px_2px_rgba(7,11,34,0.6)]"
    : "text-[#9c7346] drop-shadow-[0_1px_2px_rgba(255,244,226,0.85)]";
  const adminInactiveClass = "text-[#6f6458]";
  const adminActiveClass = "text-[#12100e]";
  const mobileExploreHref = "/signature-pieces";
  const mobileExploreLabel = "Explore Signature";

  return (
    <>
      <div className={`md:hidden ${showAdminBar ? "h-[92px]" : "h-[112px]"}`} aria-hidden />

      <nav className="fixed inset-x-0 bottom-0 z-[70] px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] md:hidden" aria-label={showAdminBar ? "Admin mobile navigation" : "Mobile navigation"}>
        {showAdminBar ? (
          <div className="relative mx-auto max-w-md rounded-t-[1.2rem] rounded-b-[1.1rem] border border-[#decfb8] bg-[#f8f2e8]/95 px-3 py-2 shadow-[0_-10px_24px_rgba(56,43,31,0.18)] backdrop-blur-xl">
            <div className="grid grid-cols-5 items-end gap-1">
              {adminItems.map((item) => {
                const isActive = item.match(pathname);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-label={item.label}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex min-h-[56px] flex-col items-center justify-end gap-1 rounded-xl py-1 transition duration-200 active:scale-95 ${
                      isActive ? adminActiveClass : adminInactiveClass
                    }`}
                  >
                    <Icon size={18} strokeWidth={2} />
                    <span className="text-[10px] font-semibold tracking-[0.05em]">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : (
          <div
            className={`relative mx-auto max-w-md rounded-t-[1.6rem] rounded-b-[1.3rem] px-3 pb-2 pt-3 backdrop-blur-2xl backdrop-saturate-125 ${
              isSignatureTheme
                ? "border border-[#31457f] bg-[#0f1e4b]/94 shadow-[0_-12px_28px_rgba(3,8,24,0.38)]"
                : "border border-[#e8dece] bg-[#f8f3eb]/94 shadow-[0_-12px_28px_rgba(59,43,27,0.18)]"
            }`}
          >
            <div
              className={`pointer-events-none absolute inset-0 rounded-t-[1.6rem] rounded-b-[1.3rem] ${
                isSignatureTheme
                  ? "bg-gradient-to-b from-[#182b66]/82 to-[#0d183e]/76"
                  : "bg-gradient-to-b from-[#fff8ef]/75 to-[#f3eade]/66"
              }`}
            />

            <Link
              href={mobileExploreHref}
              aria-label={mobileExploreLabel}
              className="absolute -top-7 left-1/2 inline-flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border border-[#5470bf] bg-gradient-to-b from-[#25479d] to-[#122b7a] text-[#f3d38a] shadow-[0_10px_28px_rgba(4,12,38,0.45)] transition duration-200 hover:scale-105 active:scale-95"
            >
              <Crown size={22} strokeWidth={2.2} />
              <span className="sr-only">{mobileExploreLabel}</span>
            </Link>

            <div className="relative grid grid-cols-5 items-end gap-1">
              {storeSideItems.slice(0, 2).map((item) => {
                const isActive = item.match(pathname);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-label={item.label}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex min-h-[56px] flex-col items-center justify-end gap-1 rounded-xl py-1 transition duration-200 active:scale-95 ${
                      isActive ? activeClass : inactiveClass
                    }`}
                  >
                    <Icon size={19} strokeWidth={2} />
                    <span className="text-[10px] font-semibold tracking-[0.08em]">{item.label}</span>
                  </Link>
                );
              })}

              <div className="flex min-h-[56px] flex-col items-center justify-end gap-1 rounded-xl py-1">
                <span
                  className={`flex w-[92px] flex-col items-center justify-center text-center text-[10px] font-semibold tracking-[0.1em] leading-[1.05] ${
                    pathname.startsWith("/signature-pieces") ? activeClass : inactiveClass
                  }`}
                >
                  <span>Explore</span>
                  <span>Signature</span>
                </span>
              </div>

              {storeSideItems.slice(2).map((item) => {
                const isActive = item.match(pathname);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-label={item.label}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex min-h-[56px] flex-col items-center justify-end gap-1 rounded-xl py-1 transition duration-200 active:scale-95 ${
                      isActive ? activeClass : inactiveClass
                    }`}
                  >
                    <Icon size={19} strokeWidth={2} />
                    <span className="text-[10px] font-semibold tracking-[0.08em]">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
