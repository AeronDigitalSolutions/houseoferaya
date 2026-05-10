"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
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
};

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

  return (
    <div className="space-y-5">
      <h1 className="font-heading text-3xl text-stone-900 sm:text-4xl">My Orders</h1>

      {loading ? <div className="card p-4 text-sm text-stone-700">Loading orders...</div> : null}
      {error ? <div className="card p-4 text-sm text-rose-700">{error}</div> : null}

      {!loading && !error && orders.length === 0 ? (
        <div className="card p-5 text-sm text-stone-700">No orders yet. Your future purchases will show up here.</div>
      ) : null}

      <div className="space-y-3">
        {orders.map((order) => (
          <article key={order.id} className="card space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-stone-900">{order.orderNumber}</p>
                <p className="text-xs text-stone-500">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
              </div>
              <p className="text-sm font-semibold text-stone-900">{formatCurrency(Number(order.total))}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <StatusBadge status={order.orderStatus} />
              <StatusBadge status={order.paymentStatus} />
              <StatusBadge status={order.shippingStatus} />
            </div>

            <Link href={`/account/orders/${order.id}`} className="inline-block text-xs text-stone-600 underline">
              View Details
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
