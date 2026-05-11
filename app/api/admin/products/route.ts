import { NextRequest, NextResponse } from "next/server";
import {
  BaseMetal,
  MakingChargeType,
  MetalColor,
  PurityType,
  StoneCostType
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminAuthFromRequest } from "@/lib/auth/admin-session";
import { calculateJewelryPrice, PURITY_FACTOR_MAP, resolveProductMetalRate } from "@/lib/jewelry-pricing";
import { buildProductPricing, productPricingSelect } from "@/lib/product-pricing";
import { isSignatureProductSlug } from "@/lib/signature-piece";

function canManageProducts(admin: NonNullable<Awaited<ReturnType<typeof getAdminAuthFromRequest>>>) {
  return admin.role === "SUPER_ADMIN" || admin.permissions.canEditProducts || admin.permissions.canViewProducts;
}

function normalizeImageUrl(value: unknown) {
  const url = String(value || "").trim();
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return url;
  return `/${url}`;
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdminAuthFromRequest(request);
    if (!admin || !admin.isActive) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }
    if (!canManageProducts(admin)) {
      return NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 });
    }

    const [categories, products] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true }
      }),
      prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        select: productPricingSelect
      })
    ]);

    return NextResponse.json({
      success: true,
      categories,
      products: products.map((product) => {
        const pricing = buildProductPricing(product);
        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          stock: product.stock,
          baseMetal: product.baseMetal,
          purity: product.purity,
          weightGrams: Number(product.weightGrams),
          finalPrice: pricing.finalPrice,
          isActive: product.isActive,
          isSignature: isSignatureProductSlug(product.slug)
        };
      })
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to load products." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminAuthFromRequest(request);
    if (!admin || !admin.isActive) {
      return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
    }
    if (!(admin.role === "SUPER_ADMIN" || admin.permissions.canEditProducts)) {
      return NextResponse.json({ success: false, message: "Forbidden." }, { status: 403 });
    }

    const body = await request.json();

    const name = String(body?.name || "").trim();
    const requestedSlug = String(body?.slug || "").trim().toLowerCase();
    const isSignature = Boolean(body?.isSignature);
    const slug =
      isSignature && requestedSlug && !requestedSlug.startsWith("signature-")
        ? `signature-${requestedSlug}`
        : requestedSlug;
    const description = String(body?.description || "").trim();
    const sku = String(body?.sku || "").trim().toUpperCase();
    const categoryId = String(body?.categoryId || "").trim();

    if (!name || !slug || !description || !sku || !categoryId) {
      return NextResponse.json({ success: false, message: "Please fill required basic fields." }, { status: 400 });
    }

    const baseMetal = (String(body?.baseMetal || "GOLD").toUpperCase() as BaseMetal) || BaseMetal.GOLD;
    const metalColor = (String(body?.metalColor || "YELLOW_GOLD").toUpperCase() as MetalColor) || MetalColor.YELLOW_GOLD;
    const purity = (String(body?.purity || "K18").toUpperCase() as PurityType) || PurityType.K18;
    const purityFactor = Number(body?.purityFactor ?? PURITY_FACTOR_MAP[purity]);
    const weightGrams = Number(body?.weightGrams ?? 0);
    const activeGoldRate = Number(body?.activeGoldRate ?? 0);
    const activeSilverRate = Number(body?.activeSilverRate ?? 0);
    const useManualSellingRate = Boolean(body?.useManualSellingRate);
    const manualSellingRate = body?.manualSellingRate != null ? Number(body.manualSellingRate) : null;
    const makingChargeType = (String(body?.makingChargeType || "PER_GRAM").toUpperCase() as MakingChargeType) || MakingChargeType.PER_GRAM;
    const makingChargeValue = Number(body?.makingChargeValue ?? 0);
    const hasStone = Boolean(body?.hasStone);
    const stoneType = hasStone ? String(body?.stoneType || "").trim() || null : null;
    const stoneCostType = (String(body?.stoneCostType || "FIXED").toUpperCase() as StoneCostType) || StoneCostType.FIXED;
    const stoneCostValue = Number(body?.stoneCostValue ?? 0);
    const stoneCarat = hasStone ? Number(body?.stoneCarat ?? 0) : 0;
    const huidCharge = Number(body?.huidCharge ?? 55);
    const gstPercentage = Number(body?.gstPercentage ?? 3);
    const stock = Number(body?.stock ?? 0);
    const compareAtPrice = body?.compareAtPrice != null && body.compareAtPrice !== "" ? Number(body.compareAtPrice) : null;
    const certification = String(body?.certification || "In-house Certified").trim();
    const gemstone = String(body?.gemstone || (hasStone ? stoneType || "Stone" : "None")).trim();
    const primaryImageUrl = normalizeImageUrl(body?.primaryImageUrl);
    const secondaryImageUrls = Array.isArray(body?.secondaryImageUrls)
      ? body.secondaryImageUrls.map((url: unknown) => normalizeImageUrl(url)).filter(Boolean)
      : [];

    if (weightGrams <= 0 || makingChargeValue < 0 || stoneCostValue < 0 || huidCharge < 0 || gstPercentage < 0) {
      return NextResponse.json({ success: false, message: "Invalid numeric values in pricing fields." }, { status: 400 });
    }

    const chosenRate = resolveProductMetalRate({
      baseMetal,
      activeGoldRate: Number.isFinite(activeGoldRate) ? activeGoldRate : null,
      activeSilverRate: Number.isFinite(activeSilverRate) ? activeSilverRate : null,
      useManualSellingRate,
      manualSellingRate: Number.isFinite(manualSellingRate ?? NaN) ? Number(manualSellingRate) : null
    });

    const priceBreakdown = calculateJewelryPrice({
      baseMetal,
      metalRate: chosenRate,
      weightGrams,
      purityFactor,
      makingChargeType,
      makingChargeValue,
      stoneCostType,
      stoneCostValue,
      stoneCarat,
      huidCharge,
      gstPercentage
    });

    const created = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: priceBreakdown.finalPrice,
        compareAtPrice,
        sku,
        stock: Math.max(0, Math.floor(stock)),
        metalType:
          baseMetal === BaseMetal.GOLD
            ? purity === PurityType.K14
              ? "14K Gold"
              : purity === PurityType.K18
                ? "18K Gold"
                : purity === PurityType.K22
                  ? "22K Gold"
                  : "24K Gold"
            : "925 Silver",
        gemstone,
        weight: `${weightGrams}g`,
        certification,
        categoryId,
        baseMetal,
        metalColor,
        purity,
        purityFactor,
        weightGrams,
        activeGoldRate: Number.isFinite(activeGoldRate) && activeGoldRate > 0 ? activeGoldRate : null,
        activeSilverRate: Number.isFinite(activeSilverRate) && activeSilverRate > 0 ? activeSilverRate : null,
        useLockedRate: true,
        useManualSellingRate,
        manualSellingRate: useManualSellingRate && manualSellingRate && manualSellingRate > 0 ? manualSellingRate : null,
        makingChargeType,
        makingChargeValue,
        hasStone,
        stoneType,
        stoneCarat: hasStone && stoneCarat > 0 ? stoneCarat : null,
        stoneCostType,
        stoneCostValue,
        huidCharge,
        gstPercentage
      },
      select: { id: true, name: true, slug: true, price: true, sku: true, stock: true }
    });

    const imageRecords: {
      productId: string;
      url: string;
      altText: string | null;
      isPrimary: boolean;
      sortOrder: number;
    }[] = [];

    if (primaryImageUrl) {
      imageRecords.push({
        productId: created.id,
        url: primaryImageUrl,
        altText: name,
        isPrimary: true,
        sortOrder: 0
      });
    }

    secondaryImageUrls.forEach((url: string, index: number) => {
      imageRecords.push({
        productId: created.id,
        url,
        altText: name,
        isPrimary: false,
        sortOrder: index + 1
      });
    });

    if (imageRecords.length) {
      await prisma.productImage.createMany({ data: imageRecords });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product created with pricing components.",
        product: {
          ...created,
          price: Number(created.price),
          isSignature: isSignatureProductSlug(created.slug),
          pricingBreakdown: priceBreakdown
        }
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Failed to create product." },
      { status: 500 }
    );
  }
}
