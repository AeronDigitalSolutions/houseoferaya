import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { getOrderById } from "@/lib/mock-data";

export default async function OrderConfirmationPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = getOrderById(orderId);
  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-heading text-3xl sm:text-4xl text-stone-900">Order Confirmation</h1>

      <section className="card space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-stone-600">Order ID: {order.orderNumber}</p>
          <StatusBadge status={order.orderStatus} />
          <StatusBadge status={order.paymentStatus} />
        </div>
        <p className="text-sm text-stone-600">Estimated Delivery: {order.estimatedDelivery}</p>
        <p className="text-sm text-stone-600">Placeholder success/failure message based on payment webhook status.</p>

        <div className="flex flex-wrap gap-3">
          <Link href={`/track-order/${order.id}`} className="rounded-full bg-stone-900 px-5 py-2 text-sm text-white">
            Track Order
          </Link>
          <Link href="/account/orders" className="rounded-full border border-stone-300 px-5 py-2 text-sm text-stone-800">
            Go to My Orders
          </Link>
        </div>
      </section>
    </div>
  );
}
