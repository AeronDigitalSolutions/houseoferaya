import Link from "next/link";

const legalLinks = [
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/refund-cancellation-policy", label: "Refund & Cancellation" },
  { href: "/shipping-delivery-policy", label: "Shipping & Delivery" }
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-stone-200 bg-white pb-[max(5.5rem,env(safe-area-inset-bottom))]">
      <div className="container-base space-y-6 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-heading text-lg text-stone-900">Jewelry Platform</p>
          <div className="flex flex-wrap gap-4 text-sm text-stone-600">
            <Link href="/about-us">About Us</Link>
            <Link href="/contact-us">Contact Us</Link>
            <Link href="/admin">Admin</Link>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-stone-500">Quick Links</p>
          <div className="flex flex-wrap gap-4 text-xs text-stone-500">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <p className="text-xs text-stone-400">Placeholder footer content. Replace with final brand and compliance details.</p>
      </div>
    </footer>
  );
}
