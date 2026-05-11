import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ itemId: string }> };

export async function DELETE(request: NextRequest, { params }: Params) {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser || !authUser.isActive) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const { itemId } = await params;

  const deleted = await prisma.wishlistItem.deleteMany({
    where: {
      id: itemId,
      wishlist: { userId: authUser.id }
    }
  });

  if (!deleted.count) {
    return NextResponse.json({ success: false, message: "Wishlist item not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "Removed from wishlist." });
}

