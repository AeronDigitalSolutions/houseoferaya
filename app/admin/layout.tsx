import type { ReactNode } from "react";
import Link from "next/link";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { Navbar } from "@/components/layout/Navbar";
import { requireAdminAuth } from "@/lib/auth/admin-guard";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdminAuth();
  const adminLabel = admin.name?.trim() ? admin.name.trim() : admin.email;

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="mx-auto w-full max-w-[1600px] px-4 py-8 pt-28 sm:px-6 sm:pt-32 lg:px-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-heading text-3xl text-stone-900 sm:text-4xl">
            Admin <span className="text-stone-500">({adminLabel})</span>
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700">
              Back to Store
            </Link>
            <AdminLogoutButton />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr] xl:gap-8">
          <AdminSidebar />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
