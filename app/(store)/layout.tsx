import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container-base py-8 pt-28 sm:pt-32">{children}</main>
      <Footer />
    </div>
  );
}
