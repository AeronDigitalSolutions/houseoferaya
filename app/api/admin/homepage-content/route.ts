import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminAuthFromRequest } from "@/lib/auth/admin-session";
import { getHomepageAdminContentPayload, parseHomepageContentConfig } from "@/lib/homepage-content";

export const runtime = "nodejs";

function isAllowed(admin: Awaited<ReturnType<typeof getAdminAuthFromRequest>>) {
  return Boolean(admin && admin.isActive && (admin.role === "SUPER_ADMIN" || admin.permissions.canManageHomepageMedia));
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminAuthFromRequest(request);
    if (!isAllowed(admin)) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const payload = await getHomepageAdminContentPayload();
    return NextResponse.json({ success: true, ...payload });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to load homepage content."
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getAdminAuthFromRequest(request);
    if (!isAllowed(admin)) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as {
      section?: "hero" | "new-arrivals" | "featured-collections" | "bestseller" | "signature";
      payload?: unknown;
    };

    const section = String(body?.section || "").trim();
    if (!section) {
      return NextResponse.json({ success: false, message: "section is required." }, { status: 400 });
    }

    const existing = await prisma.homepageContent.findFirst({
      where: { key: "main" },
      select: {
        id: true,
        heroSection: true,
        newArrivalsSection: true,
        featuredCollectionsSection: true,
        bestsellerSection: true,
        signatureSection: true
      }
    });

    const nextConfig = parseHomepageContentConfig({
      heroSection: section === "hero" ? ((body.payload ?? null) as never) : existing?.heroSection ?? null,
      newArrivalsSection:
        section === "new-arrivals" ? ((body.payload ?? null) as never) : existing?.newArrivalsSection ?? null,
      featuredCollectionsSection:
        section === "featured-collections"
          ? ((body.payload ?? null) as never)
          : existing?.featuredCollectionsSection ?? null,
      bestsellerSection:
        section === "bestseller" ? ((body.payload ?? null) as never) : existing?.bestsellerSection ?? null,
      signatureSection:
        section === "signature" ? ((body.payload ?? null) as never) : existing?.signatureSection ?? null
    });

    const saved = await prisma.homepageContent.upsert({
      where: { key: "main" },
      create: {
        key: "main",
        heroSection: nextConfig.hero as never,
        newArrivalsSection: nextConfig.newArrivals as never,
        featuredCollectionsSection: nextConfig.featuredCollections as never,
        bestsellerSection: nextConfig.bestseller as never,
        signatureSection: nextConfig.signature as never
      },
      update: {
        heroSection: nextConfig.hero as never,
        newArrivalsSection: nextConfig.newArrivals as never,
        featuredCollectionsSection: nextConfig.featuredCollections as never,
        bestsellerSection: nextConfig.bestseller as never,
        signatureSection: nextConfig.signature as never
      }
    });

    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: "Homepage section updated successfully.",
      config: parseHomepageContentConfig(saved)
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update homepage content."
      },
      { status: 500 }
    );
  }
}
