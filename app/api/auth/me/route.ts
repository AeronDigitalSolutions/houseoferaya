import { NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: import("next/server").NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user || !user.isActive) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const [addressCount, orderCount, wishlistCount] = await Promise.all([
      prisma.address.count({ where: { userId: user.id } }),
      prisma.order.count({ where: { userId: user.id } }),
      prisma.wishlistItem.count({
        where: {
          wishlist: {
            userId: user.id
          }
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      stats: {
        addressCount,
        orderCount,
        wishlistCount
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to fetch user." },
      { status: 500 }
    );
  }
}

