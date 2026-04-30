import type { ReactNode } from "react";
import { AccountSidebar } from "@/components/AccountSidebar";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <AccountSidebar />
      <div>{children}</div>
    </div>
  );
}
