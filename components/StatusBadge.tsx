import type { PaymentStatus, OrderStatus, ShippingStatus } from "@/lib/types";

type BadgeStatus = PaymentStatus | OrderStatus | ShippingStatus;

const colorMap: Record<BadgeStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  AUTHORIZED: "bg-blue-100 text-blue-800",
  PAID: "bg-emerald-100 text-emerald-800",
  FAILED: "bg-rose-100 text-rose-800",
  REFUNDED: "bg-stone-200 text-stone-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-violet-100 text-violet-800",
  SHIPPED: "bg-sky-100 text-sky-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rose-100 text-rose-800",
  NOT_CREATED: "bg-stone-200 text-stone-700",
  READY_TO_SHIP: "bg-indigo-100 text-indigo-800",
  IN_TRANSIT: "bg-cyan-100 text-cyan-800",
  RETURNED: "bg-orange-100 text-orange-800"
};

export function StatusBadge({ status }: { status: BadgeStatus }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${colorMap[status]}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
