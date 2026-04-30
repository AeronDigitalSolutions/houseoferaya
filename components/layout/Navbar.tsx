"use client";

import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const mainLinks = [
  { href: "/", label: "Home" },
  { href: "/collections", label: "Collections" },
  { href: "/about-us", label: "About Us" },
  { href: "/contact-us", label: "Contact Us" }
];

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/collections", label: "Collections" },
  { href: "/collections/rings", label: "Collection Detail (Example)" },
  { href: "/products/celeste-diamond-ring", label: "Product Detail (Example)" },
  { href: "/cart", label: "Cart" },
  { href: "/checkout", label: "Checkout" },
  { href: "/order-confirmation/ord_1001", label: "Order Confirmation (Example)" },
  { href: "/track-order", label: "Track Order" },
  { href: "/track-order/ord_1001", label: "Track Order Detail (Example)" },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/orders", label: "My Orders" },
  { href: "/account/orders/ord_1001", label: "Order Detail (Example)" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Signup" },
  { href: "/about-us", label: "About Us" },
  { href: "/contact-us", label: "Contact Us" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/refund-cancellation-policy", label: "Refund & Cancellation" },
  { href: "/shipping-delivery-policy", label: "Shipping & Delivery" },
  { href: "/admin", label: "Admin Dashboard" },
  { href: "/admin/products", label: "Admin Products" },
  { href: "/admin/orders", label: "Admin Orders" },
  { href: "/admin/shipments", label: "Admin Shipments" },
  { href: "/admin/payments", label: "Admin Payments" },
  { href: "/admin/customers", label: "Admin Customers" }
];

type NavbarProps = {
  visible?: boolean;
};

export function Navbar({ visible = true }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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
          backgroundColor: isScrolled ? "rgba(247,243,238,0.94)" : "rgba(247,243,238,0.72)",
          borderColor: isScrolled ? "rgba(38,36,33,0.12)" : "rgba(255,255,255,0.42)",
          boxShadow: isScrolled ? "0 10px 30px rgba(36,34,31,0.12)" : "0 6px 22px rgba(36,34,31,0.06)"
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
            className="h-9 w-9 rounded-full border border-white/80 object-cover sm:h-10 sm:w-10"
            priority
          />
          <span className="truncate font-heading text-xl leading-none tracking-[0.02em] text-royal-800 sm:text-2xl">Eraya</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {mainLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs uppercase tracking-[0.16em] text-royal-700/75 transition hover:text-royal-800"
            >
              {item.label}
            </Link>
          ))}

          <details className="group relative">
            <summary className="cursor-pointer list-none text-xs uppercase tracking-[0.16em] text-royal-700/75 transition hover:text-royal-800">
              Quick Links
            </summary>
            <div className="absolute right-0 top-7 z-50 w-[min(92vw,420px)] rounded-xl border border-black/10 bg-[#f7f3ee] p-3 shadow-soft">
              <div className="grid max-h-80 grid-cols-2 gap-1 overflow-auto">
                {quickLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-lg px-2 py-1.5 text-[11px] tracking-[0.06em] text-royal-700 transition hover:bg-white/70 hover:text-royal-800"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </details>
        </nav>

        <div className="flex items-center gap-1.5 text-royal-700/85 sm:gap-2">
          <button className="hidden rounded-full p-2.5 transition hover:bg-white/70 md:inline-flex" aria-label="Search">
            <Search size={16} />
          </button>
          <button className="rounded-full p-2.5 transition hover:bg-white/70" aria-label="Bag">
            <ShoppingBag size={16} />
          </button>
          <button className="rounded-full p-2.5 transition hover:bg-white/70 md:hidden" onClick={() => setIsOpen((v) => !v)}>
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
            className="mx-auto mt-2 w-full max-w-7xl rounded-2xl border border-black/10 bg-[#f7f3ee]/98 p-4 shadow-soft backdrop-blur-xl md:hidden"
          >
            <nav className="max-h-[72vh] space-y-2 overflow-y-auto">
              {mainLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-xl border border-black/10 bg-white/55 px-4 py-3 text-xs uppercase tracking-[0.2em] text-royal-800"
                >
                  {item.label}
                </Link>
              ))}

              <div className="rounded-xl border border-black/10 bg-white/55 p-3">
                <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-royal-800">Quick Links</p>
                <div className="grid max-h-52 grid-cols-1 gap-1 overflow-auto">
                  {quickLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="rounded-lg px-2 py-1.5 text-[11px] tracking-[0.06em] text-royal-800 hover:bg-white/75"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}

