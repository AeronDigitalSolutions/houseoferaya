import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { signAuthChallengeToken } from "@/lib/auth/jwt";
import { isValidEmail, isValidPhone, normalizeEmail, normalizePhone } from "@/lib/auth/utils";
import { generateEmailOtp, hashEmailOtp, sendEmailOtpViaResend } from "@/lib/email-otp";
import { sendPhoneOtpViaTwilio } from "@/lib/twilio-verify";

export async function POST(request: NextRequest) {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser || !authUser.isActive) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const type = body?.type === "email" ? "email" : body?.type === "phone" ? "phone" : null;
    const rawValue = String(body?.value || "").trim();

    if (!type || !rawValue) {
      return NextResponse.json({ success: false, message: "Contact type and value are required." }, { status: 400 });
    }

    const normalizedValue = type === "email" ? normalizeEmail(rawValue) : normalizePhone(rawValue);

    if (type === "email" && !isValidEmail(normalizedValue)) {
      return NextResponse.json({ success: false, message: "Please enter a valid email." }, { status: 400 });
    }

    if (type === "phone" && !isValidPhone(normalizedValue)) {
      return NextResponse.json({ success: false, message: "Please enter a valid phone number." }, { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { email: true, phone: true }
    });

    if (!currentUser) {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    }

    if ((type === "email" && currentUser.email === normalizedValue) || (type === "phone" && currentUser.phone === normalizedValue)) {
      return NextResponse.json({ success: false, message: `This ${type} is already saved on your profile.` }, { status: 400 });
    }

    const duplicate = await prisma.user.findFirst({
      where: {
        id: { not: authUser.id },
        ...(type === "email" ? { email: normalizedValue } : { phone: normalizedValue })
      },
      select: { id: true }
    });

    if (duplicate) {
      return NextResponse.json({ success: false, message: `${type === "email" ? "Email" : "Phone number"} is already in use by another account.` }, { status: 409 });
    }

    if (type === "phone") {
      await sendPhoneOtpViaTwilio(normalizedValue);
    }

    let emailOtpHash: string | undefined;
    if (type === "email") {
      const otp = generateEmailOtp();
      emailOtpHash = hashEmailOtp(normalizedValue, otp);
      await sendEmailOtpViaResend(normalizedValue, otp, "profile_contact_update");
    }

    const challengeToken = signAuthChallengeToken({
      purpose: "profile_contact_update",
      userId: authUser.id,
      email: type === "email" ? normalizedValue : undefined,
      phone: type === "phone" ? normalizedValue : undefined,
      emailOtpHash
    });

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully.",
      challengeToken
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unable to send verification OTP." },
      { status: 500 }
    );
  }
}
