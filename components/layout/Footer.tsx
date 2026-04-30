import { Instagram, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const policyLinks = [
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/refund-cancellation-policy", label: "Refund & Cancellation" },
  { href: "/shipping-delivery-policy", label: "Shipping & Delivery" }
];

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-black/10 px-5 pb-[max(5.5rem,env(safe-area-inset-bottom))] pt-14 sm:px-8 lg:px-12">
      <div className="mx-auto grid w-full max-w-7xl gap-10 md:grid-cols-4 md:items-end">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/assets/logo.jpeg"
              alt="House of Eraya logo"
              width={44}
              height={44}
              className="h-11 w-11 rounded-full border border-white/80 object-cover"
            />
            <h4 className="font-heading text-3xl text-royal-800">House of Eraya</h4>
          </div>
          <p className="mt-3 max-w-sm text-sm text-royal-700/70">
            Contemporary heirloom jewelry designed with restraint, precision, and soul.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 text-sm md:col-span-2">
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-royal-700/55">Explore</p>
            <ul className="space-y-2 text-royal-700/80">
              <li><Link href="/collections">Collections</Link></li>
              <li><Link href="/about-us">About Us</Link></li>
              <li><Link href="/contact-us">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-royal-700/55">Quick Links</p>
            <ul className="space-y-2 text-royal-700/80">
              {policyLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="cursor-pointer underline-offset-2 hover:underline">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-royal-700/55">Contact</p>
            <ul className="space-y-2 text-royal-700/80">
              <li>[Insert Support Email]</li>
              <li>[Insert Phone Number]</li>
              <li>Varanasi</li>
            </ul>
          </div>
        </div>

        <div className="md:justify-self-end">
          <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-royal-700/55">Social</p>
          <div className="flex items-center gap-2">
            <button className="rounded-full border border-black/15 bg-white/50 p-2.5"><Instagram size={15} /></button>
            <button className="rounded-full border border-black/15 bg-white/50 p-2.5"><Mail size={15} /></button>
          </div>
        </div>
      </div>
    </footer>
  );
}
