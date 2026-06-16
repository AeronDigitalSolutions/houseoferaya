import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth/session";
import { signAuthChallengeToken, verifyAuthChallengeToken } from "@/lib/auth/jwt";
import { isValidEmail, isValidPhone, normalizeEmail, normalizePhone } from "@/lib/auth/utils";
import { hashEmailOtp } from "@/lib/email-otp";
import { verifyPhoneOtpViaTwilio } from "@/lib/twilio-verify";

export async function POST(request: NextRequest) {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser || !authUser.isActive) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const type = body?.type === "email" ? "email" : body?.type === "phone" ? "phone" : null;
    const rawValue = String(body?.value || "").trim();
    const otp = String(body?.otp || "").trim();
    const challengeToken = String(body?.challengeToken || "").trim();

    if (!type || !rawValue || !otp || !challengeToken) {
      return NextResponse.json({ success: false, message: "OTP, contact type, value, and challenge token are required." }, { status: 400 });
    }

    const normalizedValue = type === "email" ? normalizeEmail(rawValue) : normalizePhone(rawValue);

    if (type === "email" && !isValidEmail(normalizedValue)) {
      return NextResponse.json({ success: false, message: "Please enter a valid email." }, { status: 400 });
    }

    if (type === "phone" && !isValidPhone(normalizedValue)) {
      return NextResponse.json({ success: false, message: "Please enter a valid phone number." }, { status: 400 });
    }

    const challenge = verifyAuthChallengeToken(challengeToken);
    if (!challenge || challenge.purpose !== "profile_contact_update" || challenge.userId !== authUser.id) {
      return NextResponse.json({ success: false, message: "Invalid or expired verification token." }, { status: 400 });
    }

    const challengeValue = type === "email" ? challenge.email : challenge.phone;
    if (!challengeValue || challengeValue !== normalizedValue) {
      return NextResponse.json({ success: false, message: "Verification token does not match this contact." }, { status: 400 });
    }

    if (type === "phone") {
      const verified = await verifyPhoneOtpViaTwilio(normalizedValue, otp);
      if (!verified) {
        return NextResponse.json({ success: false, message: "Invalid OTP." }, { status: 400 });
      }
    } else {
      if (!challenge.email || !challenge.emailOtpHash || hashEmailOtp(normalizedValue, otp) !== challenge.emailOtpHash) {
        return NextResponse.json({ success: false, message: "Invalid OTP." }, { status: 400 });
      }
    }

    const verifiedToken = signAuthChallengeToken({
      purpose: "profile_contact_verified",
      userId: authUser.id,
      email: type === "email" ? normalizedValue : undefined,
      phone: type === "phone" ? normalizedValue : undefined
    });

    return NextResponse.json({
      success: true,
      message: `${type === "email" ? "Email" : "Phone number"} verified successfully.`,
      verifiedToken
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unable to verify OTP." },
      { status: 500 }
    );
  }
}
