import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth/session";
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
      createdAt: true
    }
  });

  return NextResponse.json({ success: true, orders });
}

