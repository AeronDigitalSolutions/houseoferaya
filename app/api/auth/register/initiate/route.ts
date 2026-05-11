import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signAuthChallengeToken } from "@/lib/auth/jwt";
import { parseContactPayload, isValidEmail, isValidPhone, normalizeEmail, normalizeName, normalizePhone } from "@/lib/auth/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fullName = normalizeName(String(body?.fullName || ""));
    const identifierRaw = String(body?.identifier || "").trim();

    const isEmailIdentifier = identifierRaw.includes("@");
    const parsedFromIdentifier = identifierRaw
      ? {
          email: isEmailIdentifier ? normalizeEmail(identifierRaw) : undefined,
          phone: !isEmailIdentifier ? normalizePhone(identifierRaw) : undefined
        }
      : parseContactPayload({
          email: body?.email,
          phone: body?.phone
        });

    const { email, phone } = parsedFromIdentifier;

    if (!fullName) {
      return NextResponse.json({ success: false, message: "Full name is required." }, { status: 400 });
    }

    if (!email && !phone) {
      return NextResponse.json(
        { success: false, message: "Email or phone is required." },
        { status: 400 }
      );
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json({ success: false, message: "Please enter a valid email." }, { status: 400 });
    }

    if (phone && !isValidPhone(phone)) {
      return NextResponse.json({ success: false, message: "Please enter a valid phone number." }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [email ? { email } : undefined, phone ? { phone } : undefined].filter(Boolean) as Array<
          { email: string } | { phone: string }
        >
      },
      select: { id: true }
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          code: "USER_EXISTS",
          message: "Account already exists. Please login instead."
        },
        { status: 409 }
      );
    }

    const challengeToken = signAuthChallengeToken({
      purpose: "register",
      fullName,
      email,
      phone
    });

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully.",
      challengeToken,
      otpHint: "Use demo OTP: 112233"
    });
  } catch (error) {
    console.error("Auth register initiate error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Signup service is temporarily unavailable. Please check database configuration."
      },
      { status: 500 }
    );
  }
}
