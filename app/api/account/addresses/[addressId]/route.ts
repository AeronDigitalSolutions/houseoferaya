import { NextRequest, NextResponse } from "next/server";
import { AddressType } from "@prisma/client";
import { getAuthUserFromRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

function parseAddressType(value: string) {
  if (value === "WORK") return AddressType.WORK;
  if (value === "OTHER") return AddressType.OTHER;
  return AddressType.HOME;
}

type Params = { params: Promise<{ addressId: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser || !authUser.isActive) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const { addressId } = await params;

  try {
    const body = await request.json();
    const payload = {
      nickname: String(body?.nickname || "").trim() || null,
      label: String(body?.label || "").trim() || null,
      type: parseAddressType(String(body?.type || "HOME")),
      fullName: String(body?.fullName || "").trim(),
      phone: String(body?.phone || "").trim(),
      line1: String(body?.line1 || "").trim(),
      line2: String(body?.line2 || "").trim() || null,
      city: String(body?.city || "").trim(),
      state: String(body?.state || "").trim(),
      country: String(body?.country || "India").trim(),
      pincode: String(body?.pincode || "").trim(),
      isDefault: Boolean(body?.isDefault)
    };

    if (!payload.fullName || !payload.phone || !payload.line1 || !payload.city || !payload.state || !payload.pincode) {
      return NextResponse.json({ success: false, message: "Please fill all required address fields." }, { status: 400 });
    }

    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId: authUser.id },
      select: { id: true }
    });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Address not found." }, { status: 404 });
    }

    const address = await prisma.$transaction(async (tx) => {
      if (payload.isDefault) {
        await tx.address.updateMany({
          where: { userId: authUser.id, isDefault: true, id: { not: addressId } },
          data: { isDefault: false }
        });
      }

      return tx.address.update({
        where: { id: addressId },
        data: {
          ...payload,
          nickname: payload.nickname || payload.label || null
        }
      });
    });

    return NextResponse.json({ success: true, message: "Address updated.", address });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to update address." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser || !authUser.isActive) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }
  const { addressId } = await params;

  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId: authUser.id },
    select: { id: true }
  });

  if (!existing) {
    return NextResponse.json({ success: false, message: "Address not found." }, { status: 404 });
  }

  await prisma.address.delete({ where: { id: addressId } });
  return NextResponse.json({ success: true, message: "Address removed." });
}
