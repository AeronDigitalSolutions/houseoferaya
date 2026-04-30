import { placeholderResponse } from "@/lib/api";

export async function POST(request: Request) {
  const body = await request.json();
  return placeholderResponse("POST /api/payment/razorpay/create-order", {
    received: body,
    razorpayOrderId: "placeholder_razorpay_order_id"
  });
}
