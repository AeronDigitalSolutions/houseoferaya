import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { buildProductPricing, productPricingSelect } from "@/lib/product-pricing";

export async function GET(request: NextRequest) {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser || !authUser.isActive) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: authUser.id },
    include: {
      items: {
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            select: productPricingSelect
          }
        }
      }
    }
  });

  const normalized = wishlist
    ? {
        ...wishlist,
        items: wishlist.items.map((item) => {
          const pricing = buildProductPricing(item.product);
          return {
            ...item,
            product: {
              ...item.product,
              price: pricing.finalPrice,
              compareAtPrice: pricing.compareAtPrice,
              pricingBreakdown: pricing
            }
          };
        })
      }
    : { id: null, items: [] };

  return NextResponse.json({
    success: true,
    wishlist: normalized
  });
}
