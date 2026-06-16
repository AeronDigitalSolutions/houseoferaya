"use client";

import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { useTransition } from "react";

type Props = {
  label?: string;
  compactLabel?: string;
};

export function AdminDashboardRefreshButton({ label = "Refresh Dashboard", compactLabel = "Refresh" }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(() => {
          router.refresh();
        });
      }}
      disabled={isPending}
      className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/85 px-4 py-2.5 text-sm font-medium text-stone-700 shadow-[0_8px_20px_rgba(76,58,25,0.06)] transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-70"
      aria-label={label}
      title={label}
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
      <span className="hidden sm:inline">{isPending ? "Refreshing..." : label}</span>
      <span className="sm:hidden">{isPending ? "Refreshing..." : compactLabel}</span>
    </button>
  );
}
