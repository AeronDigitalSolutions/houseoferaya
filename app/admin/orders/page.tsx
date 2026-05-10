import { requireAdminPermission } from "@/lib/auth/admin-guard";
import { AdminOrdersManager } from "@/components/admin/AdminOrdersManager";
import { prisma } from "@/lib/prisma";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(value);
}

export default async function AdminOrdersPage() {
  await requireAdminPermission("canViewOrders");

  const orderRows = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      subtotal: true,
      shippingCharge: true,
      discount: true,
      total: true,
      orderStatus: true,
      paymentStatus: true,
      shippingStatus: true,
      shippingFullName: true,
      shippingPhone: true,
      shippingLine1: true,
      shippingLine2: true,
      shippingCity: true,
      shippingState: true,
      shippingCountry: true,
      shippingPincode: true,
      billingFullName: true,
      billingPhone: true,
      billingLine1: true,
      billingLine2: true,
      billingCity: true,
      billingState: true,
      billingCountry: true,
      billingPincode: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      },
      items: {
        select: {
          id: true,
          productName: true,
          sku: true,
          quantity: true,
          unitPrice: true,
          totalPrice: true
        }
      },
      payments: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          provider: true,
          status: true,
          amount: true,
          razorpayOrderId: true,
          razorpayPaymentId: true,
          paidAt: true,
          createdAt: true
        }
      },
      shipment: {
        select: {
          id: true,
          shippingProvider: true,
          shipmentId: true,
          awbCode: true,
          courierName: true,
          trackingUrl: true,
          status: true,
          estimatedDeliveryDate: true,
          createdAt: true,
          updatedAt: true
        }
      }
    }
  });

  const orders = orderRows.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    subtotal: Number(order.subtotal),
    shippingCharge: Number(order.shippingCharge),
    discount: Number(order.discount),
    total: Number(order.total),
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    shippingStatus: order.shippingStatus,
    shippingAddress: {
      fullName: order.shippingFullName,
      phone: order.shippingPhone,
      line1: order.shippingLine1,
      line2: order.shippingLine2,
      city: order.shippingCity,
      state: order.shippingState,
      country: order.shippingCountry,
      pincode: order.shippingPincode
    },
    billingAddress: {
      fullName: order.billingFullName,
      phone: order.billingPhone,
      line1: order.billingLine1,
      line2: order.billingLine2,
      city: order.billingCity,
      state: order.billingState,
      country: order.billingCountry,
      pincode: order.billingPincode
    },
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    customer: {
      id: order.user.id,
      name: order.user.name,
      email: order.user.email,
      phone: order.user.phone
    },
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice)
    })),
    payments: order.payments.map((payment) => ({
      id: payment.id,
      provider: payment.provider,
      status: payment.status,
      amount: Number(payment.amount),
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: payment.razorpayPaymentId,
      paidAt: payment.paidAt ? payment.paidAt.toISOString() : null,
      createdAt: payment.createdAt.toISOString()
    })),
    shipment: order.shipment
      ? {
          id: order.shipment.id,
          shippingProvider: order.shipment.shippingProvider,
          shipmentId: order.shipment.shipmentId,
          awbCode: order.shipment.awbCode,
          courierName: order.shipment.courierName,
          trackingUrl: order.shipment.trackingUrl,
          status: order.shipment.status,
          estimatedDeliveryDate: order.shipment.estimatedDeliveryDate
            ? order.shipment.estimatedDeliveryDate.toISOString()
            : null,
          createdAt: order.shipment.createdAt.toISOString(),
          updatedAt: order.shipment.updatedAt.toISOString()
        }
      : null
  }));

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter((order) =>
    ["PENDING", "CONFIRMED", "PROCESSING"].includes(order.orderStatus)
  ).length;
  const inTransitOrders = orders.filter((order) => order.shippingStatus === "IN_TRANSIT").length;
  const paidOrders = orders.filter((order) => order.paymentStatus === "PAID").length;

  return (
    <div className="space-y-5">
      <h2 className="font-heading text-3xl text-stone-900 sm:text-4xl">Orders</h2>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <article className="card p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-stone-500">Total Orders</p>
          <p className="mt-2 font-heading text-3xl text-stone-900">{totalOrders}</p>
        </article>
        <article className="card p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-stone-500">Pending Flow</p>
          <p className="mt-2 font-heading text-3xl text-stone-900">{pendingOrders}</p>
        </article>
        <article className="card p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-stone-500">In Transit</p>
          <p className="mt-2 font-heading text-3xl text-stone-900">{inTransitOrders}</p>
        </article>
        <article className="card p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-stone-500">Paid Orders</p>
          <p className="mt-2 font-heading text-3xl text-stone-900">{paidOrders}</p>
        </article>
        <article className="card p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-stone-500">Total Value</p>
          <p className="mt-2 font-heading text-2xl text-stone-900">{formatCurrency(totalRevenue)}</p>
        </article>
      </section>

      <AdminOrdersManager initialOrders={orders} />
    </div>
  );
}
