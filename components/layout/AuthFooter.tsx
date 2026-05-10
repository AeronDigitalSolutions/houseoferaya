import Link from "next/link";

const legalLinks = [
  { href: "/terms-and-conditions", label: "Terms" },
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/refund-cancellation-policy", label: "Refunds" },
  { href: "/shipping-delivery-policy", label: "Shipping" }
];

export function AuthFooter() {
  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-[#f7f3ee]/95 px-4 py-3 backdrop-blur-md sm:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
        <p className="text-[11px] tracking-[0.08em] text-royal-700/70">© House of Eraya</p>

        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-royal-700/75">
          {legalLinks.map((link) => (
            <Link key={link.href} href={link.href} className="underline-offset-4 transition hover:text-royal-800 hover:underline">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="text-[11px] text-royal-700/75">
          <p>official.houseoferayya@gmail.com</p>
          <p>+91-7889072256</p>
        </div>
      </div>
    </footer>
  );
}
