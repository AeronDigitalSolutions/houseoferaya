"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Package2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { SafeImage } from "@/components/ui/SafeImage";
import { formatCurrency } from "@/lib/format";
import type { OrderStatus, PaymentStatus, ShippingStatus } from "@/lib/types";

type OrderItem = {
  id: string;
  orderNumber: string;
  total: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus;
  createdAt: string;
  leadItem: {
    name: string;
    quantity: number;
    image: string | null;
  } | null;
  itemCount: number;
  additionalItemCount: number;
};

function orderSummary(order: Pick<OrderItem, "paymentStatus" | "shippingStatus">) {
  if (order.paymentStatus !== "PAID") {
    return "Payment is pending. Shipment details will appear after successful payment.";
  }

  if (order.shippingStatus === "NOT_CREATED") {
    return "Payment is confirmed. Shipment details will appear once Sequel creates the shipment.";
  }

  if (order.shippingStatus === "READY_TO_SHIP") {
    return "Shipment has been created and is awaiting live courier updates.";
  }

  if (order.shippingStatus === "IN_TRANSIT") {
    return "Your shipment is in transit with live courier updates.";
  }

  if (order.shippingStatus === "DELIVERED") {
    return "Your shipment has been delivered successfully.";
  }

  if (order.shippingStatus === "RETURNED") {
    return "This shipment is marked as returned.";
  }

  return "Shipment updates will appear once Sequel starts returning them.";
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/account/orders", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) {
          setError(data?.message || "Unable to load orders.");
          return;
        }
        setOrders(data.orders || []);
      } catch {
        setError("Unable to load orders.");
      } finally {
        setLoading(false);
      }
    };

    void loadOrders();
  }, []);

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [orders]
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-3xl text-stone-900 sm:text-4xl">My Orders</h1>
        <p className="mt-2 text-sm text-stone-500">A cleaner view of every order, with quick access to payment and shipment details.</p>
      </div>

      {loading ? <div className="card p-4 text-sm text-stone-700">Loading orders...</div> : null}
      {error ? <div className="card p-4 text-sm text-rose-700">{error}</div> : null}

      {!loading && !error && sortedOrders.length === 0 ? (
        <div className="card p-5 text-sm text-stone-700">No orders yet. Your future purchases will show up here.</div>
      ) : null}

      <div className="space-y-4">
        {sortedOrders.map((order) => {
          return (
            <article
              key={order.id}
              className="overflow-hidden rounded-[1.8rem] border border-[#e6dac6] bg-[linear-gradient(180deg,#fffdf9_0%,#faf6ef_100%)] p-5 shadow-[0_14px_32px_rgba(109,84,38,0.06)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#dfc08b] bg-white/75 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f6a33]">
                    <Package2 size={14} />
                    {order.orderNumber}
                  </div>
                  <p className="mt-3 text-sm text-stone-500">
                    Ordered on {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(order.createdAt))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-stone-500">Order Total</p>
                  <p className="mt-2 font-heading text-2xl text-stone-900">{formatCurrency(Number(order.total))}</p>
                </div>
              </div>

              <div className="mt-5 rounded-[1.4rem] border border-[#eadcc3] bg-white/78 p-4">
                <div className="mb-4 flex items-center gap-4 rounded-[1.2rem] border border-stone-200 bg-[#fcfaf6] p-3">
                  <div className="h-16 w-16 overflow-hidden rounded-[1rem] border border-stone-200 bg-white">
                    {order.leadItem?.image ? (
                      <SafeImage
                        src={order.leadItem.image}
                        alt={order.leadItem.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-stone-100 text-stone-400">
                        <Package2 size={18} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-stone-900">{order.leadItem?.name || "Order item"}</p>
                    <p className="mt-1 text-xs text-stone-500">
                      Qty {order.leadItem?.quantity || 1}
                      {order.additionalItemCount > 0 ? ` • +${order.additionalItemCount} more item${order.additionalItemCount > 1 ? "s" : ""}` : ""}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-stone-600">{orderSummary(order)}</p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={order.paymentStatus} />
                  <StatusBadge status={order.shippingStatus} />
                </div>

                <Link
                  href={`/account/orders/${order.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                >
                  Track Order
                  <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
