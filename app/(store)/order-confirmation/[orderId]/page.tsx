import Link from "next/link";
import { PaymentStatus } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { getAuthUserFromCookies } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

function getPaymentMessage(status: PaymentStatus) {
  if (status === PaymentStatus.PAID) {
    return "Payment received successfully. Your order is confirmed and moving into preparation.";
  }
  if (status === PaymentStatus.AUTHORIZED) {
    return "Payment is authorized and awaiting final settlement confirmation.";
  }
  if (status === PaymentStatus.FAILED) {
    return "Payment did not go through. If money was debited, it should reverse automatically as per your bank timeline.";
  }
  if (status === PaymentStatus.REFUNDED) {
    return "This payment has been refunded. You can review the order details and support notes from your account.";
  }
  return "Your order has been created and payment confirmation is still pending.";
}

export default async function OrderConfirmationPage({ params }: { params: Promise<{ orderId: string }> }) {
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
    select: {
      id: true,
      orderNumber: true,
      orderStatus: true,
      paymentStatus: true,
      createdAt: true,
      shippingStatus: true
    }
  });

  if (!order) {
    notFound();
  }

  const estimatedDelivery = new Date(order.createdAt);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-heading text-3xl sm:text-4xl text-stone-900">Order Confirmation</h1>

      <section className="card space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-stone-600">Order ID: {order.orderNumber}</p>
          <StatusBadge status={order.orderStatus} />
          <StatusBadge status={order.paymentStatus} />
        </div>
        <p className="text-sm text-stone-600">Estimated Delivery: {estimatedDelivery.toLocaleDateString("en-IN")}</p>
        <p className="text-sm text-stone-600">{getPaymentMessage(order.paymentStatus)}</p>

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
