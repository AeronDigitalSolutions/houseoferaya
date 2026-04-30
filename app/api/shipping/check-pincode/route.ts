import { placeholderResponse } from "@/lib/api";

export async function POST(request: Request) {
  const body = await request.json();
  return placeholderResponse("POST /api/shipping/check-pincode", {
    received: body,
    isServiceable: true,
    etaDays: 4
  });
}
