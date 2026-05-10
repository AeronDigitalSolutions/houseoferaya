import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AccountSidebar } from "@/components/AccountSidebar";
import { getAuthUserFromCookies } from "@/lib/auth/session";

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await getAuthUserFromCookies();
  if (!user || !user.isActive) {
    redirect("/login");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <AccountSidebar />
      <div>{children}</div>
    </div>
  );
}
