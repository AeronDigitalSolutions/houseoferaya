"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, CircleAlert, MapPin, PackageCheck, Search, X } from "lucide-react";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { TrackingTimeline } from "@/components/TrackingTimeline";
import { StatusBadge } from "@/components/StatusBadge";
import { AdminDashboardRefreshButton } from "@/components/ui/AdminDashboardRefreshButton";
import { CustomSelect, type CustomSelectOption } from "@/components/ui/CustomSelect";
import { formatCurrency } from "@/lib/format";
import type { OrderStatus, PaymentStatus, ShippingStatus, TimelineEvent } from "@/lib/types";

type ShipmentRow = {
  id: string;
  orderNumber: string;
  total: number;
  totalLabel: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  items: Array<{
    id: string;
    productName: string;
    sku: string;
    quantity: number;
    totalPrice: number;
  }>;
  payment: {
    provider: string;
    status: PaymentStatus;
    amount: number;
    razorpayOrderId: string | null;
    razorpayPaymentId: string | null;
    paidAt: string | null;
  } | null;
  shipment: {
    id: string;
    shippingProvider: string;
    shipmentId: string | null;
    awbCode: string | null;
    courierName: string | null;
    trackingUrl: string | null;
    status: ShippingStatus;
    estimatedDeliveryDate: string | null;
    createdAt: string;
    updatedAt: string;
    timeline: TimelineEvent[];
    latestEvent: TimelineEvent | null;
    rawStatus: string | null;
  } | null;
};

type Props = {
  shipments: ShipmentRow[];
  sequelConnected: boolean;
  sequelStoreCode: string | null;
  sequelEnvironment: string;
};

const STATUS_OPTIONS: CustomSelectOption[] = [
  { value: "all", label: "All Shipping States" },
  { value: "NOT_CREATED", label: "Not Created" },
  { value: "READY_TO_SHIP", label: "Ready To Ship" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "RETURNED", label: "Returned" }
];

const SHIPMENT_OPTIONS: CustomSelectOption[] = [
  { value: "all", label: "All Orders" },
  { value: "created", label: "Shipment Created" },
  { value: "missing", label: "Shipment Missing" }
];

const PAYMENT_OPTIONS: CustomSelectOption[] = [
  { value: "all", label: "All Payment States" },
  { value: "PENDING", label: "Pending" },
  { value: "AUTHORIZED", label: "Authorized" },
  { value: "PAID", label: "Paid" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" }
];

const SORT_OPTIONS: CustomSelectOption[] = [
  { value: "latest", label: "Latest Orders" },
  { value: "oldest", label: "Oldest Orders" },
  { value: "eta", label: "Nearest ETA" },
  { value: "high", label: "Highest Value" }
];

const PAGE_SIZE = 20;

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(parsed);
}

function formatDateOnly(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium"
  }).format(parsed);
}

function shipmentProviderLabel(row: ShipmentRow) {
  if (row.shipment?.courierName) return row.shipment.courierName;
  if (row.shipment?.shippingProvider === "MANUAL" && row.shipment?.awbCode) return "Sequel";
  return row.shipment?.shippingProvider || "Not created";
}

function canCreateShipment(row: ShipmentRow) {
  return row.paymentStatus === "PAID";
}

function sequelStageLabel(rawStatus?: string | null) {
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
      return "Origin Hub";
    case "SLINDEST":
      return "Destination Hub";
    case "SDELASN":
      return "Out for Delivery";
    case "SDELVD":
      return "Delivered";
    case "SCANCELLED":
      return "Shipment Cancelled";
    default:
      return null;
  }
}

function shipmentStageLabel(row: ShipmentRow) {
  const nativeLabel = sequelStageLabel(row.shipment?.rawStatus);
  if (nativeLabel) return nativeLabel;
  if (row.shipment?.latestEvent?.title) return row.shipment.latestEvent.title;

  switch (row.shippingStatus) {
    case "NOT_CREATED":
      return "Shipment Not Created";
    case "READY_TO_SHIP":
      return "Ready To Ship";
    case "IN_TRANSIT":
      return "In Transit";
    case "DELIVERED":
      return "Delivered";
    case "RETURNED":
      return "Returned";
    default:
      return "Awaiting tracking events";
  }
}

function ShipmentModal({
  row,
  syncing,
  feedback,
  onClose,
  onSync
}: {
  row: ShipmentRow;
  syncing: boolean;
  feedback: string | null;
  onClose: () => void;
  onSync: (orderId: string) => Promise<void>;
}) {
  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[130] flex items-end bg-black/45 p-0 backdrop-blur-[2px] sm:items-center sm:justify-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Shipment details ${row.orderNumber}`}
        className="relative h-[92vh] w-full overflow-hidden rounded-t-3xl border border-stone-200 bg-[#f8f5f0] shadow-2xl sm:h-auto sm:max-h-[92vh] sm:max-w-6xl sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-stone-200 px-4 py-4 sm:px-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">Shipment Details</p>
            <h3 className="mt-1 font-heading text-2xl text-stone-900 sm:text-3xl">{row.orderNumber}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusBadge status={row.orderStatus} />
              <StatusBadge status={row.paymentStatus} />
              <StatusBadge status={row.shippingStatus} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700 transition hover:bg-stone-100"
            aria-label="Close shipment details"
          >
            <X size={18} />
          </button>
        </div>

        <div className="h-[calc(92vh-100px)] overflow-y-auto px-4 py-4 sm:max-h-[calc(92vh-100px)] sm:px-6 sm:py-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">Shipment State</p>
              <div className="mt-2 space-y-2">
                <StatusBadge status={row.shippingStatus} />
                <p className="text-sm font-semibold text-stone-900">{shipmentStageLabel(row)}</p>
                {row.shipment?.rawStatus ? (
                  <p className="text-xs uppercase tracking-[0.12em] text-stone-500">{row.shipment.rawStatus}</p>
                ) : null}
              </div>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">Courier</p>
              <p className="mt-1 text-lg font-semibold text-stone-900">{shipmentProviderLabel(row)}</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">AWB / Docket</p>
              <p className="mt-1 break-all text-sm font-semibold text-stone-900">{row.shipment?.awbCode || "Pending creation"}</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">Estimated Delivery</p>
              <p className="mt-1 text-sm font-semibold text-stone-900">{formatDateOnly(row.shipment?.estimatedDeliveryDate)}</p>
            </article>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void onSync(row.id)}
              disabled={syncing || (!row.shipment && !canCreateShipment(row))}
              className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {syncing
                ? "Syncing Sequel..."
                : !row.shipment && !canCreateShipment(row)
                  ? "Awaiting Successful Payment"
                  : row.shipment
                    ? "Refresh Shipment Tracking"
                    : "Create Shipment in Sequel"}
            </button>
            {row.shipment?.trackingUrl ? (
              <a
                href={row.shipment.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
              >
                Open Tracking Link
              </a>
            ) : null}
          </div>

          {feedback ? (
            <div className="mt-4 rounded-2xl border border-[#eadcc3] bg-[#fffdf8] px-4 py-3 text-sm text-stone-700">{feedback}</div>
          ) : null}
          {!row.shipment && !canCreateShipment(row) ? (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Shipment creation is locked until payment is successful.
            </div>
          ) : null}

          <section className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
              <h4 className="font-heading text-lg text-stone-900">Tracking Journey</h4>
              {row.shipment?.timeline.length ? (
                <div className="mt-4">
                  <TrackingTimeline events={row.shipment.timeline} />
                </div>
              ) : (
                <p className="mt-3 text-sm text-stone-600">Tracking events will appear here once Sequel starts updating the shipment timeline.</p>
              )}
            </article>

            <article className="space-y-4">
              <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
                <h4 className="font-heading text-lg text-stone-900">Customer & Delivery</h4>
                <div className="mt-3 space-y-2 text-sm text-stone-700">
                  <p><span className="font-medium text-stone-900">{row.customer.name || row.shippingAddress.fullName}</span></p>
                  <p>{row.customer.email || "No email available"}</p>
                  <p>{row.shippingAddress.phone}</p>
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                    <div className="mb-2 flex items-center gap-2 text-stone-900">
                      <MapPin size={14} />
                      <span className="text-sm font-medium">Shipping Address</span>
                    </div>
                    <p>{row.shippingAddress.line1}</p>
                    {row.shippingAddress.line2 ? <p>{row.shippingAddress.line2}</p> : null}
                    <p>
                      {row.shippingAddress.city}, {row.shippingAddress.state} - {row.shippingAddress.pincode}
                    </p>
                    <p>{row.shippingAddress.country}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
                <h4 className="font-heading text-lg text-stone-900">Payment & Shipment Snapshot</h4>
                <div className="mt-3 space-y-2 text-sm text-stone-700">
                  <p>Total: <span className="font-medium text-stone-900">{formatCurrency(row.total)}</span></p>
                  <p>Payment: <span className="font-medium text-stone-900">{row.payment?.provider || "Pending"}</span></p>
                  <p>Paid At: <span className="font-medium text-stone-900">{formatDateTime(row.payment?.paidAt)}</span></p>
                  <p>Sequel Stage: <span className="font-medium text-stone-900">{shipmentStageLabel(row)}</span></p>
                  <p>Sequel Raw Status: <span className="font-medium text-stone-900">{row.shipment?.rawStatus || "Pending"}</span></p>
                  <p>Latest Event: <span className="font-medium text-stone-900">{row.shipment?.latestEvent?.title || "No events yet"}</span></p>
                  <p>Last Synced: <span className="font-medium text-stone-900">{formatDateTime(row.shipment?.updatedAt || row.updatedAt)}</span></p>
                </div>
              </div>
            </article>
          </section>

          <section className="mt-5 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
            <h4 className="font-heading text-lg text-stone-900">Items in Shipment</h4>
            <div className="mt-3 space-y-2">
              {row.items.map((item) => (
                <article key={item.id} className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-stone-900">{item.productName}</p>
                      <p className="mt-1 text-xs text-stone-500">SKU: {item.sku}</p>
                    </div>
                    <p className="whitespace-nowrap text-sm font-medium text-stone-900">{formatCurrency(item.totalPrice)}</p>
                  </div>
                  <p className="mt-2 text-xs text-stone-600">Quantity: <span className="font-medium text-stone-900">{item.quantity}</span></p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export function AdminShipmentsManager({ shipments, sequelConnected, sequelStoreCode, sequelEnvironment }: Props) {
  const [rows, setRows] = useState(shipments);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ShippingStatus>("all");
  const [shipmentFilter, setShipmentFilter] = useState<"all" | "created" | "missing">("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | PaymentStatus>("all");
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "eta" | "high">("latest");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = rows.filter((row) => {
      const haystack = [
        row.orderNumber,
        row.customer.name || "",
        row.customer.email || "",
        row.customer.phone || "",
        row.shippingAddress.pincode,
        row.shipment?.awbCode || "",
        row.shipment?.shipmentId || "",
        ...row.items.map((item) => item.productName),
        ...row.items.map((item) => item.sku)
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      const matchesStatus = statusFilter === "all" || row.shippingStatus === statusFilter;
      const matchesShipment =
        shipmentFilter === "all" ||
        (shipmentFilter === "created" && Boolean(row.shipment?.awbCode)) ||
        (shipmentFilter === "missing" && !row.shipment?.awbCode);
      const matchesPayment = paymentFilter === "all" || row.paymentStatus === paymentFilter;

      return matchesQuery && matchesStatus && matchesShipment && matchesPayment;
    });

    filtered.sort((left, right) => {
      if (sortBy === "latest") return +new Date(right.createdAt) - +new Date(left.createdAt);
      if (sortBy === "oldest") return +new Date(left.createdAt) - +new Date(right.createdAt);
      if (sortBy === "high") return right.total - left.total;

      const leftEta = left.shipment?.estimatedDeliveryDate ? +new Date(left.shipment.estimatedDeliveryDate) : Number.MAX_SAFE_INTEGER;
      const rightEta = right.shipment?.estimatedDeliveryDate ? +new Date(right.shipment.estimatedDeliveryDate) : Number.MAX_SAFE_INTEGER;
      return leftEta - rightEta;
    });

    return filtered;
  }, [paymentFilter, query, rows, shipmentFilter, sortBy, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, shipmentFilter, paymentFilter, sortBy]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, page]);

  const selectedRow = useMemo(() => rows.find((row) => row.id === selectedId) || null, [rows, selectedId]);

  const connectedShipmentCount = rows.filter((row) => Boolean(row.shipment?.awbCode)).length;
  const deliveredCount = rows.filter((row) => row.shippingStatus === "DELIVERED").length;
  const transitCount = rows.filter((row) => row.shippingStatus === "IN_TRANSIT").length;
  const alertCount = rows.filter((row) => row.shippingStatus === "RETURNED" || (row.shipment && !row.shipment.timeline.length)).length;

  const handleSyncShipment = async (orderId: string) => {
    setSyncingId(orderId);
    setFeedback(null);

    try {
      const res = await fetch("/api/shipping/create-shipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId })
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        setFeedback(data?.message || "Unable to sync shipment with Sequel.");
        return;
      }

      const trackingRes = await fetch(`/api/shipping/track/${orderId}`, { cache: "no-store" });
      const trackingData = await trackingRes.json();

      setRows((current) =>
        current.map((row) => {
          if (row.id !== orderId) return row;
          return {
            ...row,
            shippingStatus: data.order?.shippingStatus || row.shippingStatus,
            shipment: data.shipment
              ? {
                  ...row.shipment,
                  id: data.shipment.id,
                  shippingProvider: data.shipment.shippingProvider,
                  shipmentId: data.shipment.shipmentId,
                  awbCode: data.shipment.awbCode,
                  courierName: data.shipment.courierName,
                  trackingUrl: trackingData?.shipment?.trackingUrl || data.shipment.trackingUrl,
                  status: trackingData?.shipment?.status || data.shipment.status,
                  estimatedDeliveryDate: trackingData?.shipment?.estimatedDeliveryDate || data.shipment.estimatedDeliveryDate,
                  createdAt: data.shipment.createdAt,
                  updatedAt: data.shipment.updatedAt,
                  timeline: trackingData?.shipment?.timeline || row.shipment?.timeline || [],
                  latestEvent: trackingData?.shipment?.timeline?.[0] || row.shipment?.latestEvent || null,
                  rawStatus: trackingData?.shipment?.status || row.shipment?.rawStatus || null
                }
              : row.shipment
          };
        })
      );

      setFeedback(data?.message || "Shipment synced successfully.");
    } catch {
      setFeedback("Unable to sync shipment with Sequel.");
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <>
      <section className="space-y-3">
        <section className="rounded-[1.9rem] border border-[#dec9a1]/60 bg-[radial-gradient(circle_at_top_left,#fff7e8_0%,#f8efe1_42%,#fbfaf6_100%)] px-5 py-4 shadow-[0_16px_40px_rgba(109,80,28,0.08)] sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#d8b16b]/70 bg-white/75 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8f6a33]">
                  <PackageCheck className="h-3.5 w-3.5" />
                  Sequel Shipping
                </span>
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
                    sequelConnected
                      ? "border border-emerald-200 bg-emerald-50/90 text-emerald-700"
                      : "border border-rose-200 bg-rose-50/90 text-rose-700"
                  }`}
                >
                  {sequelConnected ? <CheckCircle2 className="h-4 w-4" /> : <CircleAlert className="h-4 w-4" />}
                  {sequelConnected ? "API connected" : "API missing"}
                </span>
              </div>

              <div>
                <h3 className="font-heading text-[2.15rem] tracking-[-0.03em] text-stone-900 sm:text-[2.6rem]">Shipment Command Centre</h3>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-stone-700 lg:justify-end">
              <AdminDashboardRefreshButton label="Refresh Shipments" compactLabel="Refresh" />
              <span className="rounded-full border border-stone-300 bg-white/75 px-3 py-2">
                Store: <span className="font-semibold text-stone-900">{sequelStoreCode || "Not configured"}</span>
              </span>
              <span className="rounded-full border border-stone-300 bg-white/75 px-3 py-2">
                Mode: <span className="font-semibold text-stone-900">{sequelEnvironment}</span>
              </span>
              <span className="rounded-full border border-stone-300 bg-white/75 px-3 py-2">
                Linked: <span className="font-semibold text-stone-900">{connectedShipmentCount}</span>
              </span>
              <span className="rounded-full border border-stone-300 bg-white/75 px-3 py-2">
                Transit: <span className="font-semibold text-stone-900">{transitCount}</span>
              </span>
              <span className="rounded-full border border-stone-300 bg-white/75 px-3 py-2">
                Delivered: <span className="font-semibold text-stone-900">{deliveredCount}</span>
              </span>
              <span className="rounded-full border border-stone-300 bg-white/75 px-3 py-2">
                Attention: <span className="font-semibold text-stone-900">{alertCount}</span>
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-[#d8c7a3]/55 bg-[#fffdf9] p-3.5 shadow-[0_10px_24px_rgba(111,89,47,0.07)]">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <label className="space-y-1.5 xl:col-span-2">
              <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Search</span>
              <div className="flex h-11 items-center gap-2 rounded-2xl border border-black/10 bg-white px-3">
                <Search className="h-4 w-4 text-stone-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Order no, customer, AWB, pincode, product"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
                />
              </div>
            </label>

            <label className="space-y-1.5">
              <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Shipping State</span>
              <CustomSelect
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
                options={STATUS_OPTIONS}
                ariaLabel="Shipment status filter"
                buttonClassName="h-11 rounded-2xl border-black/10 px-3"
                menuClassName="rounded-2xl border-black/10 bg-[#fbf7f0] p-1.5 shadow-[0_18px_36px_rgba(32,27,20,0.12)]"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Shipment</span>
              <CustomSelect
                value={shipmentFilter}
                onValueChange={(value) => setShipmentFilter(value as typeof shipmentFilter)}
                options={SHIPMENT_OPTIONS}
                ariaLabel="Shipment availability filter"
                buttonClassName="h-11 rounded-2xl border-black/10 px-3"
                menuClassName="rounded-2xl border-black/10 bg-[#fbf7f0] p-1.5 shadow-[0_18px_36px_rgba(32,27,20,0.12)]"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Payment</span>
              <CustomSelect
                value={paymentFilter}
                onValueChange={(value) => setPaymentFilter(value as typeof paymentFilter)}
                options={PAYMENT_OPTIONS}
                ariaLabel="Shipment payment filter"
                buttonClassName="h-11 rounded-2xl border-black/10 px-3"
                menuClassName="rounded-2xl border-black/10 bg-[#fbf7f0] p-1.5 shadow-[0_18px_36px_rgba(32,27,20,0.12)]"
              />
            </label>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-[1fr_220px]">
            <label className="space-y-1.5">
              <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Sort By</span>
              <CustomSelect
                value={sortBy}
                onValueChange={(value) => setSortBy(value as typeof sortBy)}
                options={SORT_OPTIONS}
                ariaLabel="Shipment sort order"
                buttonClassName="h-11 rounded-2xl border-black/10 px-3"
                menuClassName="rounded-2xl border-black/10 bg-[#fbf7f0] p-1.5 shadow-[0_18px_36px_rgba(32,27,20,0.12)]"
              />
            </label>

            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStatusFilter("all");
                setShipmentFilter("all");
                setPaymentFilter("all");
                setSortBy("latest");
              }}
              className="mt-auto h-11 rounded-full border border-stone-300 bg-white px-4 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
            >
              Reset Filters
            </button>
          </div>
        </section>

        <section className="card overflow-hidden p-0">
          <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-5 py-3.5">
            <div>
              <h3 className="font-heading text-xl text-stone-900">Shipment Activity</h3>
              <p className="mt-1 text-xs text-stone-500">Click a row to open tracking, items, address, and live Sequel actions.</p>
            </div>
            <span className="rounded-full border border-[#dec9a1] bg-[#fff9ef] px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#8f6a33]">
              {pageRows.length} visible entries
            </span>
          </div>

          {pageRows.length === 0 ? (
            <div className="px-5 py-10 text-sm text-stone-600">No shipment rows match the current filters.</div>
          ) : (
            <>
              <div className="hidden xl:block">
                <table className="w-full table-fixed text-left">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-[0.14em] text-stone-500">
                      <th className="w-[12%] px-5 py-3 font-medium">Order</th>
                      <th className="w-[18%] px-5 py-3 font-medium">Customer</th>
                      <th className="w-[13%] px-5 py-3 font-medium">Courier / AWB</th>
                      <th className="w-[12%] px-5 py-3 font-medium">Shipment</th>
                      <th className="w-[10%] px-5 py-3 font-medium">Payment</th>
                      <th className="w-[13%] px-5 py-3 font-medium">ETA</th>
                      <th className="w-[22%] px-5 py-3 font-medium">Latest Movement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {pageRows.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => {
                          setFeedback(null);
                          setSelectedId(row.id);
                        }}
                        className="cursor-pointer align-top transition hover:bg-stone-50"
                      >
                        <td className="px-5 py-5">
                          <p className="text-sm font-semibold text-stone-900">{row.orderNumber}</p>
                          <p className="mt-1 text-xs text-stone-500">{formatDateOnly(row.createdAt)}</p>
                          <p className="mt-2 text-xs font-medium text-stone-900">{row.totalLabel}</p>
                        </td>
                        <td className="px-5 py-5">
                          <p className="text-sm font-medium text-stone-900">{row.customer.name || row.shippingAddress.fullName}</p>
                          <p className="mt-1 break-words text-xs text-stone-500">{row.customer.email || row.shippingAddress.phone}</p>
                          <p className="mt-1 text-xs text-stone-500">{row.shippingAddress.city}, {row.shippingAddress.state}</p>
                        </td>
                        <td className="px-5 py-5">
                          <p className="text-sm font-medium text-stone-900">{shipmentProviderLabel(row)}</p>
                          <p className="mt-1 break-all text-xs text-stone-500">{row.shipment?.awbCode || "Shipment not created"}</p>
                        </td>
                        <td className="px-5 py-5">
                          <div className="space-y-2">
                            <StatusBadge status={row.shippingStatus} />
                            <p className="text-xs font-medium text-stone-700">{shipmentStageLabel(row)}</p>
                            {row.shipment?.rawStatus ? (
                              <p className="text-[11px] uppercase tracking-[0.12em] text-stone-400">{row.shipment.rawStatus}</p>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-5 py-5">
                          <StatusBadge status={row.paymentStatus} />
                        </td>
                        <td className="px-5 py-5 text-sm text-stone-700">{formatDateOnly(row.shipment?.estimatedDeliveryDate)}</td>
                        <td className="px-5 py-5">
                          <p className="text-sm font-medium text-stone-900">{row.shipment?.latestEvent?.title || "Awaiting tracking events"}</p>
                          <p className="mt-1 text-xs text-stone-500">{row.shipment?.latestEvent?.timestamp || "No timeline yet"}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-stone-200 xl:hidden">
                {pageRows.map((row) => (
                  <article
                    key={row.id}
                    onClick={() => {
                      setFeedback(null);
                      setSelectedId(row.id);
                    }}
                    className="cursor-pointer space-y-3 px-5 py-4 transition hover:bg-stone-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-stone-900">{row.orderNumber}</p>
                        <p className="mt-1 text-xs text-stone-500">{row.customer.name || row.shippingAddress.fullName}</p>
                      </div>
                      <p className="text-sm font-semibold text-stone-900">{row.totalLabel}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={row.shippingStatus} />
                      <StatusBadge status={row.paymentStatus} />
                    </div>
                    <p className="text-sm font-medium text-stone-900">{shipmentStageLabel(row)}</p>
                    <p className="text-sm text-stone-700">{shipmentProviderLabel(row)}</p>
                    <p className="break-all text-xs text-stone-500">{row.shipment?.awbCode || "Shipment not created yet"}</p>
                    <p className="text-xs text-stone-500">{row.shipment?.latestEvent?.title || "Awaiting tracking events"}</p>
                  </article>
                ))}
              </div>
            </>
          )}

          <AdminPagination
            page={page}
            totalPages={totalPages}
            totalItems={filteredRows.length}
            pageSize={PAGE_SIZE}
            currentCount={pageRows.length}
            onPageChange={setPage}
            itemLabel="shipments"
          />
        </section>
      </section>

      {selectedRow ? (
        <ShipmentModal
          row={selectedRow}
          syncing={syncingId === selectedRow.id}
          feedback={feedback}
          onClose={() => setSelectedId(null)}
          onSync={handleSyncShipment}
        />
      ) : null}
    </>
  );
}
