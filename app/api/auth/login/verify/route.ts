import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuthChallengeToken } from "@/lib/auth/jwt";
import { attachSessionCookie } from "@/lib/auth/session";
import { hashEmailOtp } from "@/lib/email-otp";
import { verifyPhoneOtpViaTwilio } from "@/lib/twilio-verify";

function sanitizeNextPath(value: unknown) {
  const nextPath = String(value || "").trim();
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/account/profile";
  }
  return nextPath;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const otp = String(body?.otp || "").trim();
    const challengeToken = String(body?.challengeToken || "").trim();
    const redirectTo = sanitizeNextPath(body?.next);

    if (!otp || !challengeToken) {
      return NextResponse.json(
        { success: false, message: "OTP and challenge token are required." },
        { status: 400 }
      );
    }

    const challenge = verifyAuthChallengeToken(challengeToken);
    if (!challenge || challenge.purpose !== "login" || !challenge.userId) {
      return NextResponse.json({ success: false, message: "Invalid or expired verification token." }, { status: 400 });
    }

    if (challenge.phone) {
      const verified = await verifyPhoneOtpViaTwilio(challenge.phone, otp);
      if (!verified) {
        return NextResponse.json({ success: false, message: "Invalid OTP." }, { status: 400 });
      }
    } else {
      if (!challenge.email || !challenge.emailOtpHash || hashEmailOtp(challenge.email, otp) !== challenge.emailOtpHash) {
        return NextResponse.json({ success: false, message: "Invalid OTP." }, { status: 400 });
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: challenge.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ success: false, message: "Account not available." }, { status: 404 });
    }

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      redirectTo
    });

    attachSessionCookie(response, request, user);
    return response;
  } catch (error) {
    console.error("Auth login verify error:", error);
    const message = error instanceof Error ? error.message : "";
    return NextResponse.json(
      {
        success: false,
        message: message || "Login verification failed due to a server issue. Please try again."
      },
      { status: 500 }
    );
  }
}
