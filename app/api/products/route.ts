import { products } from "@/lib/mock-data";
import { placeholderResponse } from "@/lib/api";

export async function GET() {
  return placeholderResponse("GET /api/products", { items: products });
}
