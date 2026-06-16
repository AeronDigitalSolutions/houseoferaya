import { ShippingStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getAdminAuthFromRequest } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";
import {
  createSequelShipment,
  extractDocketNumber,
  extractEstimatedDeliveryDate,
  extractTrackingUrl,
  mapSequelShipmentStatus,
  toSequelRawPayload,
  trackSequelShipment
} from "@/lib/sequel";

function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function POST(request: NextRequest) {
  const admin = await getAdminAuthFromRequest(request);
  if (!admin || !admin.isActive || !admin.permissions.canViewShipments) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const orderId = String(body?.orderId || "").trim();
    const pickUpDate = body?.pickUpDate ? String(body.pickUpDate).trim() : null;
    const pickUpTime = body?.pickUpTime ? String(body.pickUpTime).trim() : null;

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order ID is required." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1
        },
        shipment: true
      }
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }

    if (order.paymentStatus !== "PAID") {
      return NextResponse.json(
        {
          success: false,
          message: "Shipment can only be created after successful payment."
        },
        { status: 409 }
      );
    }

    if (order.shipment?.awbCode) {
      const tracked = await trackSequelShipment(order.shipment.awbCode).catch(() => null);
      const remoteStatus = tracked?.data?.shipment_status ? mapSequelShipmentStatus(tracked.data.shipment_status) : order.shipment.status;
      const estimatedDeliveryDate = tracked?.data ? extractEstimatedDeliveryDate(tracked.data) : order.shipment.estimatedDeliveryDate;
      const trackingUrl = tracked?.data ? extractTrackingUrl(tracked.data) : order.shipment.trackingUrl;

      const updatedShipment = await prisma.shipment.update({
        where: { id: order.shipment.id },
        data: {
          courierName: "Sequel",
          trackingUrl: trackingUrl || order.shipment.trackingUrl,
          estimatedDeliveryDate: estimatedDeliveryDate || order.shipment.estimatedDeliveryDate,
          rawPayload: toSequelRawPayload(tracked || order.shipment.rawPayload),
          status: remoteStatus
        }
      });

      if (order.shippingStatus !== remoteStatus) {
        await prisma.order.update({ where: { id: order.id }, data: { shippingStatus: remoteStatus } });
      }

      return NextResponse.json({
        success: true,
        message: "Shipment already exists for this order.",
        order: {
          id: order.id,
          shippingStatus: remoteStatus
        },
        shipment: updatedShipment
      });
    }

    const totalNetWeight = order.items.reduce((sum, item) => sum + toNumber(item.weightGramsUsed) * item.quantity, 0);
    const isSilverShipment = order.items.every((item) => item.baseMetalUsed === "SILVER");
    const latestPayment = order.payments[0] || null;
    const codValue = latestPayment?.provider === "COD" ? toNumber(order.total) : null;

    const created = await createSequelShipment({
      consigneeName: order.shippingFullName,
      addressLine1: order.shippingLine1,
      addressLine2: order.shippingLine2,
      pinCode: order.shippingPincode,
      receiverName: order.shippingFullName,
      receiverPhone: order.shippingPhone,
      netWeight: Math.max(totalNetWeight, 1),
      grossWeight: Math.max(totalNetWeight, 1),
      netValue: toNumber(order.total),
      invoiceNumbers: [order.orderNumber],
      remark: `House of Eraya order ${order.orderNumber}`,
      pickUpDate,
      pickUpTime,
      codValue,
      isSilverShipment
    });

    const docketNumber = extractDocketNumber(created.data);
    if (!docketNumber) {
      return NextResponse.json(
        { success: false, message: "Sequel shipment was created but no docket number was returned." },
        { status: 502 }
      );
    }

    const sequelStatus = mapSequelShipmentStatus(created.data?.shipment_status || "SCREATED");
    const estimatedDeliveryDate = extractEstimatedDeliveryDate(created.data);
    const trackingUrl = extractTrackingUrl(created.data);

    const [shipment] = await prisma.$transaction([
      prisma.shipment.upsert({
        where: { orderId: order.id },
        update: {
          shippingProvider: "MANUAL",
          shipmentId: docketNumber,
          awbCode: docketNumber,
          courierName: "Sequel",
          trackingUrl,
          status: sequelStatus,
          estimatedDeliveryDate,
          rawPayload: toSequelRawPayload(created)
        },
        create: {
          orderId: order.id,
          shippingProvider: "MANUAL",
          shipmentId: docketNumber,
          awbCode: docketNumber,
          courierName: "Sequel",
          trackingUrl,
          status: sequelStatus,
          estimatedDeliveryDate,
          rawPayload: toSequelRawPayload(created)
        }
      }),
      prisma.order.update({
        where: { id: order.id },
        data: {
          shippingStatus: sequelStatus,
          ...(order.orderStatus === "CONFIRMED" || order.orderStatus === "PROCESSING"
            ? { orderStatus: "SHIPPED" }
            : {})
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      message: "Shipment created successfully with Sequel.",
      order: {
        id: order.id,
        shippingStatus: sequelStatus as ShippingStatus
      },
      shipment
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to create shipment."
      },
      { status: 500 }
    );
  }
}
