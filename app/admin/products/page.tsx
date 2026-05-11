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
      sku: product.sku,
      stock: product.stock,
      baseMetal: product.baseMetal,
      purity: product.purity,
      weightGrams: Number(product.weightGrams),
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
