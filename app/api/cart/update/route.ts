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
    const cartItemId = String(body?.cartItemId || "").trim();
    const quantity = Number(body?.quantity);

    if (!cartItemId) {
      return NextResponse.json({ success: false, message: "cartItemId is required." }, { status: 400 });
    }

    if (!Number.isFinite(quantity) || quantity < 1) {
      return NextResponse.json({ success: false, message: "Quantity must be at least 1." }, { status: 400 });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: { userId: authUser.id }
      },
      include: {
        product: {
          select: { stock: true, name: true }
        }
      }
    });

    if (!cartItem) {
      return NextResponse.json({ success: false, message: "Cart item not found." }, { status: 404 });
    }

    if (cartItem.product.stock < 1) {
      return NextResponse.json({ success: false, message: "This product is out of stock." }, { status: 409 });
    }

    const nextQty = Math.min(Math.max(1, Math.floor(quantity)), cartItem.product.stock);
    const updated = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: nextQty },
      select: { id: true, quantity: true, productId: true }
    });

    return NextResponse.json(
      { success: true, message: `${cartItem.product.name} quantity updated.`, item: updated },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unable to update cart item." },
      { status: 500 }
    );
  }
}
