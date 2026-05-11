import { requireAdminPermission } from "@/lib/auth/admin-guard";
import { prisma } from "@/lib/prisma";
import { AdminCategoriesManager } from "@/components/admin/categories/AdminCategoriesManager";

export default async function AdminCategoriesPage() {
  const admin = await requireAdminPermission("canViewProducts");

  const categories = await prisma.category.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      _count: { select: { products: true } }
    }
  });

  return (
    <AdminCategoriesManager
      initialCategories={categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image || "/assets/collection-aura.jpg",
        isActive: category.isActive,
        productCount: category._count.products,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString()
      }))}
      canEdit={admin.role === "SUPER_ADMIN" || admin.permissions.canEditProducts}
    />
  );
}
