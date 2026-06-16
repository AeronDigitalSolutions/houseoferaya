import { NextRequest, NextResponse } from "next/server";
import { PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAuthUserFromRequest } from "@/lib/auth/session";
import { prepareCheckoutOrder } from "@/lib/checkout/prepare-checkout-order";
import { getRazorpayClient, getRazorpayPublicKeyId } from "@/lib/razorpay";

function toErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to create Razorpay order.";
}

export async function POST(request: NextRequest) {
  const user = await getAuthUserFromRequest(request);
  if (!user || !user.isActive) {
    return NextResponse.json(
      { success: false, code: "AUTH_REQUIRED", message: "Please login to continue." },
      { status: 401 }
    );
  }

  let body: { addressId?: string; notes?: string; couponCode?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    const prepared = await prepareCheckoutOrder({
      userId: user.id,
      addressId: body.addressId,
      notes: body.notes,
      couponCode: body.couponCode
    });

    if (prepared.amountPaise < 100) {
      return NextResponse.json(
        { success: false, message: "Minimum payable amount is ₹1.00." },
        { status: 400 }
      );
    }

    const razorpay = getRazorpayClient();
    const razorpayOrder = await razorpay.orders.create({
      amount: prepared.amountPaise,
      currency: prepared.currency,
      receipt: prepared.order.orderNumber,
      notes: {
        localOrderId: prepared.order.id,
        localOrderNumber: prepared.order.orderNumber,
        customerId: user.id
      }
    });

    await prisma.payment.create({
      data: {
        orderId: prepared.order.id,
        provider: "RAZORPAY",
        razorpayOrderId: razorpayOrder.id,
        status: PaymentStatus.PENDING,
        amount: prepared.amountRupees,
        rawPayload: razorpayOrder as unknown as object
      }
    });

    return NextResponse.json({
      success: true,
      orderId: prepared.order.id,
      orderNumber: prepared.order.orderNumber,
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: getRazorpayPublicKeyId(),
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      subtotal: prepared.subtotal,
      shippingCharge: prepared.shippingCharge,
      discount: prepared.discount,
      total: prepared.total
    });
  } catch (error: any) {
    const statusCode = Number(error?.statusCode || error?.status || 0);

    if (statusCode === 401) {
      return NextResponse.json(
        {
          success: false,
          code: "RAZORPAY_AUTH_FAILED",
          message: "Razorpay authentication failed. Please verify credentials."
        },
        { status: 502 }
      );
    }

    const message = toErrorMessage(error);
    const isClientIssue =
      message.includes("Please add/select") ||
      message.includes("Your cart is empty") ||
      message.includes("Minimum payable amount");

    return NextResponse.json(
      { success: false, message: isClientIssue ? message : "Unable to create Razorpay order." },
      { status: isClientIssue ? 400 : 500 }
    );
  }
}
