import { NextRequest, NextResponse } from "next/server";
import { deleteProductImage, listProductImages, saveProductImage } from "@/lib/product-image-storage";
import { getAdminAuthFromRequest } from "@/lib/auth/admin-session";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminAuthFromRequest(request);
    if (!admin || !admin.isActive || (!admin.permissions.canViewProducts && admin.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const productSlug = request.nextUrl.searchParams.get("productSlug");
    if (!productSlug) {
      return NextResponse.json({ error: "productSlug is required." }, { status: 400 });
    }

    const images = await listProductImages(productSlug);
    return NextResponse.json({ productSlug, images });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list images." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminAuthFromRequest(request);
    if (!admin || !admin.isActive || (!admin.permissions.canEditProducts && admin.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const formData = await request.formData();
    const productSlug = String(formData.get("productSlug") || "").trim();
    const preferredName = String(formData.get("fileName") || "").trim();
    const altTextRaw = String(formData.get("altText") || "").trim();
    const isPrimaryRaw = String(formData.get("isPrimary") || "").trim().toLowerCase();
    const sortOrderRaw = String(formData.get("sortOrder") || "").trim();
    const fileValue = formData.get("file");

    if (!productSlug) {
      return NextResponse.json({ error: "productSlug is required." }, { status: 400 });
    }

    if (!(fileValue instanceof File)) {
      return NextResponse.json({ error: "file is required." }, { status: 400 });
    }

    const saved = await saveProductImage({
      file: fileValue,
      productSlug,
      preferredName: preferredName || undefined
    });

    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
      select: { id: true }
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found for this slug." }, { status: 404 });
    }

    const isPrimary = isPrimaryRaw === "true" || isPrimaryRaw === "1" || isPrimaryRaw === "yes";
    const parsedSortOrder = Number(sortOrderRaw);
    const maxSortOrder = await prisma.productImage.aggregate({
      where: { productId: product.id },
      _max: { sortOrder: true }
    });
    const fallbackSort = (maxSortOrder._max.sortOrder ?? -1) + 1;
    const sortOrder = Number.isFinite(parsedSortOrder) ? Math.max(0, Math.floor(parsedSortOrder)) : fallbackSort;

    if (isPrimary) {
      await prisma.productImage.updateMany({
        where: { productId: product.id, isPrimary: true },
        data: { isPrimary: false }
      });
    }

    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: saved.publicUrl,
        altText: altTextRaw || null,
        isPrimary,
        sortOrder
      }
    });

    return NextResponse.json(
      {
        message: "Image uploaded successfully.",
        image: saved
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload image." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAdminAuthFromRequest(request);
    if (!admin || !admin.isActive || (!admin.permissions.canEditProducts && admin.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const productSlug = request.nextUrl.searchParams.get("productSlug");
    const fileName = request.nextUrl.searchParams.get("fileName");

    if (!productSlug || !fileName) {
      return NextResponse.json(
        { error: "productSlug and fileName are required." },
        { status: 400 }
      );
    }

    await deleteProductImage(productSlug, fileName);

    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
      select: { id: true }
    });
    if (product) {
      await prisma.productImage.deleteMany({
        where: {
          productId: product.id,
          url: { endsWith: `/${fileName}` }
        }
      });
    }

    return NextResponse.json({ message: "Image deleted successfully." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete image." },
      { status: 500 }
    );
  }
}
