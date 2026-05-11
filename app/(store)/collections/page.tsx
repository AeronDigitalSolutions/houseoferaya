import { CollectionsPageClient } from "@/components/collections/CollectionsPageClient";
import { prisma } from "@/lib/prisma";
import { buildProductPricing, productPricingSelect } from "@/lib/product-pricing";
import { isSignatureProductSlug } from "@/lib/signature-piece";
import type { Category, Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true
      }
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ createdAt: "desc" }],
      select: productPricingSelect
    })
  ]);

  const categoryItems: Category[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || "",
    image: category.image || "/assets/collection-aura.jpg"
  }));

  const productItems: Product[] = products.map((product) => {
    const pricing = buildProductPricing(product);
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: pricing.finalPrice,
      compareAtPrice: pricing.compareAtPrice ?? undefined,
      sku: product.sku,
      stock: product.stock,
      metalType: product.metalType,
      gemstone: product.gemstone || "None",
      weight: product.weight || `${Number(product.weightGrams).toFixed(1)}g`,
      certification: product.certification || "In-house Certified",
      categoryId: product.categoryId,
      image: product.images[0]?.url || "/assets/collection-aura.jpg",
      isActive: product.isActive,
      isSignature: isSignatureProductSlug(product.slug),
      pricingBreakdown: {
        metalRate: pricing.metalRate,
        metalPrice: pricing.metalPrice,
        makingCharge: pricing.makingCharge,
        stoneCost: pricing.stoneCost,
        huidCharge: pricing.huidCharge,
        subtotalBeforeGst: pricing.subtotalBeforeGst,
        gstAmount: pricing.gstAmount,
        finalPrice: pricing.finalPrice
      }
    };
  });

  return <CollectionsPageClient categories={categoryItems} products={productItems} />;
}
