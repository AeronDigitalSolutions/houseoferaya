import { notFound } from "next/navigation";
import { OrderSummary } from "@/components/OrderSummary";
import { StatusBadge } from "@/components/StatusBadge";
import { TrackingTimeline } from "@/components/TrackingTimeline";
import { formatCurrency } from "@/lib/format";
import { getOrderById } from "@/lib/mock-data";

export default async function OrderDetailsPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = getOrderById(orderId);
  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl sm:text-4xl text-stone-900">Order Details</h1>

      <section className="card space-y-4 p-5">
        <p className="text-sm font-medium text-stone-900">{order.orderNumber}</p>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={order.orderStatus} />
          <StatusBadge status={order.paymentStatus} />
          <StatusBadge status={order.shippingStatus} />
        </div>
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="font-heading text-2xl text-stone-900">Product List</h2>
        {order.items.map((line) => (
          <div key={line.id} className="flex items-center justify-between border-b border-stone-100 py-2 text-sm">
            <span>{line.product.name} x {line.quantity}</span>
            <span>{formatCurrency(line.product.price * line.quantity)}</span>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card space-y-2 p-5 text-sm text-stone-700">
          <h3 className="font-heading text-xl text-stone-900">Address</h3>
          <p>{order.shippingAddress.fullName}</p>
          <p>{order.shippingAddress.line1}</p>
          <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
          <p>{order.shippingAddress.phone}</p>
        </div>

        <div className="card space-y-2 p-5 text-sm text-stone-700">
          <h3 className="font-heading text-xl text-stone-900">Payment Information</h3>
          <p>Status: {order.paymentStatus}</p>
          <p>Method: Placeholder Razorpay</p>
          <p>Transaction ID: Placeholder</p>
        </div>
      </section>

      <section className="card space-y-3 p-5">
        <h3 className="font-heading text-xl text-stone-900">Shipment Tracking</h3>
        <TrackingTimeline events={order.shipment?.timeline ?? []} />
      </section>

      <OrderSummary subtotal={order.subtotal} shippingCharge={order.shippingCharge} discount={order.discount} showCta={false} />

      <div className="flex flex-wrap gap-3">
        <button className="rounded-full border border-rose-200 px-5 py-2 text-sm text-rose-700">Cancel Order (Placeholder)</button>
        <button className="rounded-full border border-stone-300 px-5 py-2 text-sm text-stone-700">Return Request (Placeholder)</button>
      </div>
    </div>
  );
}
