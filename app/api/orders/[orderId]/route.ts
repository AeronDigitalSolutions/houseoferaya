import { getOrderById } from "@/lib/mock-data";
import { placeholderResponse } from "@/lib/api";

export async function GET(_: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const order = getOrderById(orderId);

  if (!order) {
    return Response.json({ success: false, message: "Order not found" }, { status: 404 });
  }

  return placeholderResponse("GET /api/orders/[orderId]", { item: order });
}
