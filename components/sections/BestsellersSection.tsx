"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Product } from "@/lib/types";

type BestsellerTab = {
  key: "rings" | "necklaces" | "earrings" | "bracelets";
  label: string;
  categorySlug: string | null;
  products: Product[];
};

type BestsellersSectionProps = {
  heading?: string;
  description?: string;
  tabs?: BestsellerTab[];
};

export function BestsellersSection({
  heading = "Bestsellers",
  description = "Most-loved signature pieces chosen for daily impact and lasting versatility.",
  tabs
}: BestsellersSectionProps) {
  const displayTabs = tabs?.filter((tab) => tab.products.length > 0) ?? [];
  const [activeCategory, setActiveCategory] = useState<string>(displayTabs[0]?.key || "rings");

  useEffect(() => {
    if (!displayTabs.length) return;
    if (!displayTabs.find((tab) => tab.key === activeCategory)) {
      setActiveCategory(displayTabs[0].key);
    }
  }, [activeCategory, displayTabs]);

  if (!displayTabs.length) {
    return null;
  }

  const filteredProducts = useMemo(() => {
    return displayTabs.find((tab) => tab.key === activeCategory)?.products.slice(0, 4) || [];
  }, [activeCategory, displayTabs]);

  const activeTab = displayTabs.find((tab) => tab.key === activeCategory) || displayTabs[0] || null;

  return (
    <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 md:py-24">
      <div className="mx-auto w-full max-w-7xl">
        <SectionHeading
          eyebrow="Editor Picks"
          title={heading}
          description={description}
        />

        <div className="mt-8 flex flex-wrap justify-center gap-2 sm:mt-10 sm:gap-3">
          {displayTabs.map((category) => (
            <button
              key={category.key}
              type="button"
              onClick={() => setActiveCategory(category.key)}
              className={`rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] transition sm:px-5 ${
                activeCategory === category.key
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-300 bg-white text-stone-700 hover:border-stone-900 hover:text-stone-900"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} fullCardClickable hideViewButton />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href={activeTab?.categorySlug ? `/collections/${activeTab.categorySlug}` : "/collections"}
            className="inline-flex items-center rounded-full border border-stone-900 px-8 py-3 text-xs font-medium uppercase tracking-[0.2em] text-stone-900 transition hover:bg-stone-900 hover:text-white"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
}
