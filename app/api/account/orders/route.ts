import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth/session";
import { resolveImageUrlWithFallback } from "@/lib/image-url";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser || !authUser.isActive) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: { userId: authUser.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      total: true,
      orderStatus: true,
      paymentStatus: true,
      shippingStatus: true,
      createdAt: true,
      items: {
        orderBy: { createdAt: "asc" },
        take: 3,
        select: {
          id: true,
          productName: true,
          quantity: true,
          product: {
            select: {
              images: {
                select: {
                  url: true,
                  isPrimary: true,
                  sortOrder: true
                },
                orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
                take: 1
              }
            }
          }
        }
      }
    }
  });

  const normalizedOrders = await Promise.all(
    orders.map(async (order) => {
      const leadItem = order.items[0] || null;
      const leadImage = leadItem ? await resolveImageUrlWithFallback(leadItem.product.images[0]?.url) : null;

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        shippingStatus: order.shippingStatus,
        createdAt: order.createdAt,
        leadItem: leadItem
          ? {
              name: leadItem.productName,
              quantity: leadItem.quantity,
              image: leadImage
            }
          : null,
        itemCount: order.items.length,
        additionalItemCount: Math.max(0, order.items.length - 1)
      };
    })
  );

  return NextResponse.json({ success: true, orders: normalizedOrders });
}
