import { NextRequest, NextResponse } from "next/server";
import { PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest } from "@/lib/auth/session";
import { verifyRazorpaySignature } from "@/lib/razorpay";

type VerifyPayload = {
  orderId?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
};

export async function POST(request: NextRequest) {
  const user = await getAuthUserFromRequest(request);
  if (!user || !user.isActive) {
    return NextResponse.json(
      { success: false, code: "AUTH_REQUIRED", message: "Please login to continue." },
      { status: 401 }
    );
  }

  let body: VerifyPayload = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const orderId = String(body.orderId || "").trim();
  const razorpayOrderId = String(body.razorpay_order_id || "").trim();
  const razorpayPaymentId = String(body.razorpay_payment_id || "").trim();
  const razorpaySignature = String(body.razorpay_signature || "").trim();

  if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return NextResponse.json(
      { success: false, message: "Missing payment verification fields." },
      { status: 400 }
    );
  }

  const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!isValid) {
    return NextResponse.json({ success: false, message: "Payment signature mismatch." }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: user.id
    },
    select: {
      id: true,
      userId: true,
      orderNumber: true
    }
  });

  if (!order) {
    return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
  }

  const payment = await prisma.payment.findFirst({
    where: {
      orderId,
      razorpayOrderId
    },
    select: {
      id: true
    }
  });

  if (!payment) {
    return NextResponse.json({ success: false, message: "Payment record not found." }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.PAID,
        razorpayPaymentId,
        razorpaySignature,
        paidAt: new Date(),
        rawPayload: body as unknown as object
      }
    });

    await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        orderStatus: "CONFIRMED"
      }
    });

    const cart = await tx.cart.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });

    if (cart) {
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
    }
  });

  return NextResponse.json({
    success: true,
    message: "Payment verified successfully.",
    order: {
      id: order.id,
      orderNumber: order.orderNumber
    }
  });
}
