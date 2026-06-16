import { notFound } from "next/navigation";
import { CollectionsPageClient } from "@/components/collections/CollectionsPageClient";
import { resolveImageUrlWithFallback } from "@/lib/image-url";
import { getStorefrontGemstone, getStorefrontWeight } from "@/lib/product-materials";
import { prisma } from "@/lib/prisma";
import { buildProductPricing, productPricingSelect } from "@/lib/product-pricing";
import { isSignatureProductSlug } from "@/lib/signature-piece";
import type { Category, Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CollectionBySlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [categories, selectedCategory, products] = await Promise.all([
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
    prisma.category.findFirst({
      where: { slug, isActive: true },
      select: { id: true }
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ createdAt: "desc" }],
      select: productPricingSelect
    })
  ]);

  if (!selectedCategory) {
    notFound();
  }

  const categoryItems: Category[] = await Promise.all(
    categories.map(async (category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image: await resolveImageUrlWithFallback(category.image, null)
    }))
  );

  const productItems: Product[] = await Promise.all(
    products.map(async (product) => {
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
        gemstone: getStorefrontGemstone(product),
        weight: getStorefrontWeight(product),
        certification: product.certification || "In-house Certified",
        categoryId: product.categoryId,
        image: await resolveImageUrlWithFallback(product.images[0]?.url, null),
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
    })
  );

  return (
    <CollectionsPageClient
      categories={categoryItems}
      products={productItems}
      initialCategoryId={selectedCategory.id}
    />
  );
}
