"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ClipboardList, CreditCard, Package, Truck, X } from "lucide-react";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { StatusBadge } from "@/components/StatusBadge";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { formatCurrency } from "@/lib/format";
import type { OrderStatus, PaymentStatus, ShippingStatus } from "@/lib/types";

type OrderItem = {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type PaymentItem = {
  id: string;
  provider: string;
  status: PaymentStatus;
  amount: number;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  paidAt: string | null;
  createdAt: string;
};

type ShipmentItem = {
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
} | null;

type AddressBlock = {
  fullName: string | null;
  phone: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  pincode: string | null;
};

type AdminOrder = {
  id: string;
  orderNumber: string;
  subtotal: number;
  shippingCharge: number;
  discount: number;
  total: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus;
  shippingAddress: AddressBlock;
  billingAddress: AddressBlock;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  items: OrderItem[];
  payments: PaymentItem[];
  shipment: ShipmentItem;
};

type Props = {
  initialOrders: AdminOrder[];
};

const ORDER_STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "RETURNED"
];

const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = ["PENDING", "AUTHORIZED", "PAID", "FAILED", "REFUNDED"];
const SHIPPING_STATUS_OPTIONS: ShippingStatus[] = [
  "NOT_CREATED",
  "READY_TO_SHIP",
  "IN_TRANSIT",
  "DELIVERED",
  "RETURNED"
];
const PAGE_SIZE = 20;

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatDateOnly(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
}

function statusLabel(value: string) {
  return value.replaceAll("_", " ");
}

function isAddressAvailable(address: AddressBlock) {
  return Boolean(
    address.fullName ||
      address.phone ||
      address.line1 ||
      address.line2 ||
      address.city ||
      address.state ||
      address.pincode ||
      address.country
  );
}

function AddressCard({ title, address }: { title: string; address: AddressBlock }) {
  const hasAddress = isAddressAvailable(address);
  return (
    <article className="rounded-xl border border-stone-200 bg-stone-50 p-3">
      <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">{title}</p>
      {hasAddress ? (
        <div className="mt-2 space-y-1 text-sm text-stone-800">
          <p className="font-medium text-stone-900">{address.fullName || "—"}</p>
          <p>{address.phone || "—"}</p>
          <p>
            {address.line1 || ""}
            {address.line2 ? `, ${address.line2}` : ""}
          </p>
          <p>
            {address.city || ""}, {address.state || ""} {address.pincode || ""}
          </p>
          <p>{address.country || "India"}</p>
        </div>
      ) : (
        <p className="mt-2 text-sm text-stone-500">Not provided</p>
      )}
    </article>
  );
}

function OrderDetailsModal({
  order,
  saving,
  shipmentBusy,
  statusError,
  statusMessage,
  onClose,
  onSaveStatus,
  onSyncShipment
}: {
  order: AdminOrder;
  saving: boolean;
  shipmentBusy: boolean;
  statusError: string;
  statusMessage: string;
  onClose: () => void;
  onSaveStatus: (payload: {
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    shippingStatus: ShippingStatus;
  }) => Promise<void>;
  onSyncShipment: (orderId: string) => Promise<void>;
}) {
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(order.orderStatus);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(order.paymentStatus);
  const [shippingStatus, setShippingStatus] = useState<ShippingStatus>(order.shippingStatus);

  useEffect(() => {
    setOrderStatus(order.orderStatus);
    setPaymentStatus(order.paymentStatus);
    setShippingStatus(order.shippingStatus);
  }, [order.id, order.orderStatus, order.paymentStatus, order.shippingStatus]);

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
    <div
      className="fixed inset-0 z-[130] flex items-end bg-black/45 p-0 backdrop-blur-[2px] sm:items-center sm:justify-center sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Order details ${order.orderNumber}`}
        className="relative h-[90vh] w-full overflow-hidden rounded-t-3xl border border-stone-200 bg-[#f8f5f0] shadow-2xl sm:h-auto sm:max-h-[90vh] sm:max-w-6xl sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-stone-200 px-4 py-4 sm:px-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">Order Details</p>
            <h3 className="mt-1 font-heading text-2xl text-stone-900 sm:text-3xl">{order.orderNumber}</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusBadge status={order.orderStatus} />
              <StatusBadge status={order.paymentStatus} />
              <StatusBadge status={order.shippingStatus} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700 transition hover:bg-stone-100"
            aria-label="Close order details"
          >
            <X size={18} />
          </button>
        </div>

        <div className="h-[calc(90vh-100px)] overflow-y-auto px-4 py-4 sm:h-auto sm:max-h-[calc(90vh-100px)] sm:px-6 sm:py-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">Order Total</p>
              <p className="mt-1 font-heading text-2xl text-stone-900">{formatCurrency(order.total)}</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">Items</p>
              <p className="mt-1 font-heading text-2xl text-stone-900">{order.items.length}</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">Created On</p>
              <p className="mt-1 text-sm font-medium text-stone-900">{formatDateOnly(order.createdAt)}</p>
            </article>
            <article className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">Last Updated</p>
              <p className="mt-1 text-sm font-medium text-stone-900">{formatDateOnly(order.updatedAt)}</p>
            </article>
          </div>

          <section className="mt-5 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
            <h4 className="font-heading text-lg text-stone-900">Customer</h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <article className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">Name</p>
                <p className="mt-1 text-sm font-medium text-stone-900">{order.customer.name || "Not provided"}</p>
              </article>
              <article className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">Email</p>
                <p className="mt-1 break-words text-sm font-medium text-stone-900">{order.customer.email || "Not provided"}</p>
              </article>
              <article className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">Phone</p>
                <p className="mt-1 text-sm font-medium text-stone-900">{order.customer.phone || "Not provided"}</p>
              </article>
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
            <h4 className="font-heading text-lg text-stone-900">Status Management</h4>
            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              <label>
                <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-stone-500">Order Status</span>
                <CustomSelect
                  value={orderStatus}
                  onValueChange={(value) => setOrderStatus(value as OrderStatus)}
                  options={ORDER_STATUS_OPTIONS.map((status) => ({
                    value: status,
                    label: statusLabel(status)
                  }))}
                  buttonClassName="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-500"
                  menuClassName="w-full"
                />
              </label>
              <label>
                <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-stone-500">Payment Status</span>
                <CustomSelect
                  value={paymentStatus}
                  onValueChange={(value) => setPaymentStatus(value as PaymentStatus)}
                  options={PAYMENT_STATUS_OPTIONS.map((status) => ({
                    value: status,
                    label: statusLabel(status)
                  }))}
                  buttonClassName="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-500"
                  menuClassName="w-full"
                />
              </label>
              <label>
                <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-stone-500">Shipping Status</span>
                <CustomSelect
                  value={shippingStatus}
                  onValueChange={(value) => setShippingStatus(value as ShippingStatus)}
                  options={SHIPPING_STATUS_OPTIONS.map((status) => ({
                    value: status,
                    label: statusLabel(status)
                  }))}
                  buttonClassName="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-500"
                  menuClassName="w-full"
                />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onSaveStatus({ orderStatus, paymentStatus, shippingStatus })}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black disabled:opacity-70"
              >
                <Check size={16} />
                {saving ? "Saving..." : "Save Status Updates"}
              </button>
              {statusMessage ? <p className="text-sm text-emerald-700">{statusMessage}</p> : null}
              {statusError ? <p className="text-sm text-rose-700">{statusError}</p> : null}
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
            <h4 className="font-heading text-lg text-stone-900">Address Details</h4>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <AddressCard title="Shipping Address" address={order.shippingAddress} />
              <AddressCard title="Billing Address" address={order.billingAddress} />
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <ClipboardList size={16} className="text-stone-500" />
              <h4 className="font-heading text-lg text-stone-900">Order Items</h4>
            </div>
            {order.items.length === 0 ? (
              <p className="mt-3 text-sm text-stone-600">No items found in this order.</p>
            ) : (
              <div className="mt-3 space-y-2">
                {order.items.map((item) => (
                  <article key={item.id} className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-stone-900">{item.productName}</p>
                        <p className="mt-1 text-xs text-stone-500">SKU: {item.sku}</p>
                      </div>
                      <p className="whitespace-nowrap text-sm font-medium text-stone-900">{formatCurrency(item.totalPrice)}</p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-stone-600">
                      <p>Qty: <span className="font-medium text-stone-900">{item.quantity}</span></p>
                      <p>Unit: <span className="font-medium text-stone-900">{formatCurrency(item.unitPrice)}</span></p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-2">
            <article className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-stone-500" />
                <h4 className="font-heading text-lg text-stone-900">Payment Logs</h4>
              </div>
              {order.payments.length === 0 ? (
                <p className="mt-3 text-sm text-stone-600">No payment records available.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {order.payments.map((payment) => (
                    <article key={payment.id} className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-stone-900">{payment.provider}</p>
                        <StatusBadge status={payment.status} />
                      </div>
                      <p className="mt-2 text-sm font-medium text-stone-900">{formatCurrency(payment.amount)}</p>
                      <div className="mt-2 space-y-1 text-xs text-stone-600">
                        <p>Razorpay Order ID: {payment.razorpayOrderId || "—"}</p>
                        <p>Razorpay Payment ID: {payment.razorpayPaymentId || "—"}</p>
                        <p>Paid At: {formatDateTime(payment.paidAt)}</p>
                        <p>Log Time: {formatDateTime(payment.createdAt)}</p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </article>

            <article className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-stone-500" />
                  <h4 className="font-heading text-lg text-stone-900">Shipment Details</h4>
                </div>
                <button
                  type="button"
                  onClick={() => void onSyncShipment(order.id)}
                  disabled={shipmentBusy || (!order.shipment && order.paymentStatus !== "PAID")}
                  className="inline-flex items-center rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-stone-700 transition hover:border-stone-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {shipmentBusy
                    ? "Syncing..."
                    : !order.shipment && order.paymentStatus !== "PAID"
                      ? "Awaiting Successful Payment"
                      : order.shipment
                        ? "Refresh Sequel Tracking"
                        : "Create Sequel Shipment"}
                </button>
              </div>
              {!order.shipment ? (
                <p className="mt-3 text-sm text-stone-600">
                  {order.paymentStatus === "PAID"
                    ? "Shipment not created yet. Create one to generate the Sequel docket and tracking link."
                    : "Shipment creation is locked until payment is marked successful."}
                </p>
              ) : (
                <div className="mt-3 space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={order.shipment.status} />
                  </div>
                  <p>Provider: <span className="font-medium text-stone-900">{order.shipment.shippingProvider}</span></p>
                  <p>Courier: <span className="font-medium text-stone-900">{order.shipment.courierName || "—"}</span></p>
                  <p>Shipment ID: <span className="font-medium text-stone-900">{order.shipment.shipmentId || "—"}</span></p>
                  <p>AWB: <span className="font-medium text-stone-900">{order.shipment.awbCode || "—"}</span></p>
                  <p>ETA: <span className="font-medium text-stone-900">{formatDateOnly(order.shipment.estimatedDeliveryDate)}</span></p>
                  {order.shipment.trackingUrl ? (
                    <a
                      href={order.shipment.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block text-xs font-medium text-stone-700 underline"
                    >
                      Open tracking link
                    </a>
                  ) : null}
                </div>
              )}
            </article>
          </section>

          <section className="mt-5 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
            <h4 className="font-heading text-lg text-stone-900">Billing Breakdown</h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <article className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">Subtotal</p>
                <p className="mt-1 text-sm font-semibold text-stone-900">{formatCurrency(order.subtotal)}</p>
              </article>
              <article className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">Shipping Charge</p>
                <p className="mt-1 text-sm font-semibold text-stone-900">{formatCurrency(order.shippingCharge)}</p>
              </article>
              <article className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">Discount</p>
                <p className="mt-1 text-sm font-semibold text-stone-900">- {formatCurrency(order.discount)}</p>
              </article>
              <article className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">Grand Total</p>
                <p className="mt-1 text-sm font-semibold text-stone-900">{formatCurrency(order.total)}</p>
              </article>
            </div>
            {order.notes ? (
              <div className="mt-3 rounded-xl border border-stone-200 bg-stone-50 p-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-stone-500">Notes</p>
                <p className="mt-1 text-sm text-stone-800">{order.notes}</p>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}

export function AdminOrdersManager({ initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [query, setQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<"all" | OrderStatus>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<"all" | PaymentStatus>("all");
  const [shippingStatusFilter, setShippingStatusFilter] = useState<"all" | ShippingStatus>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "high-total" | "low-total">("newest");
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [shipmentBusy, setShipmentBusy] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const list = orders.filter((order) => {
      const haystack = [
        order.orderNumber,
        order.customer.name || "",
        order.customer.email || "",
        order.customer.phone || "",
        ...order.items.map((item) => item.productName),
        ...order.items.map((item) => item.sku)
      ]
        .join(" ")
        .toLowerCase();

      const matchQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      const matchOrderStatus = orderStatusFilter === "all" || order.orderStatus === orderStatusFilter;
      const matchPaymentStatus = paymentStatusFilter === "all" || order.paymentStatus === paymentStatusFilter;
      const matchShippingStatus = shippingStatusFilter === "all" || order.shippingStatus === shippingStatusFilter;
      return matchQuery && matchOrderStatus && matchPaymentStatus && matchShippingStatus;
    });

    list.sort((a, b) => {
      if (sortBy === "newest") return +new Date(b.createdAt) - +new Date(a.createdAt);
      if (sortBy === "oldest") return +new Date(a.createdAt) - +new Date(b.createdAt);
      if (sortBy === "high-total") return b.total - a.total;
      return a.total - b.total;
    });

    return list;
  }, [orders, paymentStatusFilter, query, shippingStatusFilter, sortBy, orderStatusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [query, orderStatusFilter, paymentStatusFilter, shippingStatusFilter, sortBy]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageOrders = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, page]);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) || null,
    [orders, selectedOrderId]
  );

  const handleStatusSave = async (payload: {
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    shippingStatus: ShippingStatus;
  }) => {
    if (!selectedOrder) return;
    setSavingStatus(true);
    setStatusError("");
    setStatusMessage("");

    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = (await res.json()) as {
        success: boolean;
        message?: string;
        order?: {
          id: string;
          orderStatus: OrderStatus;
          paymentStatus: PaymentStatus;
          shippingStatus: ShippingStatus;
          updatedAt: string;
          shipmentStatus?: ShippingStatus | null;
        };
      };

      if (!res.ok || !data.success || !data.order) {
        setStatusError(data.message || "Unable to update order status.");
        return;
      }

      setOrders((current) =>
        current.map((order) => {
          if (order.id !== data.order!.id) return order;
          return {
            ...order,
            orderStatus: data.order!.orderStatus,
            paymentStatus: data.order!.paymentStatus,
            shippingStatus: data.order!.shippingStatus,
            updatedAt: data.order!.updatedAt,
            shipment: order.shipment
              ? { ...order.shipment, status: data.order!.shipmentStatus || data.order!.shippingStatus }
              : order.shipment
          };
        })
      );
      setStatusMessage("Order status updated successfully.");
    } catch {
      setStatusError("Unable to update order status.");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleShipmentSync = async (orderId: string) => {
    setShipmentBusy(true);
    setStatusError("");
    setStatusMessage("");

    try {
      const res = await fetch("/api/shipping/create-shipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId })
      });

      const data = (await res.json()) as {
        success: boolean;
        message?: string;
        order?: {
          id: string;
          shippingStatus: ShippingStatus;
        };
        shipment?: ShipmentItem;
      };

      if (!res.ok || !data.success || !data.order) {
        setStatusError(data.message || "Unable to sync shipment with Sequel.");
        return;
      }

      setOrders((current) =>
        current.map((order) => {
          if (order.id !== data.order!.id) return order;
          return {
            ...order,
            shippingStatus: data.order!.shippingStatus,
            shipment: data.shipment || order.shipment,
            updatedAt: new Date().toISOString()
          };
        })
      );
      setStatusMessage(data.message || "Shipment synced successfully.");
    } catch {
      setStatusError("Unable to sync shipment with Sequel.");
    } finally {
      setShipmentBusy(false);
    }
  };

  return (
    <>
      <section className="card overflow-hidden p-0">
        <div className="border-b border-stone-200 px-5 py-4">
          <h3 className="font-heading text-2xl text-stone-900">Order Directory</h3>
          <p className="mt-1 text-sm text-stone-600">
            Production order data with full status tracking, payment logs, shipment details, and item breakdown.
          </p>
        </div>

        <div className="grid gap-3 border-b border-stone-200 bg-stone-50 px-5 py-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="xl:col-span-2">
            <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-stone-500">Search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Order no, customer, SKU, product"
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-500"
            />
          </label>
          <label>
            <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-stone-500">Order Status</span>
            <CustomSelect
              value={orderStatusFilter}
              onValueChange={(value) => setOrderStatusFilter(value as "all" | OrderStatus)}
              options={[
                { value: "all", label: "All" },
                ...ORDER_STATUS_OPTIONS.map((status) => ({ value: status, label: statusLabel(status) }))
              ]}
              buttonClassName="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-500"
              menuClassName="w-full"
            />
          </label>
          <label>
            <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-stone-500">Payment</span>
            <CustomSelect
              value={paymentStatusFilter}
              onValueChange={(value) => setPaymentStatusFilter(value as "all" | PaymentStatus)}
              options={[
                { value: "all", label: "All" },
                ...PAYMENT_STATUS_OPTIONS.map((status) => ({ value: status, label: statusLabel(status) }))
              ]}
              buttonClassName="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-500"
              menuClassName="w-full"
            />
          </label>
          <label>
            <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-stone-500">Shipping</span>
            <CustomSelect
              value={shippingStatusFilter}
              onValueChange={(value) => setShippingStatusFilter(value as "all" | ShippingStatus)}
              options={[
                { value: "all", label: "All" },
                ...SHIPPING_STATUS_OPTIONS.map((status) => ({ value: status, label: statusLabel(status) }))
              ]}
              buttonClassName="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-500"
              menuClassName="w-full"
            />
          </label>
        </div>

        <div className="grid gap-3 border-b border-stone-200 bg-stone-50 px-5 py-4 md:grid-cols-2 xl:grid-cols-5">
          <label>
            <span className="mb-1 block text-[11px] uppercase tracking-[0.14em] text-stone-500">Sort</span>
            <CustomSelect
              value={sortBy}
              onValueChange={(value) => setSortBy(value as "newest" | "oldest" | "high-total" | "low-total")}
              options={[
                { value: "newest", label: "Newest first" },
                { value: "oldest", label: "Oldest first" },
                { value: "high-total", label: "Highest order value" },
                { value: "low-total", label: "Lowest order value" }
              ]}
              buttonClassName="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 outline-none focus:border-stone-500"
              menuClassName="w-full"
            />
          </label>
        </div>

        <div className="border-b border-stone-200 px-5 py-3 text-sm text-stone-600">
          Showing <span className="font-medium text-stone-900">{pageOrders.length}</span> of{" "}
          <span className="font-medium text-stone-900">{filteredOrders.length}</span> orders
        </div>

        {pageOrders.length === 0 ? (
          <div className="px-5 py-8 text-sm text-stone-600">No orders found for selected filters.</div>
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full table-fixed text-left">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-[0.14em] text-stone-500">
                    <th className="w-[14%] px-5 py-3 font-medium">Order</th>
                    <th className="w-[21%] px-5 py-3 font-medium">Customer</th>
                    <th className="w-[10%] px-5 py-3 font-medium">Items</th>
                    <th className="w-[12%] px-5 py-3 font-medium">Total</th>
                    <th className="w-[14%] px-5 py-3 font-medium">Order Status</th>
                    <th className="w-[14%] px-5 py-3 font-medium">Payment</th>
                    <th className="w-[15%] px-5 py-3 font-medium">Shipping</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {pageOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => {
                        setStatusError("");
                        setStatusMessage("");
                        setSelectedOrderId(order.id);
                      }}
                      className="cursor-pointer align-top transition hover:bg-stone-50"
                    >
                      <td className="px-5 py-5">
                        <p className="text-sm font-semibold text-stone-900">{order.orderNumber}</p>
                        <p className="mt-1 text-xs text-stone-500">{formatDateOnly(order.createdAt)}</p>
                      </td>
                      <td className="px-5 py-5">
                        <p className="text-sm font-medium text-stone-900">{order.customer.name || "Unnamed User"}</p>
                        <p className="mt-1 break-words text-xs text-stone-500">{order.customer.email || "No email"}</p>
                      </td>
                      <td className="px-5 py-5 text-sm text-stone-700">{order.items.length}</td>
                      <td className="px-5 py-5 text-sm font-semibold text-stone-900">{formatCurrency(order.total)}</td>
                      <td className="px-5 py-5">
                        <StatusBadge status={order.orderStatus} />
                      </td>
                      <td className="px-5 py-5">
                        <StatusBadge status={order.paymentStatus} />
                      </td>
                      <td className="px-5 py-5">
                        <StatusBadge status={order.shippingStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-stone-200 md:hidden">
              {pageOrders.map((order) => (
                <article
                  key={order.id}
                  onClick={() => {
                    setStatusError("");
                    setStatusMessage("");
                    setSelectedOrderId(order.id);
                  }}
                  className="cursor-pointer space-y-2 px-5 py-4 transition hover:bg-stone-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-stone-900">{order.orderNumber}</p>
                      <p className="mt-1 text-xs text-stone-500">{formatDateOnly(order.createdAt)}</p>
                    </div>
                    <p className="text-sm font-semibold text-stone-900">{formatCurrency(order.total)}</p>
                  </div>
                  <p className="text-sm font-medium text-stone-900">{order.customer.name || "Unnamed User"}</p>
                  <p className="break-words text-xs text-stone-500">{order.customer.email || "No email"}</p>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={order.orderStatus} />
                    <StatusBadge status={order.paymentStatus} />
                    <StatusBadge status={order.shippingStatus} />
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        <AdminPagination
          page={page}
          totalPages={totalPages}
          totalItems={filteredOrders.length}
          pageSize={PAGE_SIZE}
          currentCount={pageOrders.length}
          onPageChange={setPage}
          itemLabel="orders"
        />
      </section>

      {selectedOrder ? (
        <OrderDetailsModal
          order={selectedOrder}
          saving={savingStatus}
          shipmentBusy={shipmentBusy}
          statusError={statusError}
          statusMessage={statusMessage}
          onClose={() => setSelectedOrderId(null)}
          onSaveStatus={handleStatusSave}
          onSyncShipment={handleShipmentSync}
        />
      ) : null}
    </>
  );
}
