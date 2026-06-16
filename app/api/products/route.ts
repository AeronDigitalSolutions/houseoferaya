import { resolveImageUrlWithFallback } from "@/lib/image-url";
import { getStorefrontGemstone, getStorefrontWeight } from "@/lib/product-materials";
import { prisma } from "@/lib/prisma";
import { buildProductPricing, productPricingSelect } from "@/lib/product-pricing";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    select: productPricingSelect
  });

  const items = await Promise.all(
    products.map(async (product) => {
      const pricing = buildProductPricing(product);
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        sku: product.sku,
        stock: product.stock,
        isActive: product.isActive,
        metalType: product.metalType,
        gemstone: getStorefrontGemstone(product),
        weight: getStorefrontWeight(product),
        certification: product.certification,
        categoryId: product.categoryId,
        image: await resolveImageUrlWithFallback(product.images[0]?.url, null),
        baseMetal: product.baseMetal,
        metalColor: product.metalColor,
        purity: product.purity,
        weightGrams: Number(product.weightGrams),
        price: pricing.finalPrice,
        compareAtPrice: pricing.compareAtPrice,
        pricingBreakdown: pricing
      };
    })
  );

  return Response.json({
    success: true,
    items
  });
}
