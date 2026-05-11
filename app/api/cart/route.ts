import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { buildProductPricing, productPricingSelect } from "@/lib/product-pricing";

export async function GET(request: NextRequest) {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser || !authUser.isActive) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  try {
    const cart = await prisma.cart.findUnique({
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

    const items =
      cart?.items.map((line) => {
        const pricing = buildProductPricing(line.product);
        return {
          id: line.id,
          quantity: line.quantity,
          product: {
            id: line.product.id,
            name: line.product.name,
            slug: line.product.slug,
            sku: line.product.sku,
            price: pricing.finalPrice,
            compareAtPrice: pricing.compareAtPrice,
            metalType: line.product.metalType,
            gemstone: line.product.gemstone || "N/A",
            weight: line.product.weight || "N/A",
            certification: line.product.certification || "N/A",
            stock: line.product.stock,
            image: line.product.images?.[0]?.url || "/assets/collection-aura.jpg",
            isActive: line.product.isActive,
            pricingBreakdown: pricing
          }
        };
      }) || [];

    return NextResponse.json({
      success: true,
      cart: {
        id: cart?.id || null,
        items
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to fetch cart." },
      { status: 500 }
    );
  }
}
