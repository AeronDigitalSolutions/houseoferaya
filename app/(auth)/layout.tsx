import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { AuthFooter } from "@/components/layout/AuthFooter";
import { getAuthUserFromCookies } from "@/lib/auth/session";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const user = await getAuthUserFromCookies();
  if (user && user.isActive) {
    redirect("/account/profile");
  }

  return (
    <div className="min-h-screen overflow-hidden">
      <Navbar />
      <main className="container-base flex min-h-screen items-center justify-center pb-24 pt-28 sm:pb-28 sm:pt-32">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </main>
      <AuthFooter />
    </div>
  );
}
