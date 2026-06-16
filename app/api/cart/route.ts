import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth/session";
import { resolveImageUrlWithFallback } from "@/lib/image-url";
import { getStorefrontGemstone, getStorefrontWeight } from "@/lib/product-materials";
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

    const items = cart
      ? await Promise.all(
          cart.items.map(async (line) => {
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
                gemstone: getStorefrontGemstone(line.product),
                weight: getStorefrontWeight(line.product),
                certification: line.product.certification || "In-house Certified",
                stock: line.product.stock,
                image: await resolveImageUrlWithFallback(line.product.images?.[0]?.url),
                isActive: line.product.isActive,
                pricingBreakdown: pricing
              }
            };
          })
        )
      : [];

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
