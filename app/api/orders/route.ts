import { orders } from "@/lib/mock-data";
import { placeholderResponse } from "@/lib/api";

export async function GET() {
  return placeholderResponse("GET /api/orders", { items: orders });
}
