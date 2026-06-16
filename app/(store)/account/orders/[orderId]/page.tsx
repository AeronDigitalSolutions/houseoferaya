import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Package2, ShieldCheck, Truck } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { TrackingTimeline } from "@/components/TrackingTimeline";
import { getAuthUserFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  buildSequelTimeline,
  extractEstimatedDeliveryDate,
  extractTrackingUrl,
  getTrackingDataFromRawPayload,
  mapSequelShipmentStatus,
  trackSequelShipment
} from "@/lib/sequel";
import type { PaymentStatus, ShippingStatus } from "@/lib/types";

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateTime(value?: string | Date | null) {
  if (!value) return "—";
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(parsed);
}

function formatDateOnly(value?: string | null | Date) {
  if (!value) return "—";
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(parsed);
}

function paymentMessage(paymentStatus: PaymentStatus) {
  switch (paymentStatus) {
    case "PAID":
      return "Payment received successfully.";
    case "AUTHORIZED":
      return "Payment is authorized and awaiting final confirmation.";
    case "FAILED":
      return "Payment failed. Please retry or contact support.";
    case "REFUNDED":
      return "Payment has been refunded.";
    default:
      return "Payment is pending. Shipment details will appear after successful payment.";
  }
}

function sequelStatusLabel(rawStatus?: string | null) {
  switch ((rawStatus || "").toUpperCase()) {
    case "SCREATED":
      return "Shipment Created";
    case "SPU":
      return "Picked Up";
    case "SCHECKIN":
      return "Hub Check-In";
    case "SLINREC":
      return "Linehaul Received";
    case "SLINORIN":
      return "Origin Processing";
    case "SLINDEST":
      return "Reached Destination Hub";
    case "SDELASN":
      return "Out for Delivery";
    case "SDELVD":
      return "Delivered";
    case "SCANCELLED":
      return "Shipment Cancelled";
    default:
      return rawStatus ? titleCase(rawStatus.replace(/^S/, "")) : "Awaiting Courier Updates";
  }
}

export default async function OrderDetailsPage({ params }: { params: Promise<{ orderId: string }> }) {
  const user = await getAuthUserFromCookies();
  if (!user || !user.isActive) {
    redirect("/login");
  }

  const { orderId } = await params;

  const order = await prisma.order.findFirst({
    where: {
      userId: user.id,
      OR: [{ id: orderId }, { orderNumber: orderId }]
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                where: { isPrimary: true },
                take: 1
              }
            }
          }
        }
      },
      shipment: true,
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  if (!order) {
    notFound();
  }

  const latestPayment = order.payments[0] || null;
  const paymentMethod = latestPayment ? titleCase(latestPayment.provider) : "Awaiting payment record";
  const canShowShipment = order.paymentStatus === "PAID";
  let trackingPayload = getTrackingDataFromRawPayload(order.shipment?.rawPayload);

  if (canShowShipment && order.shipment?.awbCode) {
    try {
      const live = await trackSequelShipment(order.shipment.awbCode);
      trackingPayload = live.data || trackingPayload;
    } catch {
      trackingPayload = getTrackingDataFromRawPayload(order.shipment?.rawPayload);
    }
  }

  const shipmentStatus = canShowShipment && trackingPayload?.shipment_status
    ? mapSequelShipmentStatus(trackingPayload.shipment_status)
    : canShowShipment
      ? order.shippingStatus
      : null;
  const timeline = canShowShipment ? buildSequelTimeline(trackingPayload?.tracking || []) : [];
  const trackingUrl = canShowShipment ? extractTrackingUrl(trackingPayload) || order.shipment?.trackingUrl || null : null;
  const estimatedDeliveryDate = canShowShipment ? extractEstimatedDeliveryDate(trackingPayload) || order.shipment?.estimatedDeliveryDate || null : null;
  const rawShipmentStatus = canShowShipment ? trackingPayload?.shipment_status || null : null;
  const apiShipmentLabel = sequelStatusLabel(rawShipmentStatus);

  const topMessage = !canShowShipment
    ? "Awaiting payment confirmation"
    : rawShipmentStatus
    ? apiShipmentLabel
    : order.shipment?.awbCode
      ? "Sequel has not shared live movement updates yet"
      : "Shipment not yet handed over to courier";

  const alertMessage =
    order.orderStatus === "CANCELLED"
      ? "This order has been cancelled. If you need help, please contact support."
      : shipmentStatus === "RETURNED"
        ? "This shipment is marked as returned. Please contact support if you need assistance."
        : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/account/orders" className="inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-stone-800">
            <ArrowLeft size={15} />
            Back to My Orders
          </Link>
          <h1 className="mt-3 font-heading text-3xl text-stone-900 sm:text-4xl">Track Your Order</h1>
        </div>
        <div className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700">
          {order.orderNumber}
        </div>
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-[#dec9a1]/60 bg-[radial-gradient(circle_at_top_left,#fff7e8_0%,#f7eedf_36%,#f6f0e7_68%,#fbfaf6_100%)] p-6 shadow-[0_20px_55px_rgba(109,80,28,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d8b16b]/70 bg-white/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8f6a33]">
              <Package2 className="h-4 w-4" />
              Order Status
            </span>
            <div>
              <p className="text-2xl font-semibold tracking-[-0.02em] text-stone-900 sm:text-3xl">{topMessage}</p>
              <p className="mt-2 text-sm text-stone-600">
                Ordered on {formatDateTime(order.createdAt)}. Shipment updates appear here only when Sequel starts returning live courier data.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <article className="rounded-[1.5rem] border border-[#eadcc3] bg-white/80 px-5 py-4 shadow-[0_10px_26px_rgba(109,84,38,0.05)]">
              <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Order Total</p>
              <p className="mt-2 font-heading text-3xl text-stone-900">{formatCurrency(Number(order.total))}</p>
            </article>
            <article className="rounded-[1.5rem] border border-[#eadcc3] bg-white/80 px-5 py-4 shadow-[0_10px_26px_rgba(109,84,38,0.05)]">
              <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Payment</p>
              <p className="mt-2 text-sm font-semibold text-stone-900">{paymentMethod}</p>
              <div className="mt-2">
                <StatusBadge status={order.paymentStatus} />
              </div>
              <p className="mt-3 text-xs text-stone-500">{paymentMessage(order.paymentStatus)}</p>
            </article>
          </div>
        </div>

        <div className="mt-6 rounded-[1.6rem] border border-[#eadcc3] bg-white/78 px-4 py-4 text-sm text-stone-600">
          {canShowShipment
            ? order.shipment?.awbCode
              ? "Shipment details are now linked with Sequel. Live movement will appear as soon as the courier starts scanning the docket."
              : "Payment is confirmed. Shipment details will appear once the order is handed over to Sequel."
            : "Shipment is intentionally hidden until payment is successful."}
        </div>
      </section>

      {alertMessage ? (
        <section className="rounded-[1.6rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {alertMessage}
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="card space-y-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-heading text-2xl text-stone-900">Items in Your Order</h2>
              <p className="mt-1 text-sm text-stone-500">A simple summary of what is on the way.</p>
            </div>
            <span className="rounded-full border border-stone-300 bg-white px-3 py-1 text-xs uppercase tracking-[0.16em] text-stone-600">
              {order.items.length} item{order.items.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-3">
            {order.items.map((line) => (
              <article key={line.id} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-stone-900">{line.productName}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.12em] text-stone-500">SKU: {line.sku}</p>
                    <p className="mt-3 text-sm text-stone-600">Quantity: <span className="font-medium text-stone-900">{line.quantity}</span></p>
                  </div>
                  <p className="whitespace-nowrap text-base font-semibold text-stone-900">{formatCurrency(Number(line.totalPrice))}</p>
                </div>
              </article>
            ))}
          </div>
        </article>

        <div className="space-y-4">
          <article className="card p-5">
            <h3 className="font-heading text-xl text-stone-900">Delivery Details</h3>
            <div className="mt-4 space-y-2 text-sm text-stone-700">
              <p className="font-semibold text-stone-900">{order.shippingFullName}</p>
              <p>{order.shippingLine1}</p>
              {order.shippingLine2 ? <p>{order.shippingLine2}</p> : null}
              <p>
                {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
              </p>
              <p>{order.shippingPhone}</p>
            </div>
          </article>

          {canShowShipment ? (
            <article className="card p-5">
              <h3 className="font-heading text-xl text-stone-900">Shipment Snapshot</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-stone-500">Courier</p>
                  <p className="mt-2 text-sm font-semibold text-stone-900">{order.shipment?.courierName || "Preparing shipment"}</p>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-stone-500">AWB / Docket</p>
                  <p className="mt-2 break-all text-sm font-semibold text-stone-900">{order.shipment?.awbCode || "Will appear after dispatch"}</p>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-stone-500">Shipment Status</p>
                  <div className="mt-2">{shipmentStatus ? <StatusBadge status={shipmentStatus} /> : "—"}</div>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-stone-500">Estimated Delivery</p>
                  <p className="mt-2 text-sm font-semibold text-stone-900">
                    {estimatedDeliveryDate ? formatDateOnly(estimatedDeliveryDate) : "Updating soon"}
                  </p>
                </div>
              </div>

              {trackingUrl ? (
                <a
                  href={trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                >
                  <Truck size={15} />
                  Open Courier Tracking
                </a>
              ) : null}
            </article>
          ) : null}
        </div>
      </section>

      {canShowShipment && timeline.length ? (
        <section className="card space-y-4 p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#9c7346]" />
            <div>
              <h3 className="font-heading text-xl text-stone-900">Latest Tracking Updates</h3>
              <p className="mt-1 text-sm text-stone-500">A live courier timeline will appear here whenever Sequel scans your package.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-4">
            <TrackingTimeline events={timeline} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
