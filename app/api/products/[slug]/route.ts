import { prisma } from "@/lib/prisma";
import { buildProductPricing, productPricingSelect } from "@/lib/product-pricing";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    select: productPricingSelect
  });

  if (!product) {
    return Response.json({ success: false, message: "Product not found" }, { status: 404 });
  }

  const pricing = buildProductPricing(product);

  return Response.json({
    success: true,
    item: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      sku: product.sku,
      stock: product.stock,
      isActive: product.isActive,
      metalType: product.metalType,
      gemstone: product.gemstone,
      weight: product.weight,
      certification: product.certification,
      categoryId: product.categoryId,
      image: product.images[0]?.url || "/assets/collection-aura.jpg",
      baseMetal: product.baseMetal,
      metalColor: product.metalColor,
      purity: product.purity,
      weightGrams: Number(product.weightGrams),
      price: pricing.finalPrice,
      compareAtPrice: pricing.compareAtPrice,
      pricingBreakdown: pricing
    }
  });
}
