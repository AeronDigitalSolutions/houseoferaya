import { getProductBySlug } from "@/lib/mock-data";
import { placeholderResponse } from "@/lib/api";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return Response.json({ success: false, message: "Product not found" }, { status: 404 });
  }

  return placeholderResponse("GET /api/products/[slug]", { item: product });
}
