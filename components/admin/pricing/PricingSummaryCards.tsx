import { ArrowDownRight, ArrowUpRight, Coins, LockKeyhole, TrendingUp } from "lucide-react";
import type { MetalRate } from "@/components/admin/pricing/types";
import { formatCurrency, movementForRate } from "@/components/admin/pricing/utils";

function MovementCell({
  label,
  value
}: {
  label: string;
  value: { changeAmount: number; percentage: number };
}) {
  const isUp = value.changeAmount > 0;
  const isDown = value.changeAmount < 0;
  const toneClass = isUp ? "text-emerald-700" : isDown ? "text-rose-700" : "text-stone-700";

  return (
    <div className="card rounded-3xl p-5 sm:p-6">
      <p className="text-xs uppercase tracking-[0.16em] text-stone-500">{label}</p>
      <div className={`mt-2 inline-flex items-center gap-1.5 text-2xl font-semibold ${toneClass}`}>
        {isUp ? <ArrowUpRight size={18} /> : isDown ? <ArrowDownRight size={18} /> : <TrendingUp size={18} />}
        {value.changeAmount === 0 ? "No change" : `${value.changeAmount > 0 ? "+" : ""}${formatCurrency(value.changeAmount)}`}
      </div>
      <p className={`mt-1 text-base ${toneClass}`}>{value.percentage > 0 ? "+" : ""}{value.percentage.toFixed(2)}%</p>
    </div>
  );
}

export function PricingSummaryCards({ rates }: { rates: MetalRate[] }) {
  const gold = rates.find((item) => item.id === "gold");
  const silver = rates.find((item) => item.id === "silver");
  const lockedCount = rates.filter((item) => item.status === "LOCKED").length;

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="card rounded-3xl p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Tracked Metals</p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-3xl font-semibold text-stone-900 sm:text-4xl">
          <Coins size={20} />
          {rates.length}
        </p>
      </div>

      <div className="card rounded-3xl p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Locked Metals</p>
        <p className="mt-3 inline-flex items-center gap-1.5 text-3xl font-semibold text-stone-900 sm:text-4xl">
          <LockKeyhole size={20} />
          {lockedCount}
        </p>
      </div>

      <MovementCell
        label="Today's Gold Movement"
        value={movementForRate({
          sellingRate: gold?.sellingRate || 0,
          liveMarketRate: gold?.liveMarketRate ?? null,
          dayStartRate: gold?.dayStartRate || 0
        })}
      />

      <MovementCell
        label="Today's Silver Movement"
        value={movementForRate({
          sellingRate: silver?.sellingRate || 0,
          liveMarketRate: silver?.liveMarketRate ?? null,
          dayStartRate: silver?.dayStartRate || 0
        })}
      />
    </section>
  );
}
