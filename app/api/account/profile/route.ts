import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { parseContactPayload, isValidEmail, isValidPhone, normalizeName } from "@/lib/auth/utils";

export async function GET(request: NextRequest) {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser || !authUser.isActive) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      dateOfBirth: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return NextResponse.json({ success: true, user });
}

export async function PUT(request: NextRequest) {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser || !authUser.isActive) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const fullName = normalizeName(String(body?.name || ""));
    const { email, phone } = parseContactPayload({
      email: body?.email,
      phone: body?.phone
    });
    const dob = body?.dateOfBirth ? new Date(String(body.dateOfBirth)) : null;

    if (!fullName) {
      return NextResponse.json({ success: false, message: "Full name is required." }, { status: 400 });
    }

    if (!email && !phone) {
      return NextResponse.json({ success: false, message: "Email or phone is required." }, { status: 400 });
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json({ success: false, message: "Please enter a valid email." }, { status: 400 });
    }
    if (phone && !isValidPhone(phone)) {
      return NextResponse.json({ success: false, message: "Please enter a valid phone number." }, { status: 400 });
    }

    if (dob && Number.isNaN(dob.getTime())) {
      return NextResponse.json({ success: false, message: "Invalid date of birth." }, { status: 400 });
    }

    const duplicate = await prisma.user.findFirst({
      where: {
        id: { not: authUser.id },
        OR: [email ? { email } : undefined, phone ? { phone } : undefined].filter(Boolean) as Array<
          { email: string } | { phone: string }
        >
      },
      select: { id: true }
    });

    if (duplicate) {
      return NextResponse.json(
        { success: false, message: "Email or phone already in use by another account." },
        { status: 409 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        name: fullName,
        email: email || null,
        phone: phone || null,
        dateOfBirth: dob
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ success: true, message: "Profile updated.", user: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to update profile." },
      { status: 500 }
    );
  }
}

