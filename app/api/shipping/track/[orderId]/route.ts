import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildSequelTimeline,
  extractEstimatedDeliveryDate,
  extractTrackingUrl,
  getTrackingDataFromRawPayload,
  mapSequelShipmentStatus,
  toSequelRawPayload,
  trackSequelShipment
} from "@/lib/sequel";

type Params = { params: Promise<{ orderId: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  try {
    const { orderId } = await params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }]
      },
      include: {
        shipment: true
      }
    });

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }

    if (order.paymentStatus !== "PAID") {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        shipment: null,
        message: "Shipment details will appear after successful payment."
      });
    }

    if (!order.shipment?.awbCode) {
      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        shipment: null
      });
    }

    let trackingPayload = getTrackingDataFromRawPayload(order.shipment.rawPayload);

    try {
      const live = await trackSequelShipment(order.shipment.awbCode);
      trackingPayload = live.data || trackingPayload;

      const liveStatus = mapSequelShipmentStatus(live.data?.shipment_status);
      const estimatedDeliveryDate = extractEstimatedDeliveryDate(live.data);
      const trackingUrl = extractTrackingUrl(live.data);

      await prisma.$transaction([
        prisma.shipment.update({
          where: { id: order.shipment.id },
          data: {
            courierName: "Sequel",
            status: liveStatus,
            estimatedDeliveryDate,
            trackingUrl: trackingUrl || order.shipment.trackingUrl,
            rawPayload: toSequelRawPayload(live)
          }
        }),
        prisma.order.update({
          where: { id: order.id },
          data: {
            shippingStatus: liveStatus
          }
        })
      ]);
    } catch {
      trackingPayload = getTrackingDataFromRawPayload(order.shipment.rawPayload);
    }

    const finalStatus = trackingPayload?.shipment_status
      ? mapSequelShipmentStatus(trackingPayload.shipment_status)
      : order.shippingStatus;

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      shipment: {
        courierName: order.shipment.courierName || "Sequel",
        awbCode: order.shipment.awbCode,
        trackingUrl: extractTrackingUrl(trackingPayload) || order.shipment.trackingUrl,
        status: finalStatus,
        estimatedDeliveryDate:
          extractEstimatedDeliveryDate(trackingPayload)?.toISOString() || order.shipment.estimatedDeliveryDate?.toISOString() || null,
        timeline: buildSequelTimeline(trackingPayload?.tracking || [])
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to fetch shipment tracking."
      },
      { status: 500 }
    );
  }
}
