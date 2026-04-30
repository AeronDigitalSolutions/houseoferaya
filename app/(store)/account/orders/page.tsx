import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
import { orders } from "@/lib/mock-data";

export default function MyOrdersPage() {
  return (
    <div className="space-y-5">
      <h1 className="font-heading text-3xl sm:text-4xl text-stone-900">My Orders</h1>

      <div className="space-y-3">
        {orders.map((order) => (
          <article key={order.id} className="card space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-stone-900">{order.orderNumber}</p>
              <Link href={`/account/orders/${order.id}`} className="text-xs text-stone-600 underline">
                View Details
              </Link>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusBadge status={order.orderStatus} />
              <StatusBadge status={order.paymentStatus} />
              <StatusBadge status={order.shippingStatus} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
