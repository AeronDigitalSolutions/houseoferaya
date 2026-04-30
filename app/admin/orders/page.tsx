import { StatusBadge } from "@/components/StatusBadge";
import { orders } from "@/lib/mock-data";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-5">
      <h2 className="font-heading text-3xl sm:text-4xl text-stone-900">Orders</h2>

      <div className="space-y-3">
        {orders.map((order) => (
          <article key={order.id} className="card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-stone-900">{order.orderNumber}</p>
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={order.orderStatus} />
                <StatusBadge status={order.paymentStatus} />
                <StatusBadge status={order.shippingStatus} />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="rounded-full border border-stone-300 px-4 py-1 text-xs">Update Order Status</button>
              <button className="rounded-full border border-stone-300 px-4 py-1 text-xs">Update Payment</button>
              <button className="rounded-full border border-stone-300 px-4 py-1 text-xs">Update Shipment</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
