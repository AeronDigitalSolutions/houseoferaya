import { placeholderResponse } from "@/lib/api";

export async function POST(request: Request) {
  const body = await request.json();
  return placeholderResponse("POST /api/payment/razorpay/verify", {
    received: body,
    verified: false,
    reason: "Signature verification placeholder"
  });
}
