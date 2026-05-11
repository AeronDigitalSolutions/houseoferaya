import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ orderId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser || !authUser.isActive) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const { orderId } = await params;
  const order = await prisma.order.findFirst({
    where: {
      userId: authUser.id,
      OR: [{ id: orderId }, { orderNumber: orderId }]
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                where: { isPrimary: true },
                take: 1
              }
            }
          }
        }
      },
      shipment: true
    }
  });

  if (!order) {
    return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true, order });
}

