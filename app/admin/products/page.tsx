import { requireAdminPermission } from "@/lib/auth/admin-guard";
import { prisma } from "@/lib/prisma";
import { buildProductPricing, productPricingSelect } from "@/lib/product-pricing";
import { AdminProductsManager } from "@/components/admin/products/AdminProductsManager";
import { isSignatureProductSlug } from "@/lib/signature-piece";

export default async function AdminProductsPage() {
  const admin = await requireAdminPermission("canViewProducts");

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true }
    }),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      select: productPricingSelect
    })
  ]);

  const initialProducts = products.map((product) => {
    const pricing = buildProductPricing(product);
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      sku: product.sku,
      categoryId: product.categoryId,
      stock: product.stock,
      compareAtPrice: pricing.compareAtPrice,
      offerPrice: pricing.finalPrice,
      certification: product.certification || "In-house Certified",
      baseMetal: product.baseMetal,
      metalColor: product.metalColor,
      purity: product.purity,
      purityFactor: Number(product.purityFactor),
      weightGrams: Number(product.weightGrams),
      activeGoldRate: product.activeGoldRate ? Number(product.activeGoldRate) : null,
      activeSilverRate: product.activeSilverRate ? Number(product.activeSilverRate) : null,
      useManualSellingRate: product.useManualSellingRate,
      manualSellingRate: product.manualSellingRate ? Number(product.manualSellingRate) : null,
      makingChargeType: product.makingChargeType,
      makingChargeValue: Number(product.makingChargeValue),
      hasStone: product.hasStone,
      stoneType: product.stoneType || "",
      stoneCarat: product.stoneCarat ? Number(product.stoneCarat) : null,
      stoneCostType: product.stoneCostType,
      stoneCostValue: Number(product.stoneCostValue),
      huidCharge: Number(product.huidCharge),
      gstPercentage: Number(product.gstPercentage),
      finalPrice: pricing.finalPrice,
      isActive: product.isActive,
      isSignature: isSignatureProductSlug(product.slug)
    };
  });

  return (
    <AdminProductsManager
      categories={categories}
      initialProducts={initialProducts}
      canEditProducts={admin.role === "SUPER_ADMIN" || admin.permissions.canEditProducts}
    />
  );
}
