import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signAuthChallengeToken } from "@/lib/auth/jwt";
import { sendPhoneOtpViaTwilio } from "@/lib/twilio-verify";
import { generateEmailOtp, hashEmailOtp, sendEmailOtpViaResend } from "@/lib/email-otp";
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

    if (user.phone) {
      await sendPhoneOtpViaTwilio(user.phone);
    }

    let emailOtpHash: string | undefined;
    if (!user.phone && user.email) {
      const otp = generateEmailOtp();
      emailOtpHash = hashEmailOtp(user.email, otp);
      await sendEmailOtpViaResend(user.email, otp, "login");
    }

    const challengeToken = signAuthChallengeToken({
      purpose: "login",
      userId: user.id,
      email: user.email || undefined,
      phone: user.phone || undefined,
      emailOtpHash
    });

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully.",
      challengeToken
    });
  } catch (error) {
    console.error("Auth login initiate error:", error);
    const message = error instanceof Error ? error.message : "";
    return NextResponse.json(
      {
        success: false,
        message: message || "Login service is temporarily unavailable. Please check database configuration."
      },
      { status: 500 }
    );
  }
}
