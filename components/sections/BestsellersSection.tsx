"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { categories, products } from "@/lib/mock-data";
import { SectionHeading } from "@/components/ui/SectionHeading";

const allActiveProducts = products.filter((product) => product.isActive);
const sortedBestsellers = [...allActiveProducts].sort((a, b) => b.stock - a.stock);
const defaultVisibleCount = 4;

export function BestsellersSection() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") {
      return sortedBestsellers.slice(0, defaultVisibleCount);
    }

    return sortedBestsellers.filter((product) => product.categoryId === activeCategory).slice(0, defaultVisibleCount);
  }, [activeCategory]);

  return (
    <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 md:py-24">
      <div className="mx-auto w-full max-w-7xl">
        <SectionHeading
          eyebrow="Editor Picks"
          title="Bestsellers"
          description="Most-loved signature pieces chosen for daily impact and lasting versatility."
        />

        <div className="mt-8 flex flex-wrap justify-center gap-2 sm:mt-10 sm:gap-3">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] transition sm:px-5 ${
              activeCategory === "all"
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-stone-300 bg-white text-stone-700 hover:border-stone-900 hover:text-stone-900"
            }`}
          >
            All
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className={`rounded-full border px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] transition sm:px-5 ${
                activeCategory === category.id
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-stone-300 bg-white text-stone-700 hover:border-stone-900 hover:text-stone-900"
              }`}
            >
              {category.name}
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
            href="/collections"
            className="inline-flex items-center rounded-full border border-stone-900 px-8 py-3 text-xs font-medium uppercase tracking-[0.2em] text-stone-900 transition hover:bg-stone-900 hover:text-white"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
}
