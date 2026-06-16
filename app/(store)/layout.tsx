"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function StoreLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isSignatureTheme = pathname.startsWith("/signature-pieces");

  return (
    <div className={`min-h-screen ${isSignatureTheme ? "bg-[#070f22]" : ""}`}>
      <Navbar />
      <main className="container-base py-8 pt-28 sm:pt-32">{children}</main>
      <Footer />
    </div>
  );
}
