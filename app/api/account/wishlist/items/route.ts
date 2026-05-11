import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser || !authUser.isActive) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const productId = String(body?.productId || "").trim();
    const productSlug = String(body?.productSlug || "").trim();

    if (!productId && !productSlug) {
      return NextResponse.json({ success: false, message: "productId or productSlug is required." }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: productId || undefined }, { slug: productSlug || undefined }]
      },
      select: { id: true, isActive: true }
    });
    if (!product || !product.isActive) {
      return NextResponse.json({ success: false, message: "Product not found." }, { status: 404 });
    }

    const wishlist = await prisma.wishlist.upsert({
      where: { userId: authUser.id },
      update: {},
      create: { userId: authUser.id }
    });

    const item = await prisma.wishlistItem.upsert({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId: product.id
        }
      },
      update: {},
      create: {
        wishlistId: wishlist.id,
        productId: product.id
      }
    });

    return NextResponse.json({ success: true, message: "Added to wishlist.", item }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to add wishlist item." },
      { status: 500 }
    );
  }
}
