"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Diamond, Heart, ShoppingBag, Sparkles, UserRound } from "lucide-react";

const gold = "#9C7346";

const sideItems = [
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
    match: (pathname: string) => pathname.startsWith("/wishlist")
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

export function MobileBottomNav() {
  const pathname = usePathname();
  const inactiveClass = "text-[#4b4138] drop-shadow-[0_1px_1px_rgba(255,255,255,0.46)]";
  const activeClass = "text-[#9c7346] drop-shadow-[0_1px_2px_rgba(255,244,226,0.85)]";

  return (
    <>
      <div className="h-[112px] md:hidden" aria-hidden />

      <nav className="fixed inset-x-0 bottom-0 z-[70] px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] md:hidden" aria-label="Mobile navigation">
        <div className="relative mx-auto max-w-md rounded-t-[1.6rem] rounded-b-[1.3rem] border border-[#e8dece] bg-[#f8f3eb]/94 px-3 pb-2 pt-3 shadow-[0_-12px_28px_rgba(59,43,27,0.18)] backdrop-blur-2xl backdrop-saturate-125">
          <div className="pointer-events-none absolute inset-0 rounded-t-[1.6rem] rounded-b-[1.3rem] bg-gradient-to-b from-[#fff8ef]/75 to-[#f3eade]/66" />

          <Link
            href="/explore"
            aria-label="Explore"
            className="absolute -top-7 left-1/2 inline-flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border border-[#d9c0a1] bg-gradient-to-b from-[#fff3df] to-[#f3e0c4] shadow-[0_8px_24px_rgba(176,138,90,0.38)] transition duration-200 hover:scale-105 active:scale-95"
            style={{ color: gold }}
          >
            <Sparkles size={22} strokeWidth={2.2} />
            <span className="sr-only">Explore</span>
          </Link>

          <div className="relative grid grid-cols-5 items-end gap-1">
            {sideItems.slice(0, 2).map((item) => {
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

            <div className="flex flex-col items-center justify-end gap-1 pb-0.5">
              <span
                className={`text-[10px] font-semibold tracking-[0.1em] ${
                  pathname.startsWith("/explore") ? activeClass : inactiveClass
                }`}
              >
                Explore
              </span>
            </div>

            {sideItems.slice(2).map((item) => {
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
      </nav>
    </>
  );
}
