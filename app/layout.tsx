import type { Metadata } from "next";
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jewelry Ecommerce Architecture",
  description: "Scalable jewelry ecommerce scaffold built with Next.js App Router and Prisma"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="bg-[#f7f3ee] font-body text-[#2a2927] antialiased">
        {children}
        <MobileBottomNav />
      </body>
    </html>
  );
}
