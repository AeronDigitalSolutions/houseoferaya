import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminAuthFromRequest } from "@/lib/auth/admin-session";

type Params = { params: Promise<{ orderId: string }> };

const ORDER_STATUS = new Set([
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED"
]);

const PAYMENT_STATUS = new Set(["PENDING", "AUTHORIZED", "PAID", "FAILED", "REFUNDED"]);

const SHIPPING_STATUS = new Set(["NOT_CREATED", "READY_TO_SHIP", "IN_TRANSIT", "DELIVERED", "RETURNED"]);

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const admin = await getAdminAuthFromRequest(request);
    if (!admin || !admin.isActive) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }
    if (admin.role !== "SUPER_ADMIN" && !admin.permissions.canViewOrders) {
      return NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 });
    }

    const { orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ success: false, message: "Order id is required." }, { status: 400 });
    }

    const payload = (await request.json()) as {
      orderStatus?: string;
      paymentStatus?: string;
      shippingStatus?: string;
    };

    const data: {
      orderStatus?: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
      paymentStatus?: "PENDING" | "AUTHORIZED" | "PAID" | "FAILED" | "REFUNDED";
      shippingStatus?: "NOT_CREATED" | "READY_TO_SHIP" | "IN_TRANSIT" | "DELIVERED" | "RETURNED";
    } = {};

    if (payload.orderStatus !== undefined) {
      if (!ORDER_STATUS.has(payload.orderStatus)) {
        return NextResponse.json({ success: false, message: "Invalid order status." }, { status: 400 });
      }
      data.orderStatus = payload.orderStatus as typeof data.orderStatus;
    }

    if (payload.paymentStatus !== undefined) {
      if (!PAYMENT_STATUS.has(payload.paymentStatus)) {
        return NextResponse.json({ success: false, message: "Invalid payment status." }, { status: 400 });
      }
      data.paymentStatus = payload.paymentStatus as typeof data.paymentStatus;
    }

    if (payload.shippingStatus !== undefined) {
      if (!SHIPPING_STATUS.has(payload.shippingStatus)) {
        return NextResponse.json({ success: false, message: "Invalid shipping status." }, { status: 400 });
      }
      data.shippingStatus = payload.shippingStatus as typeof data.shippingStatus;
    }

    if (!data.orderStatus && !data.paymentStatus && !data.shippingStatus) {
      return NextResponse.json({ success: false, message: "Nothing to update." }, { status: 400 });
    }

    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        shipment: {
          select: {
            id: true
          }
        }
      }
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data,
      select: {
        id: true,
        orderStatus: true,
        paymentStatus: true,
        shippingStatus: true,
        updatedAt: true
      }
    });

    let shipmentStatus: string | null = null;
    if (data.shippingStatus) {
      if (existing.shipment?.id) {
        const shipment = await prisma.shipment.update({
          where: { orderId: orderId },
          data: { status: data.shippingStatus },
          select: { status: true }
        });
        shipmentStatus = shipment.status;
      } else if (data.shippingStatus !== "NOT_CREATED") {
        const shipment = await prisma.shipment.create({
          data: {
            orderId: orderId,
            shippingProvider: "MANUAL",
            status: data.shippingStatus
          },
          select: { status: true }
        });
        shipmentStatus = shipment.status;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully.",
      order: {
        id: updated.id,
        orderStatus: updated.orderStatus,
        paymentStatus: updated.paymentStatus,
        shippingStatus: updated.shippingStatus,
        shipmentStatus,
        updatedAt: updated.updatedAt.toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to update order." },
      { status: 500 }
    );
  }
}
