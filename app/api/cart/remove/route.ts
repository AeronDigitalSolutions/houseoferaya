import { placeholderResponse } from "@/lib/api";

export async function POST(request: Request) {
  const body = await request.json();
  return placeholderResponse("POST /api/cart/remove", { received: body });
}
