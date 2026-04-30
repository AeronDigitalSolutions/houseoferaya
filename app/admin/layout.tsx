import type { ReactNode } from "react";
import Link from "next/link";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Navbar } from "@/components/layout/Navbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="container-base py-8 pt-28 sm:pt-32">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-heading text-3xl sm:text-4xl text-stone-900">Admin</h1>
          <Link href="/" className="text-sm text-stone-600 underline">
            Back to Store
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <AdminSidebar />
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
