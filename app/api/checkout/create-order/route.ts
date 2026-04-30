import { placeholderResponse } from "@/lib/api";

export async function POST(request: Request) {
  const body = await request.json();
  return placeholderResponse("POST /api/checkout/create-order", {
    received: body,
    notes: [
      "Create internal order record",
      "Calculate shipping with partner API",
      "Generate Razorpay order"
    ]
  });
}
