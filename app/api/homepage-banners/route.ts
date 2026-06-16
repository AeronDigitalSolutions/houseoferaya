import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVersionedBannerUrl } from "@/lib/homepage-banner-storage";
import { publicUploadFileExists } from "@/lib/upload-storage";

const DESKTOP_FALLBACK_BANNERS = [
  "/assets/banner/banner%201.png",
  "/assets/banner/banner%202.png",
  "/assets/banner/banner%203.png"
];

const MOBILE_FALLBACK_BANNERS = [
  "/assets/banner/banner%20m1.png",
  "/assets/banner/banner%20m2.png",
  "/assets/banner/banner%20m3.png"
];

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

async function mapBannerWithResilientUrl(
  banner: {
    id: string;
    title: string | null;
    publicUrl: string;
    sortOrder: number;
    updatedAt: Date;
  },
  fallbackSet: string[]
) {
  if (await publicUploadFileExists(banner.publicUrl)) {
    return mapBanner(banner);
  }

  const fallbackUrl = fallbackSet[banner.sortOrder] ?? fallbackSet[0];
  return {
    ...mapBanner(banner),
    publicUrl: fallbackUrl
  };
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

    const [safeDesktop, safeMobile] = await Promise.all([
      Promise.all(desktop.map((banner) => mapBannerWithResilientUrl(banner, DESKTOP_FALLBACK_BANNERS))),
      Promise.all(mobile.map((banner) => mapBannerWithResilientUrl(banner, MOBILE_FALLBACK_BANNERS)))
    ]);

    return NextResponse.json({
      success: true,
      desktop: safeDesktop,
      mobile: safeMobile
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
