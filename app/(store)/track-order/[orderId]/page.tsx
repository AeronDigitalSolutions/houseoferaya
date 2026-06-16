import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { TrackingTimeline } from "@/components/TrackingTimeline";
import { prisma } from "@/lib/prisma";
import {
  buildSequelTimeline,
  extractEstimatedDeliveryDate,
  extractTrackingUrl,
  getTrackingDataFromRawPayload,
  mapSequelShipmentStatus,
  trackSequelShipment
} from "@/lib/sequel";

export default async function TrackOrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id: orderId }, { orderNumber: orderId }]
    },
    include: {
      shipment: true
    }
  });

  if (!order) {
    notFound();
  }

  if (order.paymentStatus !== "PAID") {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="font-heading text-3xl text-stone-900 sm:text-4xl">Tracking Details</h1>

        <section className="card space-y-4 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-stone-600">Order: {order.orderNumber}</p>
            <StatusBadge status={order.paymentStatus} />
          </div>

          <p className="text-sm text-stone-600">
            Shipment tracking will appear only after successful payment and courier handover.
          </p>
        </section>
      </div>
    );
  }

  let trackingPayload = getTrackingDataFromRawPayload(order.shipment?.rawPayload);

  if (order.shipment?.awbCode) {
    try {
      const live = await trackSequelShipment(order.shipment.awbCode);
      trackingPayload = live.data || trackingPayload;
    } catch {
      trackingPayload = getTrackingDataFromRawPayload(order.shipment?.rawPayload);
    }
  }

  const shippingStatus = trackingPayload?.shipment_status
    ? mapSequelShipmentStatus(trackingPayload.shipment_status)
    : order.shippingStatus;

  const estimatedDeliveryDate = extractEstimatedDeliveryDate(trackingPayload);
  const trackingUrl = extractTrackingUrl(trackingPayload) || order.shipment?.trackingUrl || null;
  const timeline = buildSequelTimeline(trackingPayload?.tracking || []);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-heading text-3xl text-stone-900 sm:text-4xl">Tracking Details</h1>

      <section className="card space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-stone-600">Order: {order.orderNumber}</p>
          <StatusBadge status={shippingStatus} />
        </div>

        <div className="grid gap-3 text-sm text-stone-700 sm:grid-cols-2">
          <p>Courier: {order.shipment?.courierName ?? "Sequel"}</p>
          <p>AWB: {order.shipment?.awbCode ?? "Pending"}</p>
          <p>Estimated Delivery: {estimatedDeliveryDate ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(estimatedDeliveryDate) : "Pending"}</p>
          <p>
            Tracking: {trackingUrl ? <a href={trackingUrl} target="_blank" rel="noreferrer" className="underline">Open tracking link</a> : "Will be updated after dispatch"}
          </p>
        </div>

        <div className="rounded-xl border border-stone-200 p-4">
          {timeline.length ? <TrackingTimeline events={timeline} /> : <p className="text-sm text-stone-600">Tracking timeline will appear once the shipment starts moving.</p>}
        </div>
      </section>
    </div>
  );
}
