import { requireAdminPermission } from "@/lib/auth/admin-guard";
import { prisma } from "@/lib/prisma";
import { resolveImageUrlWithFallback } from "@/lib/image-url";
import { AdminCategoriesManager } from "@/components/admin/categories/AdminCategoriesManager";

export default async function AdminCategoriesPage() {
  const admin = await requireAdminPermission("canViewProducts");

  const categories = await prisma.category.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      _count: { select: { products: true } }
    }
  });

  const initialCategories = await Promise.all(
    categories.map(async (category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: await resolveImageUrlWithFallback(category.image),
      isActive: category.isActive,
      productCount: category._count.products,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString()
    }))
  );

  return (
    <AdminCategoriesManager
      initialCategories={initialCategories}
      canEdit={admin.role === "SUPER_ADMIN" || admin.permissions.canEditProducts}
    />
  );
}
