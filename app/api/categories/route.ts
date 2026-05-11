import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ name: "asc" }],
      include: {
        _count: { select: { products: true } }
      }
    });

    return Response.json({
      success: true,
      items: categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        image: category.image || "/assets/collection-aura.jpg",
        productCount: category._count.products
      }))
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
