import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signAuthChallengeToken } from "@/lib/auth/jwt";
import { isValidEmail, isValidPhone, normalizeEmail, normalizePhone } from "@/lib/auth/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifierRaw = String(body?.identifier || "").trim();

    if (!identifierRaw) {
      return NextResponse.json({ success: false, message: "Email or phone is required." }, { status: 400 });
    }

    const isEmail = identifierRaw.includes("@");
    const email = isEmail ? normalizeEmail(identifierRaw) : undefined;
    const phone = !isEmail ? normalizePhone(identifierRaw) : undefined;

    if (email && !isValidEmail(email)) {
      return NextResponse.json({ success: false, message: "Please enter a valid email." }, { status: 400 });
    }

    if (phone && !isValidPhone(phone)) {
      return NextResponse.json({ success: false, message: "Please enter a valid phone number." }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [email ? { email } : undefined, phone ? { phone } : undefined].filter(Boolean) as Array<
          { email: string } | { phone: string }
        >
      },
      select: {
        id: true,
        isActive: true,
        email: true,
        phone: true
      }
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        {
          success: false,
          code: "USER_NOT_FOUND",
          message: "No account found. Please signup first."
        },
        { status: 404 }
      );
    }

    const challengeToken = signAuthChallengeToken({
      purpose: "login",
      userId: user.id,
      email: user.email || undefined,
      phone: user.phone || undefined
    });

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully.",
      challengeToken,
      otpHint: "Use demo OTP: 112233"
    });
  } catch (error) {
    console.error("Auth login initiate error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Login service is temporarily unavailable. Please check database configuration."
      },
      { status: 500 }
    );
  }
}
