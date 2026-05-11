import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteHomepageBannerImageByUrl, saveHomepageBannerImage, type HomepageBannerDevice } from "@/lib/homepage-banner-storage";
import { getVersionedBannerUrl } from "@/lib/homepage-banner-storage";
import { getAdminAuthFromRequest } from "@/lib/auth/admin-session";

export const runtime = "nodejs";

function isAllowed(admin: Awaited<ReturnType<typeof getAdminAuthFromRequest>>) {
  return Boolean(admin && admin.isActive && (admin.role === "SUPER_ADMIN" || admin.permissions.canManageHomepageMedia));
}

function parseDeviceType(value: string | null): HomepageBannerDevice | null {
  if (value === "DESKTOP" || value === "MOBILE") return value;
  return null;
}

function mapBanner(banner: {
  id: string;
  deviceType: string;
  title: string | null;
  fileName: string;
  publicUrl: string;
  width: number;
  height: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: banner.id,
    deviceType: banner.deviceType,
    title: banner.title,
    fileName: banner.fileName,
    publicUrl: getVersionedBannerUrl(banner.publicUrl, banner.updatedAt),
    width: banner.width,
    height: banner.height,
    sortOrder: banner.sortOrder,
    isActive: banner.isActive,
    createdAt: banner.createdAt.toISOString(),
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

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminAuthFromRequest(request);
    if (!isAllowed(admin)) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const deviceType = parseDeviceType(request.nextUrl.searchParams.get("deviceType"));
    const where = deviceType ? { deviceType } : undefined;
    const banners = await prisma.homepageBanner.findMany({
      where,
      orderBy: [{ deviceType: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }]
    });

    return NextResponse.json({
      success: true,
      banners: banners.map(mapBanner)
    });
  } catch (error) {
    if (isKnownPrismaTableError(error)) {
      return NextResponse.json(
        {
          success: false,
          message: "Homepage banners table is missing. Run Prisma sync before using this module."
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch homepage banners."
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminAuthFromRequest(request);
    if (!isAllowed(admin)) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const formData = await request.formData();
    const deviceType = parseDeviceType(String(formData.get("deviceType") || "").trim().toUpperCase());
    const title = String(formData.get("title") || "").trim();
    const fileValue = formData.get("file");

    if (!deviceType) {
      return NextResponse.json({ success: false, message: "deviceType is required." }, { status: 400 });
    }
    if (!(fileValue instanceof File)) {
      return NextResponse.json({ success: false, message: "file is required." }, { status: 400 });
    }

    const saved = await saveHomepageBannerImage({
      file: fileValue,
      deviceType,
      preferredName: title || undefined
    });

    const maxSort = await prisma.homepageBanner.aggregate({
      where: { deviceType },
      _max: { sortOrder: true }
    });

    const banner = await prisma.homepageBanner.create({
      data: {
        deviceType,
        title: title || null,
        fileName: saved.fileName,
        publicUrl: saved.publicUrl,
        width: saved.width,
        height: saved.height,
        sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
        isActive: true,
        createdByAdminId: admin?.id,
        updatedByAdminId: admin?.id
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: "Banner uploaded successfully.",
        banner: mapBanner(banner)
      },
      { status: 201 }
    );
  } catch (error) {
    if (isKnownPrismaTableError(error)) {
      return NextResponse.json(
        {
          success: false,
          message: "Homepage banners table is missing. Run Prisma sync before using this module."
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to upload banner."
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

    const payload = (await request.json()) as {
      action?: "toggle-active" | "update-title" | "reorder";
      id?: string;
      isActive?: boolean;
      title?: string;
      direction?: "up" | "down";
    };

    const id = String(payload.id || "");
    if (!id) {
      return NextResponse.json({ success: false, message: "id is required." }, { status: 400 });
    }

    const banner = await prisma.homepageBanner.findUnique({ where: { id } });
    if (!banner) {
      return NextResponse.json({ success: false, message: "Banner not found." }, { status: 404 });
    }

    if (payload.action === "toggle-active") {
      const updated = await prisma.homepageBanner.update({
        where: { id },
        data: { isActive: Boolean(payload.isActive), updatedByAdminId: admin?.id }
      });
      return NextResponse.json({ success: true, banner: mapBanner(updated), message: "Banner status updated." });
    }

    if (payload.action === "update-title") {
      const nextTitle = String(payload.title || "").trim();
      const updated = await prisma.homepageBanner.update({
        where: { id },
        data: { title: nextTitle || null, updatedByAdminId: admin?.id }
      });
      return NextResponse.json({ success: true, banner: mapBanner(updated), message: "Banner title updated." });
    }

    if (payload.action === "reorder") {
      const direction = payload.direction === "down" ? "down" : "up";
      const group = await prisma.homepageBanner.findMany({
        where: { deviceType: banner.deviceType },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
      });
      const index = group.findIndex((item) => item.id === id);
      if (index === -1) {
        return NextResponse.json({ success: false, message: "Banner not found in group." }, { status: 404 });
      }

      const swapIndex = direction === "up" ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= group.length) {
        return NextResponse.json({ success: false, message: "Banner already at limit." }, { status: 400 });
      }

      const current = group[index];
      const target = group[swapIndex];

      await prisma.$transaction([
        prisma.homepageBanner.update({
          where: { id: current.id },
          data: { sortOrder: target.sortOrder, updatedByAdminId: admin?.id }
        }),
        prisma.homepageBanner.update({
          where: { id: target.id },
          data: { sortOrder: current.sortOrder, updatedByAdminId: admin?.id }
        })
      ]);

      const updatedGroup = await prisma.homepageBanner.findMany({
        where: { deviceType: banner.deviceType },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
      });

      return NextResponse.json({
        success: true,
        message: "Banner order updated.",
        banners: updatedGroup.map(mapBanner)
      });
    }

    return NextResponse.json({ success: false, message: "Invalid action." }, { status: 400 });
  } catch (error) {
    if (isKnownPrismaTableError(error)) {
      return NextResponse.json(
        {
          success: false,
          message: "Homepage banners table is missing. Run Prisma sync before using this module."
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update banner."
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await getAdminAuthFromRequest(request);
    if (!isAllowed(admin)) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const formData = await request.formData();
    const id = String(formData.get("id") || "").trim();
    const fileValue = formData.get("file");
    const title = String(formData.get("title") || "").trim();

    if (!id) {
      return NextResponse.json({ success: false, message: "id is required." }, { status: 400 });
    }
    if (!(fileValue instanceof File)) {
      return NextResponse.json({ success: false, message: "file is required." }, { status: 400 });
    }

    const banner = await prisma.homepageBanner.findUnique({ where: { id } });
    if (!banner) {
      return NextResponse.json({ success: false, message: "Banner not found." }, { status: 404 });
    }

    const saved = await saveHomepageBannerImage({
      file: fileValue,
      deviceType: banner.deviceType as HomepageBannerDevice,
      preferredName: title || banner.title || undefined
    });

    const updated = await prisma.homepageBanner.update({
      where: { id },
      data: {
        title: title || null,
        fileName: saved.fileName,
        publicUrl: saved.publicUrl,
        width: saved.width,
        height: saved.height,
        updatedByAdminId: admin?.id
      }
    });

    if (updated.publicUrl !== banner.publicUrl) {
      try {
        await deleteHomepageBannerImageByUrl(banner.publicUrl);
      } catch {
        // Ignore cleanup errors to avoid blocking successful updates.
      }
    }

    return NextResponse.json({
      success: true,
      message: "Banner replaced successfully.",
      banner: mapBanner(updated)
    });
  } catch (error) {
    if (isKnownPrismaTableError(error)) {
      return NextResponse.json(
        {
          success: false,
          message: "Homepage banners table is missing. Run Prisma sync before using this module."
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to replace banner."
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getAdminAuthFromRequest(request);
    if (!isAllowed(admin)) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const id = String(request.nextUrl.searchParams.get("id") || "").trim();
    if (!id) {
      return NextResponse.json({ success: false, message: "id is required." }, { status: 400 });
    }

    const banner = await prisma.homepageBanner.findUnique({ where: { id } });
    if (!banner) {
      return NextResponse.json({ success: false, message: "Banner not found." }, { status: 404 });
    }

    await prisma.homepageBanner.delete({ where: { id } });
    try {
      await deleteHomepageBannerImageByUrl(banner.publicUrl);
    } catch {
      // Ignore cleanup errors so delete is still successful.
    }

    return NextResponse.json({ success: true, message: "Banner deleted successfully." });
  } catch (error) {
    if (isKnownPrismaTableError(error)) {
      return NextResponse.json(
        {
          success: false,
          message: "Homepage banners table is missing. Run Prisma sync before using this module."
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete banner."
      },
      { status: 500 }
    );
  }
}
