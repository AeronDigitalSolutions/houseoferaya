import { requireAdminPermission } from "@/lib/auth/admin-guard";
import { AdminShipmentsManager } from "@/components/admin/AdminShipmentsManager";
import { buildSequelTimeline, getSequelConfig, getTrackingDataFromRawPayload, isSequelConfigured } from "@/lib/sequel";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(value);
}

export default async function AdminShipmentsPage() {
  await requireAdminPermission("canViewShipments");
  const sequelConfig = getSequelConfig();

  const orderRows = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
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
          totalPrice: true
        }
      },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          provider: true,
          status: true,
          amount: true,
          razorpayOrderId: true,
          razorpayPaymentId: true,
          paidAt: true
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
          rawPayload: true,
          createdAt: true,
          updatedAt: true
        }
      }
    }
  });

  const shipmentRows = orderRows.map((order) => {
    const rawTracking = getTrackingDataFromRawPayload(order.shipment?.rawPayload);
    const timeline = buildSequelTimeline(rawTracking?.tracking || []);
    const latestEvent = timeline[0] || null;
    const latestPayment = order.payments[0] || null;

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      total: Number(order.total),
      totalLabel: formatCurrency(Number(order.total)),
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      shippingStatus: order.shippingStatus,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      customer: {
        id: order.user.id,
        name: order.user.name || order.shippingFullName,
        email: order.user.email,
        phone: order.user.phone || order.shippingPhone
      },
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
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        totalPrice: Number(item.totalPrice)
      })),
      payment: latestPayment
        ? {
            provider: latestPayment.provider,
            status: latestPayment.status,
            amount: Number(latestPayment.amount),
            razorpayOrderId: latestPayment.razorpayOrderId,
            razorpayPaymentId: latestPayment.razorpayPaymentId,
            paidAt: latestPayment.paidAt ? latestPayment.paidAt.toISOString() : null
          }
        : null,
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
            updatedAt: order.shipment.updatedAt.toISOString(),
            timeline,
            latestEvent,
            rawStatus: rawTracking?.shipment_status || null
          }
        : null
    };
  });

  return (
    <div className="space-y-3">
      <AdminShipmentsManager
        shipments={shipmentRows}
        sequelConnected={isSequelConfigured()}
        sequelStoreCode={sequelConfig?.fromStoreCode || null}
        sequelEnvironment={sequelConfig?.baseUrl?.includes("test.sequel247.com") ? "UAT / Test" : "Production"}
      />
    </div>
  );
}
