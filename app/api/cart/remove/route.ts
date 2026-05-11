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
    const removeAll = Boolean(body?.removeAll);

    if (!removeAll && !cartItemId) {
      return NextResponse.json({ success: false, message: "cartItemId is required." }, { status: 400 });
    }

    const deleted = removeAll
      ? await prisma.cartItem.deleteMany({
          where: {
            cart: { userId: authUser.id }
          }
        })
      : await prisma.cartItem.deleteMany({
          where: {
            id: cartItemId,
            cart: { userId: authUser.id }
          }
        });

    if (!deleted.count) {
      return NextResponse.json({ success: false, message: "Cart item not found." }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: removeAll ? "Cart cleared successfully." : "Item removed from cart." },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unable to remove cart item." },
      { status: 500 }
    );
  }
}
