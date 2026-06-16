import { notFound } from "next/navigation";
import { ShieldCheck, Star, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { buildProductPricing } from "@/lib/product-pricing";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { ProductPurchaseActions } from "@/components/product/ProductPurchaseActions";
import { PincodeAvailabilityChecker } from "@/components/shipping/PincodeAvailabilityChecker";
import { ARTIFICIAL_GST_PERCENTAGE, getStorefrontGemstone, getStorefrontWeight, isArtificialBaseMetal } from "@/lib/product-materials";
import { isRingCategory } from "@/lib/product-category";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      compareAtPrice: true,
      sku: true,
      stock: true,
      metalType: true,
      gemstone: true,
      weight: true,
      certification: true,
      categoryId: true,
      baseMetal: true,
      metalColor: true,
      purity: true,
      purityFactor: true,
      weightGrams: true,
      activeGoldRate: true,
      activeSilverRate: true,
      useManualSellingRate: true,
      manualSellingRate: true,
      makingChargeType: true,
      makingChargeValue: true,
      stoneCostType: true,
      stoneCostValue: true,
      stoneCarat: true,
      huidCharge: true,
      gstPercentage: true,
      category: {
        select: { name: true, slug: true }
      },
      images: {
        orderBy: { sortOrder: "asc" }
      }
    }
  });

  if (!product) {
    notFound();
  }

  const isArtificial = isArtificialBaseMetal(product.baseMetal);
  const breakdown = buildProductPricing({ ...product, images: [] } as never);
  const displayPrice = breakdown.finalPrice;
  const compareAtPrice = breakdown.compareAtPrice;
  const discountPct =
    compareAtPrice && compareAtPrice > displayPrice
      ? Math.max(0, Math.round(((compareAtPrice - displayPrice) / compareAtPrice) * 100))
      : 0;
  const showSizeSelector = isRingCategory(product.category?.slug, product.category?.name);
  const sizeOptions = ["US 6 (Standard)", "US 7", "US 8", "US 9"];
  const lengthSpec = product.category?.slug === "necklaces" ? '16" - 18" Adjustable' : "Customizable Fit";
  const galleryImages = product.images.length
    ? product.images.map((image) => image.url)
    : ["/assets/collection-aura.jpg", "/assets/gallery-1.jpg", "/assets/gallery-2.jpg"];
  const materialSummary = isArtificial
    ? [
        { label: "Material", value: "Artificial" },
        { label: "Certification", value: product.certification || "In-house Certified" },
        { label: "Collection", value: product.category?.name || "Collection", span: "col-span-2" }
      ]
    : [
        { label: "Material", value: product.metalType },
        { label: "Weight", value: getStorefrontWeight(product) },
        { label: "Gemstone", value: getStorefrontGemstone(product) },
        { label: "Length", value: lengthSpec, span: "col-span-2" }
      ].filter((item) => Boolean(item.value));

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <ProductImageGallery productName={product.name} images={galleryImages} />

      <div className="space-y-7 lg:pt-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#59606b] sm:text-xs">
          Collections
          <span className="mx-2">/</span>
          {product.category?.name || "Collection"}
          <span className="mx-2">/</span>
          <span className="text-[#23272f]">{product.name}</span>
        </p>

        <div className="space-y-3">
          <h1 className="font-heading text-[34px] leading-[1.08] text-[#121212] sm:text-[38px]">{product.name}</h1>
          <div className="flex items-center gap-1 text-[#775a19]">
            {[1, 2, 3, 4].map((i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-current" />
            ))}
            <Star className="h-3.5 w-3.5" />
            <span className="ml-1 text-[11px] font-semibold tracking-[0.12em] text-[#44474d]">(124 Reviews)</span>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
          <span className="font-heading text-[32px] leading-none text-[#121212] sm:text-[34px]">{formatCurrency(displayPrice)}</span>
          {compareAtPrice ? <span className="text-[16px] text-[#6e7178] line-through">{formatCurrency(compareAtPrice)}</span> : null}
          {discountPct > 0 ? <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#775a19]">{discountPct}% OFF</span> : null}
        </div>

        <p className="max-w-2xl text-[16px] leading-[1.85] tracking-[0.005em] text-[#545b67]">
          {product.description}
        </p>

        <div className="rounded-2xl border border-stone-300/70 bg-gradient-to-b from-white/90 to-[#f8f7f5] p-3.5 sm:p-4">
          <div className="grid grid-cols-2 gap-3">
            {materialSummary.map((item) => (
              <div
                key={item.label}
                className={`rounded-xl border border-stone-200 bg-white/80 px-4 py-3 ${item.span ?? ""}`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7b8089]">{item.label}</p>
                <p className="mt-1.5 text-[16px] font-semibold tracking-[0.01em] text-[#1b1d21]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-stone-300/70 bg-white/85 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7b8089]">
            {isArtificial ? "Artificial Pricing" : "Pricing Breakdown"}
          </p>
          <div className="mt-3 space-y-2 text-sm text-[#4e5561]">
            {isArtificial ? (
              <>
                <div className="flex items-center justify-between">
                  <span>MRP</span>
                  <span>{compareAtPrice ? formatCurrency(compareAtPrice) : "--"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Offer Price</span>
                  <span>{formatCurrency(displayPrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>GST ({ARTIFICIAL_GST_PERCENTAGE}%)</span>
                  <span>{formatCurrency(breakdown.gstAmount)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span>Metal Value</span>
                  <span>{formatCurrency(breakdown.metalPrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Making Charges</span>
                  <span>{formatCurrency(breakdown.makingCharge)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Stone Cost</span>
                  <span>{formatCurrency(breakdown.stoneCost)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>HUID Charges</span>
                  <span>{formatCurrency(breakdown.huidCharge)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>GST ({Number(product.gstPercentage)}%)</span>
                  <span>{formatCurrency(breakdown.gstAmount)}</span>
                </div>
              </>
            )}
            <div className="border-t border-stone-200 pt-2 text-base font-semibold text-[#16181c]">
              <div className="flex items-center justify-between">
                <span>Final Price</span>
                <span>{formatCurrency(displayPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        <PincodeAvailabilityChecker />

        <ProductPurchaseActions
          productSlug={product.slug}
          productName={product.name}
          sizeOptions={sizeOptions}
          showSizeSelector={showSizeSelector}
        />

        <div className="grid grid-cols-2 gap-4 pt-4 text-[11px] font-medium text-[#666d78]">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 shrink-0" />
            <span>Complimentary Shipping</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>Certificate of Authenticity</span>
          </div>
        </div>
      </div>
    </div>
  );
}
