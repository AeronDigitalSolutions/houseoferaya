"use client";

import { Crown, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const mainLinks = [
  { href: "/", label: "Home" },
  { href: "/collections", label: "Collections" },
  { href: "/about-us", label: "About Us" },
  { href: "/contact-us", label: "Contact Us" }
];

type NavbarProps = {
  visible?: boolean;
};

export function Navbar({ visible = true }: NavbarProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isSignatureTheme = useMemo(() => pathname.startsWith("/signature-pieces"), [pathname]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!visible) {
      setIsOpen(false);
    }
  }, [visible]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    let isMounted = true;

    const loadAuthState = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (!isMounted) return;
        setIsAuthenticated(response.ok);
      } catch {
        if (!isMounted) return;
        setIsAuthenticated(false);
      }
    };

    void loadAuthState();
    return () => {
      isMounted = false;
    };
  }, []);

  const signatureCtaClassName = isSignatureTheme
    ? "border border-[#dcc28d]/80 bg-[#e5cd9c] text-[#122b7a] shadow-[0_10px_28px_rgba(7,13,36,0.25)] hover:bg-[#edd9ad]"
    : "border border-[#17398f]/20 bg-[#17398f] text-[#f5ead7] shadow-[0_10px_24px_rgba(23,57,143,0.22)] hover:bg-[#20459f]";

  return (
    <motion.header
      initial={false}
      animate={{
        opacity: visible ? 1 : 0,
        y: visible ? 0 : -22
      }}
      transition={{ duration: 0.38, ease: "easeOut" }}
      style={{ pointerEvents: visible ? "auto" : "none" }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4"
    >
      <motion.div
        initial={false}
        animate={{
          backgroundColor: isSignatureTheme
            ? isScrolled
              ? "rgba(11,24,66,0.98)"
              : "rgba(13,28,76,0.94)"
            : isScrolled
              ? "rgba(247,243,238,0.94)"
              : "rgba(247,243,238,0.72)",
          borderColor: isSignatureTheme
            ? isScrolled
              ? "rgba(133,114,79,0.38)"
              : "rgba(133,114,79,0.28)"
            : isScrolled
              ? "rgba(38,36,33,0.12)"
              : "rgba(255,255,255,0.42)",
          boxShadow: isSignatureTheme
            ? isScrolled
              ? "0 14px 34px rgba(1,6,22,0.48)"
              : "0 8px 24px rgba(1,6,22,0.34)"
            : isScrolled
              ? "0 10px 30px rgba(36,34,31,0.12)"
              : "0 6px 22px rgba(36,34,31,0.06)"
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between rounded-2xl border px-4 backdrop-blur-xl sm:h-[74px] sm:px-6"
      >
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <Image
            src="/assets/logo.jpeg"
            alt="House of Eraya logo"
            width={40}
            height={40}
            className={`h-9 w-9 rounded-full object-cover sm:h-10 sm:w-10 ${
              isSignatureTheme ? "border border-[#89724e]/60" : "border border-white/80"
            }`}
            priority
          />
          <span
            className={`truncate font-heading text-xl leading-none tracking-[0.02em] sm:text-2xl ${
              isSignatureTheme ? "text-[#efe7da]" : "text-royal-800"
            }`}
          >
            Eraya
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {mainLinks.map((item, index) => (
            <div key={item.href} className="contents">
              <Link
                href={item.href}
                className={`text-xs uppercase tracking-[0.16em] transition ${
                  isSignatureTheme
                    ? "font-medium text-[#e7d5ae] hover:text-[#fff7ea]"
                    : "text-royal-700/75 hover:text-royal-800"
                }`}
              >
                {item.label}
              </Link>
              {index === 1 ? (
                <Link
                  href="/signature-pieces"
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition ${signatureCtaClassName}`}
                >
                  <Crown size={14} />
                  Explore Signature
                </Link>
              ) : null}
            </div>
          ))}

        </nav>

        <div className={`flex items-center gap-1.5 sm:gap-2 ${isSignatureTheme ? "text-[#e5d1ab]" : "text-royal-700/85"}`}>
          <button
            className={`hidden rounded-full p-2.5 transition md:inline-flex ${
              isSignatureTheme ? "hover:bg-[#0f224f]" : "hover:bg-white/70"
            }`}
            aria-label="Search"
          >
            <Search size={16} />
          </button>
          <Link
            href="/cart"
            className={`rounded-full p-2.5 transition ${isSignatureTheme ? "hover:bg-[#0f224f]" : "hover:bg-white/70"}`}
            aria-label="Bag"
          >
            <ShoppingBag size={16} />
          </Link>
          <Link
            href={isAuthenticated ? "/account/profile" : "/login"}
            className={`rounded-full p-2.5 transition ${isSignatureTheme ? "hover:bg-[#0f224f]" : "hover:bg-white/70"}`}
            aria-label={isAuthenticated ? "My Profile" : "Login or Signup"}
          >
            <UserRound size={16} />
          </Link>
          <button
            className={`rounded-full p-2.5 transition md:hidden ${isSignatureTheme ? "hover:bg-[#0f224f]" : "hover:bg-white/70"}`}
            onClick={() => setIsOpen((v) => !v)}
          >
            {isOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            key="mobile-nav"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.24 }}
            className={`mx-auto mt-2 w-full max-w-7xl rounded-2xl p-4 backdrop-blur-xl md:hidden ${
              isSignatureTheme
                ? "border border-[#6b5940]/55 bg-[#081331]/98 shadow-[0_18px_40px_rgba(0,0,0,0.46)]"
                : "border border-black/10 bg-[#f7f3ee]/98 shadow-soft"
            }`}
          >
            <nav className="max-h-[72vh] space-y-2 overflow-y-auto">
              {mainLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-xs uppercase tracking-[0.2em] ${
                    isSignatureTheme
                      ? "border border-[#263761] bg-[#0f224f] text-[#efe6d8]"
                      : "border border-black/10 bg-white/55 text-royal-800"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <Link
                href="/signature-pieces"
                onClick={() => setIsOpen(false)}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition ${signatureCtaClassName}`}
              >
                <Crown size={14} />
                Explore Signature
              </Link>

            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
