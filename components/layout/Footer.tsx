"use client";

import {
  Gem,
  Instagram,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Truck
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const exploreLinks = [
  { href: "/collections", label: "Collections" },
  { href: "/collections/rings", label: "Rings" },
  { href: "/collections/necklaces", label: "Necklaces" },
  { href: "/collections/earrings", label: "Earrings" },
  { href: "/wishlist", label: "Wishlist" }
];

const customerCareLinks = [
  { href: "/contact-us", label: "Contact Us" },
  { href: "/track-order", label: "Track Order" },
  { href: "/shipping-delivery-policy", label: "Shipping Information" },
  { href: "/refund-cancellation-policy", label: "Returns & Refunds" }
];

const accountLinks = [
  { href: "/account/profile", label: "Profile" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/orders", label: "My Orders" },
  { href: "/cart", label: "Cart" },
  { href: "/admin-auth/login", label: "Admin Login" }
];

const policyLinks = [
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/refund-cancellation-policy", label: "Refund & Cancellation" },
  { href: "/shipping-delivery-policy", label: "Shipping & Delivery" }
];

const trustPoints = [
  {
    title: "Certified Jewelry",
    subtitle: "Hallmarked & quality checked",
    icon: ShieldCheck
  },
  {
    title: "Insured Shipping",
    subtitle: "Secure doorstep delivery",
    icon: Truck
  },
  {
    title: "Premium Craft",
    subtitle: "Designed for daily elegance",
    icon: Gem
  }
];

export function Footer() {
  const pathname = usePathname();
  const isSignatureTheme = pathname.startsWith("/signature-pieces");

  return (
    <footer
      className={`relative z-10 mt-12 px-5 pb-[max(6rem,env(safe-area-inset-bottom))] pt-10 sm:mt-14 sm:px-8 sm:pt-12 lg:px-12 ${
        isSignatureTheme
          ? "border-t border-[#1e2d57] bg-[linear-gradient(180deg,#08112a_0%,#091633_100%)]"
          : "border-t border-black/10 bg-gradient-to-b from-[#f7f3ee] to-[#f3ede4]"
      }`}
    >
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <section
          className={`grid gap-3 rounded-3xl p-4 sm:grid-cols-3 sm:gap-4 sm:p-5 ${
            isSignatureTheme
              ? "border border-[#22335f] bg-[#0d1838]/92 shadow-[0_24px_60px_rgba(0,0,0,0.34)]"
              : "border border-black/10 bg-white/60 shadow-luxe"
          }`}
        >
          {trustPoints.map((point) => {
            const Icon = point.icon;
            return (
              <article
                key={point.title}
                className={`flex items-center gap-3 rounded-2xl p-3 ${
                  isSignatureTheme ? "bg-[#11204a]" : "bg-white/70"
                }`}
              >
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${
                    isSignatureTheme
                      ? "border border-[#8d7450]/40 bg-[#0c1737] text-[#d2be99]"
                      : "border border-[#9c7346]/30 bg-[#f7ecdc] text-[#8f6841]"
                  }`}
                >
                  <Icon size={16} />
                </span>
                <div>
                  <p className={`text-sm font-medium ${isSignatureTheme ? "text-[#f3ebdf]" : "text-royal-800"}`}>{point.title}</p>
                  <p className={`text-xs ${isSignatureTheme ? "text-[#a7b1ca]" : "text-royal-700/65"}`}>{point.subtitle}</p>
                </div>
              </article>
            );
          })}
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.3fr_2fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/assets/logo.jpeg"
                alt="House of Eraya logo"
                width={48}
                height={48}
                className={`h-12 w-12 rounded-full object-cover ${
                  isSignatureTheme ? "border border-[#8d7450]/45" : "border border-white/80"
                }`}
              />
              <div>
                <h4 className={`font-heading text-3xl ${isSignatureTheme ? "text-[#f2ecdf]" : "text-royal-800"}`}>House of Eraya</h4>
                <p className={`text-xs uppercase tracking-[0.18em] ${isSignatureTheme ? "text-[#d0bc96]" : "text-royal-700/60"}`}>
                  Fine Jewelry Maison
                </p>
              </div>
            </div>

            <p className={`max-w-md text-sm leading-7 ${isSignatureTheme ? "text-[#bbc4da]" : "text-royal-700/80"}`}>
              Contemporary heirloom jewelry designed with precision, restraint, and timeless elegance for modern wardrobes.
            </p>

            <div className={`space-y-2 text-sm ${isSignatureTheme ? "text-[#bbc4da]" : "text-royal-700/80"}`}>
              <p className="inline-flex items-start gap-2">
                <MapPin size={15} className={`mt-0.5 ${isSignatureTheme ? "text-[#d2be99]" : "text-[#8f6841]"}`} />
                Plot no-252, Varanasi Enclave Colony, P.O.- Bhullanpur, Marhauli, Varanasi (U.P) 221108
              </p>
              <p className="inline-flex items-center gap-2">
                <Mail size={15} className={isSignatureTheme ? "text-[#d2be99]" : "text-[#8f6841]"} />
                official.houseoferayya@gmail.com
              </p>
              <p className="inline-flex items-center gap-2">
                <Phone size={15} className={isSignatureTheme ? "text-[#d2be99]" : "text-[#8f6841]"} />
                +91-7889072256
              </p>
              <p className={`text-xs uppercase tracking-[0.14em] ${isSignatureTheme ? "text-[#8f9ab8]" : "text-royal-700/60"}`}>
                Support Hours: Mon - Sat, 10:00 AM to 7:00 PM
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 text-sm sm:grid-cols-4">
            <div>
              <p className={`mb-3 text-[10px] uppercase tracking-[0.24em] ${isSignatureTheme ? "text-[#d0bc96]" : "text-royal-700/55"}`}>Explore</p>
              <ul className={`space-y-2 ${isSignatureTheme ? "text-[#dfe4f1]" : "text-royal-700/82"}`}>
                {exploreLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={`transition hover:underline ${isSignatureTheme ? "hover:text-[#f3ebde]" : "hover:text-royal-800"}`}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className={`mb-3 text-[10px] uppercase tracking-[0.24em] ${isSignatureTheme ? "text-[#d0bc96]" : "text-royal-700/55"}`}>Customer Care</p>
              <ul className={`space-y-2 ${isSignatureTheme ? "text-[#dfe4f1]" : "text-royal-700/82"}`}>
                {customerCareLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={`transition hover:underline ${isSignatureTheme ? "hover:text-[#f3ebde]" : "hover:text-royal-800"}`}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className={`mb-3 text-[10px] uppercase tracking-[0.24em] ${isSignatureTheme ? "text-[#d0bc96]" : "text-royal-700/55"}`}>My Account</p>
              <ul className={`space-y-2 ${isSignatureTheme ? "text-[#dfe4f1]" : "text-royal-700/82"}`}>
                {accountLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={`transition hover:underline ${isSignatureTheme ? "hover:text-[#f3ebde]" : "hover:text-royal-800"}`}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className={`mb-3 text-[10px] uppercase tracking-[0.24em] ${isSignatureTheme ? "text-[#d0bc96]" : "text-royal-700/55"}`}>Policies</p>
              <ul className={`space-y-2 ${isSignatureTheme ? "text-[#dfe4f1]" : "text-royal-700/82"}`}>
                {policyLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={`transition hover:underline ${isSignatureTheme ? "hover:text-[#f3ebde]" : "hover:text-royal-800"}`}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section
          className={`flex flex-col gap-3 border-t pt-5 text-xs sm:flex-row sm:items-center sm:justify-between ${
            isSignatureTheme ? "border-[#1e2d57] text-[#8f9ab8]" : "border-black/10 text-royal-700/65"
          }`}
        >
          <p>© {new Date().getFullYear()} House of Eraya. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition ${
                isSignatureTheme
                  ? "border border-[#2a3964] bg-[#0f1e46] text-[#d6c09a] hover:bg-[#14275b]"
                  : "border border-black/15 bg-white/65 text-royal-700 hover:bg-white"
              }`}
            >
              <Instagram size={14} />
            </a>
            <a
              href="mailto:official.houseoferayya@gmail.com"
              aria-label="Email"
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition ${
                isSignatureTheme
                  ? "border border-[#2a3964] bg-[#0f1e46] text-[#d6c09a] hover:bg-[#14275b]"
                  : "border border-black/15 bg-white/65 text-royal-700 hover:bg-white"
              }`}
            >
              <Mail size={14} />
            </a>
          </div>
        </section>
      </div>
    </footer>
  );
}
