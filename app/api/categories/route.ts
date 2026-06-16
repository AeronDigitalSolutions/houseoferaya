import { prisma } from "@/lib/prisma";
import { resolveImageUrlWithFallback } from "@/lib/image-url";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ name: "asc" }],
      include: {
        _count: { select: { products: true } }
      }
    });

    const items = await Promise.all(
      categories.map(async (category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        image: await resolveImageUrlWithFallback(category.image),
        productCount: category._count.products
      }))
    );

    return Response.json({
      success: true,
      items
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch categories."
      },
      { status: 500 }
    );
  }
}
