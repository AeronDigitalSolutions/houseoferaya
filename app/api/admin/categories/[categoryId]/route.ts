import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminAuthFromRequest } from "@/lib/auth/admin-session";
import { deleteCategoryImageByUrl, saveCategoryImage } from "@/lib/category-image-storage";

export const runtime = "nodejs";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function mapCategory(item: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: { products: number };
}) {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description,
    image: item.image || "/assets/collection-aura.jpg",
    isActive: item.isActive,
    productCount: item._count?.products ?? 0,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString()
  };
}

function isAllowed(admin: Awaited<ReturnType<typeof getAdminAuthFromRequest>>) {
  return Boolean(admin && admin.isActive && (admin.role === "SUPER_ADMIN" || admin.permissions.canEditProducts));
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ categoryId: string }> }) {
  try {
    const admin = await getAdminAuthFromRequest(request);
    if (!isAllowed(admin)) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const { categoryId } = await params;
    const existingCategory = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!existingCategory) {
      return NextResponse.json({ success: false, message: "Category not found." }, { status: 404 });
    }

    const contentType = request.headers.get("content-type") || "";
    let name = existingCategory.name;
    let slug = existingCategory.slug;
    let description = existingCategory.description;
    let isActive = existingCategory.isActive;
    let nextImage = existingCategory.image;
    let replaceImage = false;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      name = String(formData.get("name") || name).trim() || name;
      const slugInput = String(formData.get("slug") || slug).trim();
      slug = slugify(slugInput || name) || slug;
      description = String(formData.get("description") || description || "").trim() || null;
      const isActiveRaw = String(formData.get("isActive") || "");
      if (isActiveRaw) isActive = isActiveRaw === "true";
      const file = formData.get("image");
      if (file instanceof File) {
        const savedImage = await saveCategoryImage({ file, preferredName: slug });
        nextImage = savedImage.publicUrl;
        replaceImage = true;
      }
    } else {
      const payload = (await request.json()) as {
        name?: string;
        slug?: string;
        description?: string;
        isActive?: boolean;
      };

      if (typeof payload.name === "string" && payload.name.trim()) {
        name = payload.name.trim();
      }

      if (typeof payload.slug === "string" && payload.slug.trim()) {
        slug = slugify(payload.slug);
      } else if (typeof payload.name === "string" && payload.name.trim()) {
        slug = slugify(payload.name.trim());
      }

      if (typeof payload.description === "string") {
        description = payload.description.trim() || null;
      }

      if (typeof payload.isActive === "boolean") {
        isActive = payload.isActive;
      }
    }

    if (!slug) {
      return NextResponse.json({ success: false, message: "Invalid category slug." }, { status: 400 });
    }

    const duplicate = await prisma.category.findFirst({
      where: {
        id: { not: categoryId },
        OR: [{ slug }, { name: { equals: name, mode: "insensitive" } }]
      }
    });
    if (duplicate) {
      return NextResponse.json(
        { success: false, message: "Another category already uses this title or slug." },
        { status: 409 }
      );
    }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        slug,
        description,
        isActive,
        image: nextImage
      },
      include: {
        _count: { select: { products: true } }
      }
    });

    if (replaceImage && existingCategory.image && existingCategory.image !== updated.image) {
      await deleteCategoryImageByUrl(existingCategory.image);
    }

    return NextResponse.json({
      success: true,
      message: "Category updated successfully.",
      category: mapCategory(updated)
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update category."
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ categoryId: string }> }) {
  try {
    const admin = await getAdminAuthFromRequest(request);
    if (!isAllowed(admin)) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const { categoryId } = await params;
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { _count: { select: { products: true } } }
    });
    if (!category) {
      return NextResponse.json({ success: false, message: "Category not found." }, { status: 404 });
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete category with linked products. Move products to another category first."
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id: categoryId } });
    await deleteCategoryImageByUrl(category.image);

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully."
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete category."
      },
      { status: 500 }
    );
  }
}
