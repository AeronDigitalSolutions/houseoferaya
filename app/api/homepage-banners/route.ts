import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVersionedBannerUrl } from "@/lib/homepage-banner-storage";

function mapBanner(banner: {
  id: string;
  title: string | null;
  publicUrl: string;
  sortOrder: number;
  updatedAt: Date;
}) {
  return {
    id: banner.id,
    title: banner.title,
    publicUrl: getVersionedBannerUrl(banner.publicUrl, banner.updatedAt),
    sortOrder: banner.sortOrder,
    updatedAt: banner.updatedAt.toISOString()
  };
}

function isKnownPrismaTableError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2021"
  );
}

export async function GET() {
  try {
    // TODO: move to cache + edge strategy when homepage media is finalized.
    const [desktop, mobile] = await Promise.all([
      prisma.homepageBanner.findMany({
        where: { deviceType: "DESKTOP", isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: { id: true, title: true, publicUrl: true, sortOrder: true, updatedAt: true }
      }),
      prisma.homepageBanner.findMany({
        where: { deviceType: "MOBILE", isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: { id: true, title: true, publicUrl: true, sortOrder: true, updatedAt: true }
      })
    ]);

    return NextResponse.json({
      success: true,
      desktop: desktop.map(mapBanner),
      mobile: mobile.map(mapBanner)
    });
  } catch (error) {
    if (isKnownPrismaTableError(error)) {
      return NextResponse.json(
        {
          success: true,
          desktop: [],
          mobile: []
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unable to fetch homepage banners.",
        desktop: [],
        mobile: []
      },
      { status: 500 }
    );
  }
}
