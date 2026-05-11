import { prisma } from "@/lib/prisma";
import { buildProductPricing, productPricingSelect } from "@/lib/product-pricing";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    select: productPricingSelect
  });

  return Response.json({
    success: true,
    items: products.map((product) => {
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
      };
    })
  });
}
