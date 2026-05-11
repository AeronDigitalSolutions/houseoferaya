import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser || !authUser.isActive) {
    return NextResponse.json({ success: false, message: "Please login to add items to cart." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const productId = String(body?.productId || "").trim();
    const productSlug = String(body?.productSlug || "").trim();
    const requestedQty = Number(body?.quantity ?? 1);

    if (!productId && !productSlug) {
      return NextResponse.json(
        { success: false, message: "productId or productSlug is required." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(requestedQty) || requestedQty < 1) {
      return NextResponse.json({ success: false, message: "Quantity must be at least 1." }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: productId || undefined }, { slug: productSlug || undefined }],
        isActive: true
      },
      select: {
        id: true,
        name: true,
        stock: true
      }
    });

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found." }, { status: 404 });
    }

    if (product.stock < 1) {
      return NextResponse.json({ success: false, message: "This product is currently out of stock." }, { status: 409 });
    }

    const cart = await prisma.cart.upsert({
      where: { userId: authUser.id },
      update: {},
      create: { userId: authUser.id },
      select: { id: true }
    });

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: product.id,
        variantId: null
      },
      select: { id: true, quantity: true }
    });

    const safeQty = Math.max(1, Math.floor(requestedQty));
    const nextQty = Math.min((existingItem?.quantity ?? 0) + safeQty, product.stock);

    const item = existingItem
      ? await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: nextQty },
          select: { id: true, quantity: true, productId: true }
        })
      : await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: product.id,
            quantity: Math.min(safeQty, product.stock)
          },
          select: { id: true, quantity: true, productId: true }
        });

    const cartMeta = await prisma.cartItem.aggregate({
      where: { cartId: cart.id },
      _sum: { quantity: true }
    });

    return NextResponse.json(
      {
        success: true,
        message: `${product.name} added to cart.`,
        item,
        cartCount: cartMeta._sum.quantity ?? 0
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unable to add item to cart." },
      { status: 500 }
    );
  }
}
