import { notFound } from "next/navigation";
import { Crown, ShieldCheck, Sparkles, Star, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { buildProductPricing } from "@/lib/product-pricing";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { ProductPurchaseActions } from "@/components/product/ProductPurchaseActions";
import { PincodeAvailabilityChecker } from "@/components/shipping/PincodeAvailabilityChecker";
import { isSignatureProductSlug } from "@/lib/signature-piece";
import { ARTIFICIAL_GST_PERCENTAGE, getStorefrontGemstone, getStorefrontWeight, isArtificialBaseMetal } from "@/lib/product-materials";
import { isRingCategory } from "@/lib/product-category";

export default async function SignatureProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isSignatureProductSlug(slug)) {
    notFound();
  }

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
  const sizeOptions = ["US 6 (Signature)", "US 7", "US 8", "US 9"];
  const lengthSpec = product.category?.slug === "necklaces" ? '16" - 20" Adjustable' : "Customizable Signature Fit";
  const galleryImages = product.images.length
    ? product.images.map((image) => image.url)
    : ["/assets/signature-ring.jpg", "/assets/collection-ring-vermilion.jpg", "/assets/collection-aura.jpg"];
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
    <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden bg-[#070f22] text-[#f5efe6]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.02)_0,rgba(255,255,255,0.02)_24%,transparent_24%,transparent_50%,rgba(255,255,255,0.02)_50%,rgba(255,255,255,0.02)_74%,transparent_74%,transparent_100%),radial-gradient(circle_at_18%_10%,rgba(26,51,120,0.44),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(10,28,78,0.68),transparent_40%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <section className="overflow-hidden rounded-[2rem] border border-[#d4b071]/40 bg-gradient-to-r from-[#081b56] via-[#0d2f84] to-[#091f63] p-5 shadow-[0_28px_58px_rgba(6,15,45,0.45)] sm:p-8">
        <div className="grid gap-7 lg:grid-cols-2">
          <div className="rounded-[1.6rem] border border-[#d8b16b]/50 bg-[#f7f4ef] p-3 shadow-[0_18px_34px_rgba(2,8,28,0.24)]">
            <ProductImageGallery productName={product.name} images={galleryImages} />
          </div>

          <div className="rounded-[1.6rem] border border-[#d7b67e]/45 bg-[#f7f4ef] p-5 sm:p-6">
            <div className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#46517c]">
                Signature Pieces
                <span className="mx-2">/</span>
                {product.category?.name || "Collection"}
              </p>

              <div className="inline-flex items-center gap-2 rounded-full border border-[#d5b171] bg-[#0d266c] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f6d491]">
                <Crown size={12} />
                Signature Piece
              </div>

              <h1 className="font-heading text-4xl leading-[1.04] text-[#13265c] sm:text-5xl">{product.name}</h1>
              <div className="flex items-center gap-1 text-[#9b7738]">
                {[1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
                <Star className="h-4 w-4" />
                <span className="ml-2 text-xs font-semibold tracking-[0.14em] text-[#5b6374]">(124 Reviews)</span>
              </div>

              <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
                <span className="font-heading text-[44px] leading-none text-[#11275d]">{formatCurrency(displayPrice)}</span>
                {compareAtPrice ? <span className="text-lg text-[#6e7380] line-through">{formatCurrency(compareAtPrice)}</span> : null}
                {discountPct > 0 ? <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9c7740]">{discountPct}% OFF</span> : null}
              </div>

              <p className="text-[17px] leading-[1.8] text-[#3f4965]">{product.description}</p>

                <div className="rounded-2xl border border-[#d7c8aa] bg-gradient-to-b from-white to-[#f7f2e8] p-3.5">
                <div className="grid grid-cols-2 gap-3">
                  {materialSummary.map((item) => (
                    <div key={item.label} className={`rounded-xl border border-[#e2d8c5] bg-white px-4 py-3 ${item.span ?? ""}`}>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7b7f89]">{item.label}</p>
                      <p className="mt-1.5 text-[16px] font-semibold text-[#1f2739]">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#d7c8aa] bg-[#fbf8f1] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7b7f89]">
                  {isArtificial ? "Artificial Pricing" : "Signature Pricing Breakdown"}
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
                  <div className="border-t border-[#e4dbc8] pt-2 text-base font-semibold text-[#162241]">
                    <div className="flex items-center justify-between">
                      <span>Final Signature Price</span>
                      <span>{formatCurrency(displayPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <PincodeAvailabilityChecker variant="signature" />

              <ProductPurchaseActions
                productSlug={product.slug}
                productName={product.name}
                sizeOptions={sizeOptions}
                showSizeSelector={showSizeSelector}
                theme="signature"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 rounded-2xl border border-[#d5b172]/30 bg-[#f7f3ea]/95 p-4 sm:grid-cols-3">
          <div className="flex items-center gap-2 text-sm text-[#253157]">
            <Truck size={15} className="text-[#b88d4f]" />
            <span>Insured Signature Shipping</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#253157]">
            <ShieldCheck size={15} className="text-[#b88d4f]" />
            <span>Premium Authenticity Certificate</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#253157]">
            <Sparkles size={15} className="text-[#b88d4f]" />
            <span>Ceremonial Packaging Experience</span>
          </div>
        </div>
        </section>
      </div>
    </div>
  );
}
