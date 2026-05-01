import { notFound } from "next/navigation";
import { ChevronDown, Heart, ShieldCheck, Star, Truck } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { getProductBySlug } from "@/lib/mock-data";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const compareAtPrice =
    product.compareAtPrice ?? Math.ceil((product.price * 1.2) / 500) * 500;
  const discountPct = Math.max(0, Math.round(((compareAtPrice - product.price) / compareAtPrice) * 100));
  const sizeOptions =
    product.categoryId === "cat-necklace"
      ? ['Standard Chain (16")', 'Medium Chain (18")', 'Long Chain (20")']
      : ["US 6 (Standard)", "US 7", "US 8", "US 9"];
  const lengthSpec = product.categoryId === "cat-necklace" ? '16" - 18" Adjustable' : "Customizable Fit";
  const galleryByCategory: Record<string, string[]> = {
    "cat-necklace": [product.image, "/assets/collection-noir.jpg", "/assets/collection-sol.jpg", "/assets/gallery-2.jpg"],
    "cat-ring": [product.image, "/assets/signature-ring.jpg", "/assets/collection-ring-vermilion.jpg", "/assets/gallery-1.jpg"],
    "cat-earrings": [product.image, "/assets/collection-earrings-geo.jpg", "/assets/collection-earrings-sculpt.jpg", "/assets/gallery-3.jpg"],
    "cat-bracelets": [product.image, "/assets/collection-sol.jpg", "/assets/gallery-4.jpg", "/assets/gallery-5.jpg"]
  };
  const galleryImages = galleryByCategory[product.categoryId] ?? [product.image, "/assets/gallery-1.jpg", "/assets/gallery-2.jpg"];

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <ProductImageGallery productName={product.name} images={galleryImages} />

      <div className="space-y-7 lg:pt-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#59606b] sm:text-xs">
          Collections
          <span className="mx-2">/</span>
          Rings
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
          <span className="font-heading text-[32px] leading-none text-[#121212] sm:text-[34px]">{formatCurrency(product.price)}</span>
          <span className="text-[16px] text-[#6e7178] line-through">{formatCurrency(compareAtPrice)}</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#775a19]">{discountPct}% OFF</span>
        </div>

        <p className="max-w-2xl text-[16px] leading-[1.85] tracking-[0.005em] text-[#545b67]">
          The Astra Pendant is a testament to celestial elegance. Handcrafted in 18k yellow gold, this piece features a
          brilliant-cut responsibly sourced diamond at its heart, suspended on a delicate cable chain.
        </p>

        <div className="rounded-2xl border border-stone-300/70 bg-gradient-to-b from-white/90 to-[#f8f7f5] p-3.5 sm:p-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Material", value: product.metalType },
              { label: "Weight", value: product.weight },
              { label: "Gemstone", value: product.gemstone },
              { label: "Length", value: lengthSpec, span: "col-span-2" }
            ].map((item) => (
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

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1c1b1b]">Select Size</p>
          <div className="relative">
            <select
              defaultValue={sizeOptions[0]}
              className="h-[46px] w-full appearance-none border border-stone-300/90 bg-white px-4 pr-11 text-[15px] text-[#1d2026] focus:outline-none focus:ring-1 focus:ring-[#775a19]"
            >
              {sizeOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c818a]" />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-stretch gap-3">
            <button className="h-[44px] flex-1 bg-black px-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-white">
              Add to Bag
            </button>
            <button className="flex h-[44px] w-[44px] items-center justify-center border border-stone-300/90 bg-white text-[#171a20]">
              <Heart className="h-4.5 w-4.5" />
            </button>
          </div>

          <button className="h-[44px] w-full bg-[#d8bb79] px-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#261900]">
            Buy Now
          </button>
        </div>

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
