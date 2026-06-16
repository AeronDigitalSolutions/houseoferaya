import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/session";

export async function POST(request: Request) {
  const response = NextResponse.json({ success: true, message: "Logged out successfully." });
  clearSessionCookie(response, request);
  return response;
}
