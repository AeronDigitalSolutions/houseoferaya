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
import { ARTIFICIAL_GST_PERCENTAGE, isArtificialBaseMetal } from "@/lib/product-materials";
import { buildProductPricing, productPricingSelect } from "@/lib/product-pricing";
import { isSignatureProductSlug } from "@/lib/signature-piece";

function canManageProducts(admin: NonNullable<Awaited<ReturnType<typeof getAdminAuthFromRequest>>>) {
  return admin.role === "SUPER_ADMIN" || admin.permissions.canEditProducts || admin.permissions.canViewProducts;
}

const ALLOWED_METAL_COLORS: Record<BaseMetal, MetalColor[]> = {
  GOLD: [MetalColor.YELLOW_GOLD, MetalColor.ROSE_GOLD, MetalColor.WHITE_GOLD],
  SILVER: [MetalColor.OXIDISED_SILVER],
  ARTIFICIAL: [MetalColor.NOT_APPLICABLE]
};

const ALLOWED_PURITY: Record<BaseMetal, PurityType[]> = {
  GOLD: [PurityType.K24, PurityType.K22, PurityType.K18, PurityType.K14],
  SILVER: [PurityType.S925],
  ARTIFICIAL: [PurityType.NOT_APPLICABLE]
};

function normalizeImageUrl(value: unknown) {
  const url = String(value || "").trim();
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return url;
  return `/${url}`;
}

function getMetalTypeLabel(baseMetal: BaseMetal, purity: PurityType) {
  if (baseMetal === BaseMetal.ARTIFICIAL) return "Artificial";
  if (baseMetal === BaseMetal.SILVER) return "925 Silver";
  if (purity === PurityType.K14) return "14K Gold";
  if (purity === PurityType.K18) return "18K Gold";
  if (purity === PurityType.K22) return "22K Gold";
  return "24K Gold";
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
    const slug = isSignature
      ? requestedSlug && !requestedSlug.startsWith("signature-")
        ? `signature-${requestedSlug}`
        : requestedSlug
      : requestedSlug.startsWith("signature-")
        ? requestedSlug.replace(/^signature-/, "")
        : requestedSlug;
    const description = String(body?.description || "").trim();
    const sku = String(body?.sku || "").trim().toUpperCase();
    const categoryId = String(body?.categoryId || "").trim();

    if (!name || !slug || !description || !sku || !categoryId) {
      return NextResponse.json({ success: false, message: "Please fill required basic fields." }, { status: 400 });
    }

    const baseMetalInput = String(body?.baseMetal || "GOLD").toUpperCase();
    const baseMetal =
      baseMetalInput === BaseMetal.SILVER
        ? BaseMetal.SILVER
        : baseMetalInput === BaseMetal.ARTIFICIAL
          ? BaseMetal.ARTIFICIAL
          : BaseMetal.GOLD;
    const isArtificial = isArtificialBaseMetal(baseMetal);
    const metalColorInput = String(body?.metalColor || (isArtificial ? "NOT_APPLICABLE" : "YELLOW_GOLD")).toUpperCase() as MetalColor;
    const purityInput = String(body?.purity || (isArtificial ? "NOT_APPLICABLE" : "K18")).toUpperCase() as PurityType;

    if (!ALLOWED_METAL_COLORS[baseMetal].includes(metalColorInput)) {
      return NextResponse.json({ success: false, message: "Invalid metal color for selected base metal." }, { status: 400 });
    }

    if (!ALLOWED_PURITY[baseMetal].includes(purityInput)) {
      return NextResponse.json({ success: false, message: "Invalid purity for selected base metal." }, { status: 400 });
    }

    const metalColor = metalColorInput;
    const purity = purityInput;
    const purityFactor = isArtificial ? 0 : Number(PURITY_FACTOR_MAP[purity]);
    const weightGrams = isArtificial ? 0 : Number(body?.weightGrams ?? 0);
    const activeGoldRate = isArtificial ? null : Number(body?.activeGoldRate ?? 0);
    const activeSilverRate = isArtificial ? null : Number(body?.activeSilverRate ?? 0);
    const useManualSellingRate = isArtificial ? false : Boolean(body?.useManualSellingRate);
    const manualSellingRate = isArtificial ? null : body?.manualSellingRate != null ? Number(body.manualSellingRate) : null;
    const makingChargeType = isArtificial
      ? MakingChargeType.FIXED
      : ((String(body?.makingChargeType || "PER_GRAM").toUpperCase() as MakingChargeType) || MakingChargeType.PER_GRAM);
    const makingChargeValue = isArtificial ? 0 : Number(body?.makingChargeValue ?? 0);
    const hasStone = isArtificial ? false : Boolean(body?.hasStone);
    const stoneType = hasStone ? String(body?.stoneType || "").trim() || null : null;
    const stoneCostType = isArtificial
      ? StoneCostType.FIXED
      : ((String(body?.stoneCostType || "FIXED").toUpperCase() as StoneCostType) || StoneCostType.FIXED);
    const stoneCostValue = isArtificial ? 0 : Number(body?.stoneCostValue ?? 0);
    const stoneCarat = hasStone ? Number(body?.stoneCarat ?? 0) : 0;
    const huidCharge = isArtificial ? 0 : Number(body?.huidCharge ?? 55);
    const gstPercentage = isArtificial ? ARTIFICIAL_GST_PERCENTAGE : Number(body?.gstPercentage ?? 3);
    const stock = Number(body?.stock ?? 0);
    const offerPrice = body?.offerPrice != null && body.offerPrice !== "" ? Number(body.offerPrice) : null;
    const compareAtPrice = body?.compareAtPrice != null && body.compareAtPrice !== "" ? Number(body.compareAtPrice) : null;
    const certification = String(body?.certification || "In-house Certified").trim();
    const gemstone = isArtificial ? null : String(body?.gemstone || (hasStone ? stoneType || "Stone" : "None")).trim();
    const primaryImageUrl = normalizeImageUrl(body?.primaryImageUrl);
    const secondaryImageUrls = Array.isArray(body?.secondaryImageUrls)
      ? body.secondaryImageUrls.map((url: unknown) => normalizeImageUrl(url)).filter(Boolean)
      : [];

    if (!isArtificial && (weightGrams <= 0 || makingChargeValue < 0 || stoneCostValue < 0 || huidCharge < 0 || gstPercentage < 0)) {
      return NextResponse.json({ success: false, message: "Invalid numeric values in pricing fields." }, { status: 400 });
    }
    if (offerPrice == null || !Number.isFinite(offerPrice) || offerPrice <= 0) {
      return NextResponse.json({ success: false, message: "Offer price is required and must be greater than 0." }, { status: 400 });
    }
    if (compareAtPrice == null || !Number.isFinite(compareAtPrice) || compareAtPrice <= 0) {
      return NextResponse.json({ success: false, message: "MRP is required and must be greater than 0." }, { status: 400 });
    }

    const normalizedActiveGoldRate =
      baseMetal === BaseMetal.GOLD && typeof activeGoldRate === "number" && Number.isFinite(activeGoldRate) && activeGoldRate > 0
        ? activeGoldRate
        : null;
    const normalizedActiveSilverRate =
      baseMetal === BaseMetal.SILVER &&
      typeof activeSilverRate === "number" &&
      Number.isFinite(activeSilverRate) &&
      activeSilverRate > 0
        ? activeSilverRate
        : null;

    const chosenRate = isArtificial
      ? 0
      : resolveProductMetalRate({
          baseMetal,
          activeGoldRate: normalizedActiveGoldRate,
          activeSilverRate: normalizedActiveSilverRate,
          useManualSellingRate,
          manualSellingRate: Number.isFinite(manualSellingRate ?? NaN) ? Number(manualSellingRate) : null
        });

    const priceBreakdown = isArtificial
      ? {
          metalPrice: 0,
          makingCharge: 0,
          stoneCost: 0,
          huidCharge: 0,
          subtotalBeforeGst: Number((offerPrice / (1 + ARTIFICIAL_GST_PERCENTAGE / 100)).toFixed(2)),
          gstAmount: Number((offerPrice - offerPrice / (1 + ARTIFICIAL_GST_PERCENTAGE / 100)).toFixed(2)),
          finalPrice: offerPrice
        }
      : calculateJewelryPrice({
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
    const mrpPrice = compareAtPrice;

    if (mrpPrice <= offerPrice) {
      return NextResponse.json({ success: false, message: "MRP should be greater than offer price to show discount." }, { status: 400 });
    }

    const created = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: offerPrice,
        compareAtPrice: mrpPrice,
        sku,
        stock: Math.max(0, Math.floor(stock)),
        metalType: getMetalTypeLabel(baseMetal, purity),
        gemstone,
        weight: isArtificial ? null : `${weightGrams}g`,
        certification,
        categoryId,
        baseMetal,
        metalColor,
        purity,
        purityFactor,
        weightGrams,
        activeGoldRate: normalizedActiveGoldRate,
        activeSilverRate: normalizedActiveSilverRate,
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
