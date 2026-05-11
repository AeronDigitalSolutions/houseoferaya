import { NextRequest, NextResponse } from "next/server";
import { AddressType } from "@prisma/client";
import { getAuthUserFromRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

function parseAddressType(value: string) {
  if (value === "WORK") return AddressType.WORK;
  if (value === "OTHER") return AddressType.OTHER;
  return AddressType.HOME;
}

export async function GET(request: NextRequest) {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser || !authUser.isActive) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const addresses = await prisma.address.findMany({
    where: { userId: authUser.id },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }]
  });

  return NextResponse.json({ success: true, addresses });
}

export async function POST(request: NextRequest) {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser || !authUser.isActive) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

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
    const normalizedPayload = {
      ...payload,
      nickname: payload.nickname || payload.label || null
    };

    if (!payload.fullName || !payload.phone || !payload.line1 || !payload.city || !payload.state || !payload.pincode) {
      return NextResponse.json({ success: false, message: "Please fill all required address fields." }, { status: 400 });
    }

    const address = await prisma.$transaction(async (tx) => {
      if (payload.isDefault) {
        await tx.address.updateMany({
          where: { userId: authUser.id, isDefault: true },
          data: { isDefault: false }
        });
      }

      return tx.address.create({
        data: {
          userId: authUser.id,
          ...normalizedPayload
        }
      });
    });

    return NextResponse.json({ success: true, message: "Address saved.", address }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to add address." },
      { status: 500 }
    );
  }
}
