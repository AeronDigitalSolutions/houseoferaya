import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminAuthFromRequest } from "@/lib/auth/admin-session";
import { saveCategoryImage } from "@/lib/category-image-storage";

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

function isAllowed(admin: Awaited<ReturnType<typeof getAdminAuthFromRequest>>) {
  return Boolean(admin && admin.isActive && (admin.role === "SUPER_ADMIN" || admin.permissions.canEditProducts));
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

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminAuthFromRequest(request);
    if (!admin || !admin.isActive || !(admin.role === "SUPER_ADMIN" || admin.permissions.canViewProducts)) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      orderBy: [{ createdAt: "desc" }],
      include: {
        _count: { select: { products: true } }
      }
    });

    return NextResponse.json({
      success: true,
      categories: categories.map(mapCategory)
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch categories."
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminAuthFromRequest(request);
    if (!isAllowed(admin)) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const formData = await request.formData();
    const name = String(formData.get("name") || "").trim();
    const slugInput = String(formData.get("slug") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const file = formData.get("image");

    if (!name) {
      return NextResponse.json({ success: false, message: "Category title is required." }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, message: "Category image is required." }, { status: 400 });
    }

    const slug = slugify(slugInput || name);
    if (!slug) {
      return NextResponse.json({ success: false, message: "Invalid category slug." }, { status: 400 });
    }

    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ slug }, { name: { equals: name, mode: "insensitive" } }]
      }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Category with the same title or slug already exists." },
        { status: 409 }
      );
    }

    const savedImage = await saveCategoryImage({ file, preferredName: slug });

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        image: savedImage.publicUrl,
        isActive: true
      },
      include: {
        _count: { select: { products: true } }
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully.",
        category: mapCategory(category)
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create category."
      },
      { status: 500 }
    );
  }
}
