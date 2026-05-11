import { NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/lib/auth/admin-session";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully." });
  clearAdminSessionCookie(response);
  return response;
}
