import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { TrackingTimeline } from "@/components/TrackingTimeline";
import { getOrderById } from "@/lib/mock-data";

export default async function TrackOrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = getOrderById(orderId);
  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-heading text-3xl sm:text-4xl text-stone-900">Tracking Details</h1>

      <section className="card space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-stone-600">Order: {order.orderNumber}</p>
          <StatusBadge status={order.shippingStatus} />
        </div>

        <div className="grid gap-3 text-sm text-stone-700 sm:grid-cols-2">
          <p>Courier: {order.shipment?.courierName ?? "Placeholder Courier"}</p>
          <p>AWB: {order.shipment?.awbCode ?? "Placeholder AWB"}</p>
        </div>

        <div className="rounded-xl border border-stone-200 p-4">
          <TrackingTimeline events={order.shipment?.timeline ?? []} />
        </div>
      </section>
    </div>
  );
}
