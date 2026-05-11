import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
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
    if (!challenge || challenge.purpose !== "register") {
      return NextResponse.json({ success: false, message: "Invalid or expired verification token." }, { status: 400 });
    }

    if (!challenge.email && !challenge.phone) {
      return NextResponse.json({ success: false, message: "Invalid contact details." }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          challenge.email ? { email: challenge.email } : undefined,
          challenge.phone ? { phone: challenge.phone } : undefined
        ].filter(Boolean) as Array<{ email: string } | { phone: string }>
      },
      select: { id: true }
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          code: "USER_EXISTS",
          message: "Account already exists. Please login."
        },
        { status: 409 }
      );
    }

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: challenge.fullName || null,
          email: challenge.email || null,
          phone: challenge.phone || null,
          role: UserRole.CUSTOMER
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true
        }
      });

      await tx.cart.create({ data: { userId: created.id } });
      await tx.wishlist.create({ data: { userId: created.id } });
      return created;
    });

    const response = NextResponse.json({
      success: true,
      message: "Registration successful.",
      user,
      profileCompleted: Boolean(user.name),
      redirectTo: "/account/profile"
    });

    attachSessionCookie(response, user);
    return response;
  } catch (error) {
    console.error("Auth register verify error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Signup verification failed due to a server issue. Please try again."
      },
      { status: 500 }
    );
  }
}
