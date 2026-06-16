import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminAuthFromRequest } from "@/lib/auth/admin-session";
import { saveHomepageTestimonialImage } from "@/lib/homepage-testimonial-storage";

export const runtime = "nodejs";

function isAllowed(admin: Awaited<ReturnType<typeof getAdminAuthFromRequest>>) {
  return Boolean(admin && admin.isActive && (admin.role === "SUPER_ADMIN" || admin.permissions.canManageHomepageMedia));
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminAuthFromRequest(request);
    if (!isAllowed(admin)) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const formData = await request.formData();
    const customerName = String(formData.get("customerName") || "").trim();
    const quote = String(formData.get("quote") || "").trim();
    const sortOrder = Math.max(0, Number(formData.get("sortOrder") || 0) || 0);
    const isActive = String(formData.get("isActive") || "true").toLowerCase() !== "false";
    const imageValue = formData.get("image");

    if (!customerName || !quote) {
      return NextResponse.json({ success: false, message: "Customer name and testimonial are required." }, { status: 400 });
    }

    let imageUrl: string | null = null;
    if (imageValue instanceof File && imageValue.size > 0) {
      const saved = await saveHomepageTestimonialImage({
        file: imageValue,
        preferredName: customerName
      });
      imageUrl = saved.publicUrl;
    }

    const created = await prisma.homepageTestimonial.create({
      data: {
        customerName,
        quote,
        imageUrl,
        sortOrder,
        isActive
      }
    });

    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: "Testimonial added successfully.",
      testimonial: created
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to add testimonial."
      },
      { status: 500 }
    );
  }
}
