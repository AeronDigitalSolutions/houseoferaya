import { placeholderResponse } from "@/lib/api";

export async function POST(request: Request) {
  const body = await request.json();
  return placeholderResponse("POST /api/shipping/create-shipment", {
    received: body,
    shipmentId: "placeholder_shipment_id",
    awbCode: "placeholder_awb"
  });
}
