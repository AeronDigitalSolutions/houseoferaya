import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OTP_FALLBACK_CODE } from "@/lib/auth/constants";
import { verifyAuthChallengeToken } from "@/lib/auth/jwt";
import { attachSessionCookie } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const otp = String(body?.otp || "").trim();
    const challengeToken = String(body?.challengeToken || "").trim();

    if (!otp || !challengeToken) {
      return NextResponse.json(
        { success: false, message: "OTP and challenge token are required." },
        { status: 400 }
      );
    }

    const validOtp = process.env.DUMMY_OTP || OTP_FALLBACK_CODE;
    if (otp !== validOtp) {
      return NextResponse.json({ success: false, message: "Invalid OTP." }, { status: 400 });
    }

    const challenge = verifyAuthChallengeToken(challengeToken);
    if (!challenge || challenge.purpose !== "login" || !challenge.userId) {
      return NextResponse.json({ success: false, message: "Invalid or expired verification token." }, { status: 400 });
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
      redirectTo: "/account/profile"
    });

    attachSessionCookie(response, user);
    return response;
  } catch (error) {
    console.error("Auth login verify error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Login verification failed due to a server issue. Please try again."
      },
      { status: 500 }
    );
  }
}
