"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ProductGrid } from "@/components/ProductGrid";
import { CustomSelect } from "@/components/ui/CustomSelect";
import type { Category, Product } from "@/lib/types";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" }
] as const;

type Props = {
  categories: Category[];
  products: Product[];
  initialCategoryId?: string;
};

export function CollectionsPageClient({ categories, products, initialCategoryId }: Props) {
  const desktopRailRef = useRef<HTMLDivElement>(null);
  const mobileRailRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  const [activeCategory, setActiveCategory] = useState<string>(initialCategoryId || "all");
  const [selectedMetals, setSelectedMetals] = useState<string[]>([]);
  const [selectedGemstone, setSelectedGemstone] = useState<string>("All");
  const [selectedCertification, setSelectedCertification] = useState<string>("All");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  const maxCatalogPrice = useMemo(
    () => Math.max(1, ...products.map((product) => product.price)),
    [products]
  );
  const certifications = useMemo(
    () => ["All", ...Array.from(new Set(products.map((product) => product.certification).filter(Boolean)))],
    [products]
  );
  const gemstones = useMemo(
    () => ["All", ...Array.from(new Set(products.map((product) => product.gemstone).filter(Boolean)))],
    [products]
  );
  const metals = useMemo(() => Array.from(new Set(products.map((product) => product.metalType).filter(Boolean))), [products]);

  const [maxPrice, setMaxPrice] = useState<number>(maxCatalogPrice);
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]["value"]>("featured");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  useEffect(() => {
    setMaxPrice(maxCatalogPrice);
  }, [maxCatalogPrice]);

  useEffect(() => {
    setActiveCategory(initialCategoryId || "all");
  }, [initialCategoryId]);

  useEffect(() => {
    document.body.style.overflow = isMobileFiltersOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileFiltersOpen]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!sortMenuRef.current) {
        return;
      }

      if (!sortMenuRef.current.contains(event.target as Node)) {
        setIsSortMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, []);

  const scrollCategories = (direction: "left" | "right", target: "desktop" | "mobile" = "desktop") => {
    const rail = target === "desktop" ? desktopRailRef.current : mobileRailRef.current;
    if (!rail) {
      return;
    }

    rail.scrollBy({
      left: direction === "left" ? -220 : 220,
      behavior: "smooth"
    });
  };

  const filteredProducts = useMemo(() => {
    const scoped = products.filter((product) => {
      const categoryMatch = activeCategory === "all" || product.categoryId === activeCategory;
      const metalMatch = selectedMetals.length === 0 || selectedMetals.includes(product.metalType);
      const gemstoneMatch = selectedGemstone === "All" || product.gemstone === selectedGemstone;
      const certificationMatch = selectedCertification === "All" || product.certification === selectedCertification;
      const priceMatch = product.price <= maxPrice;
      const stockMatch = !inStockOnly || product.stock > 0;

      return (
        product.isActive &&
        categoryMatch &&
        metalMatch &&
        gemstoneMatch &&
        certificationMatch &&
        priceMatch &&
        stockMatch
      );
    });

    if (sortBy === "price-low") {
      return [...scoped].sort((a, b) => a.price - b.price);
    }

    if (sortBy === "price-high") {
      return [...scoped].sort((a, b) => b.price - a.price);
    }

    if (sortBy === "name-asc") {
      return [...scoped].sort((a, b) => a.name.localeCompare(b.name));
    }

    return [...scoped].sort((a, b) => b.stock - a.stock);
  }, [activeCategory, inStockOnly, maxPrice, selectedCertification, selectedGemstone, selectedMetals, sortBy, products]);

  const activeFilterCount =
    (activeCategory !== "all" ? 1 : 0) +
    (selectedMetals.length > 0 ? 1 : 0) +
    (selectedGemstone !== "All" ? 1 : 0) +
    (selectedCertification !== "All" ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (maxPrice !== maxCatalogPrice ? 1 : 0);

  const activeSortLabel = sortOptions.find((option) => option.value === sortBy)?.label ?? "Featured";

  const clearFilters = () => {
    setActiveCategory("all");
    setSelectedMetals([]);
    setSelectedGemstone("All");
    setSelectedCertification("All");
    setInStockOnly(false);
    setMaxPrice(maxCatalogPrice);
    setSortBy("featured");
  };

  const toggleMetal = (metal: string) => {
    setSelectedMetals((prev) =>
      prev.includes(metal) ? prev.filter((item) => item !== metal) : [...prev, metal]
    );
  };

  const categoryChipButtons = (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setActiveCategory("all")}
        className={`rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] transition ${
          activeCategory === "all"
            ? "border-royal-800 bg-royal-800 text-white"
            : "border-black/12 bg-white text-royal-700/80"
        }`}
      >
        All
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => setActiveCategory(category.id)}
          className={`rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] transition ${
            activeCategory === category.id
              ? "border-royal-800 bg-royal-800 text-white"
              : "border-black/12 bg-white text-royal-700/80"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );

  const filterControls = (
    <>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-royal-700/65">Price Range</p>
        <input
          type="range"
          min={0}
          max={maxCatalogPrice}
          value={maxPrice}
          onChange={(event) => setMaxPrice(Number(event.target.value))}
          className="w-full accent-[#9c7346]"
        />
        <div className="rounded-xl border border-black/10 bg-[#f8f4ee] px-3 py-2 text-sm text-royal-800">
          Up to ₹{maxPrice.toLocaleString("en-IN")}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-royal-700/65">Material Type</p>
        <div className="grid grid-cols-1 gap-2">
          {metals.map((metal) => {
            const checked = selectedMetals.includes(metal);
            return (
              <label
                key={metal}
                className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${
                  checked
                    ? "border-[#9c7346]/60 bg-[#f6ede1] text-royal-800"
                    : "border-black/10 bg-white text-royal-700/80 hover:border-black/20"
                }`}
              >
                <span>{metal}</span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleMetal(metal)}
                  className="h-4 w-4 accent-[#9c7346]"
                />
              </label>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-royal-700/65">Gemstone</p>
        <CustomSelect
          value={selectedGemstone}
          onValueChange={setSelectedGemstone}
          options={gemstones.map((gemstone) => ({ value: gemstone, label: gemstone }))}
          buttonClassName="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-royal-800"
          menuClassName="w-full"
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-royal-700/65">Certification</p>
        <CustomSelect
          value={selectedCertification}
          onValueChange={setSelectedCertification}
          options={certifications.map((certification) => ({ value: certification, label: certification }))}
          buttonClassName="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-royal-800"
          menuClassName="w-full"
        />
      </div>

      <label className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-royal-700/80">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={(event) => setInStockOnly(event.target.checked)}
          className="h-4 w-4 accent-[#9c7346]"
        />
        In Stock Only
      </label>
    </>
  );

  return (
    <div className="space-y-8 sm:space-y-10">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.24em] text-royal-700/60">Curated Collections</p>
        <h1 className="font-heading text-3xl text-royal-800 sm:text-5xl">Explore By Category</h1>
        <p className="max-w-2xl text-sm text-royal-700/70 sm:text-base">
          Discover sculpted signatures across categories. Use detailed filters to refine by material, gemstone,
          certification, and price.
        </p>
      </header>

      <section className="hidden rounded-[1.8rem] border border-black/10 bg-white/65 p-4 shadow-soft backdrop-blur-sm sm:block sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-royal-700/65">Shop Categories</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Scroll categories left"
              onClick={() => scrollCategories("left", "desktop")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/15 bg-white/85 text-royal-800 transition hover:bg-white"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              type="button"
              aria-label="Scroll categories right"
              onClick={() => scrollCategories("right", "desktop")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/15 bg-white/85 text-royal-800 transition hover:bg-white"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div
          ref={desktopRailRef}
          className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className="group shrink-0"
            aria-pressed={activeCategory === "all"}
          >
            <div
              className={`h-20 w-20 overflow-hidden rounded-full border-2 transition sm:h-24 sm:w-24 ${
                activeCategory === "all"
                  ? "border-[#9c7346] ring-4 ring-[#9c7346]/20"
                  : "border-black/10 group-hover:border-[#9c7346]/55"
              }`}
            >
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#f3ece3] to-[#e8dfd3] text-xs uppercase tracking-[0.16em] text-royal-700/70">
                All
              </div>
            </div>
            <p className="mt-2 text-center text-xs uppercase tracking-[0.16em] text-royal-700/75">All</p>
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              className="group shrink-0"
              aria-pressed={activeCategory === category.id}
            >
              <div
                className={`h-20 w-20 overflow-hidden rounded-full border-2 transition sm:h-24 sm:w-24 ${
                  activeCategory === category.id
                    ? "border-[#9c7346] ring-4 ring-[#9c7346]/20"
                    : "border-black/10 group-hover:border-[#9c7346]/55"
                }`}
              >
                <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
              </div>
              <p className="mt-2 text-center text-xs uppercase tracking-[0.16em] text-royal-700/75">{category.name}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <aside className="hidden card h-fit space-y-5 p-5 sm:p-6 lg:block">
          <div className="flex items-center justify-between">
            <h2 className="inline-flex items-center gap-2 font-heading text-xl text-royal-800">
              <SlidersHorizontal size={18} />
              Filters
            </h2>
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs uppercase tracking-[0.14em] text-royal-700/70 underline-offset-4 hover:underline"
            >
              Clear
            </button>
          </div>

          {filterControls}
        </aside>

        <div className="space-y-4">
          <section className="rounded-2xl border border-black/10 bg-white/65 p-4 shadow-soft backdrop-blur-sm sm:hidden">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-royal-700/65">Shop Categories</h2>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Scroll mobile categories left"
                  onClick={() => scrollCategories("left", "mobile")}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/15 bg-white/90 text-royal-800 transition active:scale-95"
                >
                  <ArrowLeft size={14} />
                </button>
                <button
                  type="button"
                  aria-label="Scroll mobile categories right"
                  onClick={() => scrollCategories("right", "mobile")}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/15 bg-white/90 text-royal-800 transition active:scale-95"
                >
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div
              ref={mobileRailRef}
              className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className="group shrink-0"
                aria-pressed={activeCategory === "all"}
              >
                <div
                  className={`h-16 w-16 overflow-hidden rounded-full border-2 transition ${
                    activeCategory === "all"
                      ? "border-[#9c7346] ring-4 ring-[#9c7346]/20"
                      : "border-black/10 group-hover:border-[#9c7346]/55"
                  }`}
                >
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#f3ece3] to-[#e8dfd3] text-[10px] uppercase tracking-[0.16em] text-royal-700/70">
                    All
                  </div>
                </div>
                <p className="mt-1.5 text-center text-[10px] uppercase tracking-[0.16em] text-royal-700/75">All</p>
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className="group shrink-0"
                  aria-pressed={activeCategory === category.id}
                >
                  <div
                    className={`h-16 w-16 overflow-hidden rounded-full border-2 transition ${
                      activeCategory === category.id
                        ? "border-[#9c7346] ring-4 ring-[#9c7346]/20"
                        : "border-black/10 group-hover:border-[#9c7346]/55"
                    }`}
                  >
                    <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
                  </div>
                  <p className="mt-1.5 text-center text-[10px] uppercase tracking-[0.16em] text-royal-700/75">
                    {category.name}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-black/10 bg-white/65 px-4 py-3">
            <p className="text-sm text-royal-700/80">
              <span className="font-semibold text-royal-800">{filteredProducts.length}</span> products found
            </p>
            <div ref={sortMenuRef} className="relative flex items-center gap-2">
              <label className="text-xs uppercase tracking-[0.16em] text-royal-700/60">Sort by</label>
              <button
                type="button"
                onClick={() => setIsSortMenuOpen((prev) => !prev)}
                className="inline-flex min-w-[170px] items-center justify-between rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-royal-800"
                aria-haspopup="listbox"
                aria-expanded={isSortMenuOpen}
                aria-label="Sort products"
              >
                <span>{activeSortLabel}</span>
                <ChevronDown size={16} className={`transition ${isSortMenuOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isSortMenuOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute right-0 top-[calc(100%+0.4rem)] z-30 w-[220px] origin-top-right overflow-hidden rounded-2xl border border-black/10 bg-[#f9f5ee] p-1.5 shadow-[0_18px_34px_rgba(36,34,31,0.18)]"
                    role="listbox"
                    aria-label="Sort options"
                  >
                    {sortOptions.map((option) => {
                      const active = sortBy === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setSortBy(option.value);
                            setIsSortMenuOpen(false);
                          }}
                          className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                            active ? "bg-royal-800 text-white" : "text-royal-700/85 hover:bg-white"
                          }`}
                          role="option"
                          aria-selected={active}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          <ProductGrid products={filteredProducts} fullCardClickable hideViewButton />
        </div>
      </section>

      <div className={`fixed inset-0 z-[80] sm:hidden ${isMobileFiltersOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        <button
          type="button"
          aria-label="Close filters"
          onClick={() => setIsMobileFiltersOpen(false)}
          className={`absolute inset-0 bg-black/35 transition-opacity duration-300 ${isMobileFiltersOpen ? "opacity-100" : "opacity-0"}`}
        />

        <aside
          className={`absolute left-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto border-r border-black/10 bg-[#f7f3ee] p-4 shadow-2xl transition-transform duration-300 ${
            isMobileFiltersOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/15 bg-white text-royal-800"
              aria-label="Toggle filters"
            >
              {isMobileFiltersOpen ? <X size={17} /> : <SlidersHorizontal size={17} />}
            </button>

            <button
              type="button"
              onClick={clearFilters}
              className="text-xs uppercase tracking-[0.16em] text-royal-700/70 underline-offset-4 hover:underline"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-5">
            <section className="space-y-2 rounded-2xl border border-black/10 bg-white/70 p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-royal-700/65">Categories</p>
              {categoryChipButtons}
            </section>

            <section className="space-y-4 rounded-2xl border border-black/10 bg-white/70 p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-royal-700/65">Filters</p>
              {filterControls}
            </section>

            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(false)}
              className="w-full rounded-full bg-royal-800 px-4 py-3 text-xs uppercase tracking-[0.16em] text-white"
            >
              View {filteredProducts.length} Products
            </button>
          </div>
        </aside>
      </div>

      {activeFilterCount > 0 ? (
        <div className="fixed bottom-[6.4rem] left-4 z-[70] rounded-full border border-[#9c7346]/35 bg-[#f6ebdf] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-[#7f6039] sm:hidden">
          {activeFilterCount} filters applied
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
        className="fixed bottom-[7.2rem] right-4 z-[75] inline-flex h-12 w-12 items-center justify-center rounded-full border border-royal-800 bg-royal-800 text-[#f6ece0] shadow-[0_12px_28px_rgba(36,34,31,0.28)] transition hover:bg-royal-700 sm:hidden"
        aria-label="Toggle filters"
        aria-expanded={isMobileFiltersOpen}
      >
        {isMobileFiltersOpen ? <X size={18} /> : <SlidersHorizontal size={18} />}
      </button>
    </div>
  );
}
