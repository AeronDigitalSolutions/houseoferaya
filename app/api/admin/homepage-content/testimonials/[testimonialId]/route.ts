import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminAuthFromRequest } from "@/lib/auth/admin-session";
import {
  deleteHomepageTestimonialImageByUrl,
  saveHomepageTestimonialImage
} from "@/lib/homepage-testimonial-storage";

export const runtime = "nodejs";

function isAllowed(admin: Awaited<ReturnType<typeof getAdminAuthFromRequest>>) {
  return Boolean(admin && admin.isActive && (admin.role === "SUPER_ADMIN" || admin.permissions.canManageHomepageMedia));
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ testimonialId: string }> }
) {
  try {
    const admin = await getAdminAuthFromRequest(request);
    if (!isAllowed(admin)) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const { testimonialId } = await params;
    const existing = await prisma.homepageTestimonial.findUnique({ where: { id: testimonialId } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Testimonial not found." }, { status: 404 });
    }

    const formData = await request.formData();
    const customerName = String(formData.get("customerName") || existing.customerName).trim();
    const quote = String(formData.get("quote") || existing.quote).trim();
    const sortOrder = Math.max(0, Number(formData.get("sortOrder") || existing.sortOrder) || 0);
    const isActive = String(formData.get("isActive") || String(existing.isActive)).toLowerCase() !== "false";
    const removeImage = String(formData.get("removeImage") || "false").toLowerCase() === "true";
    const imageValue = formData.get("image");

    if (!customerName || !quote) {
      return NextResponse.json({ success: false, message: "Customer name and testimonial are required." }, { status: 400 });
    }

    let imageUrl = existing.imageUrl;
    if (removeImage) {
      await deleteHomepageTestimonialImageByUrl(existing.imageUrl);
      imageUrl = null;
    }

    if (imageValue instanceof File && imageValue.size > 0) {
      const saved = await saveHomepageTestimonialImage({
        file: imageValue,
        preferredName: customerName
      });
      await deleteHomepageTestimonialImageByUrl(existing.imageUrl);
      imageUrl = saved.publicUrl;
    }

    const updated = await prisma.homepageTestimonial.update({
      where: { id: testimonialId },
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
      message: "Testimonial updated successfully.",
      testimonial: updated
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update testimonial."
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ testimonialId: string }> }
) {
  try {
    const admin = await getAdminAuthFromRequest(request);
    if (!isAllowed(admin)) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }

    const { testimonialId } = await params;
    const existing = await prisma.homepageTestimonial.findUnique({ where: { id: testimonialId } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Testimonial not found." }, { status: 404 });
    }

    await deleteHomepageTestimonialImageByUrl(existing.imageUrl);
    await prisma.homepageTestimonial.delete({ where: { id: testimonialId } });

    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: "Testimonial deleted successfully."
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete testimonial."
      },
      { status: 500 }
    );
  }
}
