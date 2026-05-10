import { notFound, redirect } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { getAuthUserFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

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
      shipment: true
    }
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl text-stone-900 sm:text-4xl">Order Details</h1>

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
          <div key={line.id} className="space-y-2 border-b border-stone-100 py-3 text-sm">
            <div className="flex items-center justify-between">
              <span>
                {line.productName} x {line.quantity}
              </span>
              <span>{formatCurrency(Number(line.totalPrice))}</span>
            </div>
            <div className="grid gap-1 text-xs text-stone-600 sm:grid-cols-2">
              <p>Metal value: {formatCurrency(Number(line.metalPriceUsed))}</p>
              <p>Making: {formatCurrency(Number(line.makingChargeUsed))}</p>
              <p>Stone: {formatCurrency(Number(line.stoneCostUsed))}</p>
              <p>HUID: {formatCurrency(Number(line.huidChargeUsed))}</p>
              <p>GST ({Number(line.gstPercentageUsed)}%): {formatCurrency(Number(line.gstAmountUsed))}</p>
              <p>Rate used: {formatCurrency(Number(line.metalRateUsed))}/g</p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card space-y-2 p-5 text-sm text-stone-700">
          <h3 className="font-heading text-xl text-stone-900">Address</h3>
          <p>{order.shippingFullName}</p>
          <p>{order.shippingLine1}</p>
          {order.shippingLine2 ? <p>{order.shippingLine2}</p> : null}
          <p>
            {order.shippingCity}, {order.shippingState} - {order.shippingPincode}
          </p>
          <p>{order.shippingPhone}</p>
        </div>

        <div className="card space-y-2 p-5 text-sm text-stone-700">
          <h3 className="font-heading text-xl text-stone-900">Payment Information</h3>
          <p>Status: {order.paymentStatus}</p>
          <p>Total Paid: {formatCurrency(Number(order.total))}</p>
          <p>Method: Razorpay / COD Placeholder</p>
        </div>
      </section>

      <section className="card space-y-2 p-5 text-sm text-stone-700">
        <h3 className="font-heading text-xl text-stone-900">Shipment Tracking</h3>
        <p>Provider: {order.shipment?.shippingProvider || "Not created yet"}</p>
        <p>Courier: {order.shipment?.courierName || "Pending"}</p>
        <p>AWB: {order.shipment?.awbCode || "Pending"}</p>
        <p>Tracking: {order.shipment?.trackingUrl || "Will be updated after dispatch"}</p>
      </section>
    </div>
  );
}
