import Link from "next/link";
import { ReactNode } from "react";

type TactileButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

export function TactileButton({ href, children, variant = "primary", className = "" }: TactileButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition duration-300 sm:text-sm";

  const styles =
    variant === "primary"
      ? "bg-royal-800 text-beige-100 shadow-tactile hover:-translate-y-0.5 hover:bg-[#111110]"
      : "border border-[#bfa688] bg-white/45 text-royal-800 shadow-luxe backdrop-blur-sm hover:-translate-y-0.5 hover:bg-white/70";

  return (
    <Link href={href} className={`${base} ${styles} ${className}`}>
      {children}
    </Link>
  );
}
