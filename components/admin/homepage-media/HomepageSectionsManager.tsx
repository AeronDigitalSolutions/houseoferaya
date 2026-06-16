"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  Crown,
  Grid2X2,
  Image as ImageIcon,
  Layers3,
  MessageSquareQuote,
  Plus,
  Save,
  Sparkles,
  Trash2,
  X
} from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { useBrandDialog } from "@/components/providers/BrandDialogProvider";
import type {
  HomepageCatalogCategoryOption,
  HomepageCatalogProductOption,
  HomepageContentConfig,
  HomepageTestimonialItem
} from "@/lib/homepage-content";

type Message = { type: "success" | "error"; text: string } | null;
type SectionKey = "hero" | "new-arrivals" | "featured-collections" | "bestseller" | "signature" | "testimonials";

type ContentPayload = {
  success: boolean;
  message?: string;
  config: HomepageContentConfig;
  products: HomepageCatalogProductOption[];
  categories: HomepageCatalogCategoryOption[];
  testimonials: HomepageTestimonialItem[];
};

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  maxWidth = "max-w-5xl"
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-end bg-black/45 p-0 backdrop-blur-[2px] sm:items-center sm:justify-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full ${maxWidth} rounded-t-3xl border border-stone-200 bg-[#f8f5f0] p-5 shadow-2xl sm:rounded-3xl sm:p-6`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-heading text-2xl text-stone-900">{title}</h3>
            {subtitle ? <p className="mt-1 text-sm text-stone-600">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function uniqueIds(ids: string[], limit: number) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const id of ids) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    result.push(id);
    if (result.length >= limit) break;
  }
  return result;
}

function moveItem(list: string[], index: number, direction: "up" | "down") {
  const next = [...list];
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= next.length) return next;
  [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  return next;
}

function SectionTile({
  icon,
  title,
  description,
  summary,
  onClick
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  summary: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group card flex h-full flex-col items-start gap-4 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d8c4a1] bg-[#fff8ee] text-[#8b6a3d] transition group-hover:border-[#8b6a3d] group-hover:bg-[#f7eddd]">
        {icon}
      </span>
      <div className="space-y-2">
        <h3 className="font-heading text-2xl text-stone-900">{title}</h3>
        <p className="text-sm leading-relaxed text-stone-600">{description}</p>
      </div>
      <p className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-700">{summary}</p>
    </button>
  );
}

function OrderedItemsEditor({
  title,
  description,
  selectedIds,
  onChange,
  options,
  limit,
  type
}: {
  title: string;
  description: string;
  selectedIds: string[];
  onChange: (next: string[]) => void;
  options: Array<HomepageCatalogProductOption | HomepageCatalogCategoryOption>;
  limit: number;
  type: "product" | "category";
}) {
  const [draftToAdd, setDraftToAdd] = useState("");

  const optionMap = useMemo(() => new Map(options.map((item) => [item.id, item])), [options]);
  const sanitizedSelectedIds = useMemo(
    () => uniqueIds(selectedIds.filter((id) => optionMap.has(id)), limit),
    [selectedIds, optionMap, limit]
  );
  const selectedItems = sanitizedSelectedIds.map((id) => optionMap.get(id)).filter(Boolean) as Array<
    HomepageCatalogProductOption | HomepageCatalogCategoryOption
  >;
  const availableOptions = options.filter((item) => !sanitizedSelectedIds.includes(item.id));

  return (
    <div className="space-y-4 rounded-3xl border border-stone-200 bg-white/70 p-4">
      <div>
        <h4 className="font-medium text-stone-900">{title}</h4>
        <p className="mt-1 text-sm text-stone-600">{description}</p>
      </div>

      <div className="space-y-3">
        {selectedItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 px-4 py-5 text-sm text-stone-500">
            Nothing selected yet.
          </div>
        ) : (
          selectedItems.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-3 py-3">
              {"image" in item ? (
                <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-stone-900">
                  {"name" in item ? item.name : ""}
                </p>
                <p className="truncate text-xs text-stone-500">
                  {type === "product"
                    ? `${(item as HomepageCatalogProductOption).categoryName} • ${(item as HomepageCatalogProductOption).slug}`
                    : (item as HomepageCatalogCategoryOption).slug}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onChange(moveItem(sanitizedSelectedIds, index, "up"))}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(moveItem(sanitizedSelectedIds, index, "down"))}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(sanitizedSelectedIds.filter((id) => id !== item.id))}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="rounded-2xl border border-stone-200 bg-[#fbfaf7] p-3">
        <p className="mb-2 text-xs uppercase tracking-[0.18em] text-stone-500">
          Add {type === "product" ? "Product" : "Category"} ({sanitizedSelectedIds.length}/{limit})
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <CustomSelect
            value={draftToAdd}
            onValueChange={setDraftToAdd}
            options={[
              { value: "", label: `Select ${type}` },
              ...availableOptions.map((item) => ({
                value: item.id,
                label: "name" in item ? item.name : ""
              }))
            ]}
            buttonClassName="h-11 w-full rounded-xl border border-black/15 px-3 text-sm"
            menuClassName="w-full"
          />
          <button
            type="button"
            onClick={() => {
              if (!draftToAdd) return;
              onChange(uniqueIds([...sanitizedSelectedIds, draftToAdd], limit));
              setDraftToAdd("");
            }}
            disabled={!draftToAdd || sanitizedSelectedIds.length >= limit}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-stone-900 bg-stone-900 px-4 text-sm font-medium text-white disabled:opacity-50"
          >
            <Plus size={15} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export function HomepageSectionsManager() {
  const { confirm } = useBrandDialog();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<SectionKey | null>(null);
  const [message, setMessage] = useState<Message>(null);
  const [config, setConfig] = useState<HomepageContentConfig | null>(null);
  const [products, setProducts] = useState<HomepageCatalogProductOption[]>([]);
  const [categories, setCategories] = useState<HomepageCatalogCategoryOption[]>([]);
  const [testimonials, setTestimonials] = useState<HomepageTestimonialItem[]>([]);
  const [openSection, setOpenSection] = useState<SectionKey | null>(null);

  const [heroDraft, setHeroDraft] = useState<HomepageContentConfig["hero"] | null>(null);
  const [newArrivalsDraft, setNewArrivalsDraft] = useState<HomepageContentConfig["newArrivals"] | null>(null);
  const [featuredDraft, setFeaturedDraft] = useState<HomepageContentConfig["featuredCollections"] | null>(null);
  const [bestsellerDraft, setBestsellerDraft] = useState<HomepageContentConfig["bestseller"] | null>(null);
  const [signatureDraft, setSignatureDraft] = useState<HomepageContentConfig["signature"] | null>(null);

  const [newTestimonial, setNewTestimonial] = useState({
    customerName: "",
    quote: "",
    sortOrder: 0,
    isActive: true,
    image: null as File | null
  });
  const [testimonialDrafts, setTestimonialDrafts] = useState<Record<string, HomepageTestimonialItem>>({});
  const [testimonialImages, setTestimonialImages] = useState<Record<string, File | null>>({});

  const categoryMap = useMemo(() => new Map(categories.map((item) => [item.id, item])), [categories]);
  const productMap = useMemo(() => new Map(products.map((item) => [item.id, item])), [products]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/homepage-content", { cache: "no-store" });
      const payload = (await response.json()) as ContentPayload;
      if (!response.ok || !payload.success) {
        setMessage({ type: "error", text: payload.message || "Unable to load homepage sections." });
        return;
      }

      setConfig(payload.config);
      setHeroDraft(payload.config.hero);
      setNewArrivalsDraft(payload.config.newArrivals);
      setFeaturedDraft(payload.config.featuredCollections);
      setBestsellerDraft(payload.config.bestseller);
      setSignatureDraft(payload.config.signature);
      setProducts(payload.products);
      setCategories(payload.categories);
      setTestimonials(payload.testimonials);
      setTestimonialDrafts(
        Object.fromEntries(payload.testimonials.map((item) => [item.id, { ...item }]))
      );
      setMessage(null);
    } catch {
      setMessage({ type: "error", text: "Unable to load homepage sections." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadContent();
  }, []);

  const saveSection = async (section: Exclude<SectionKey, "testimonials">, payload: unknown) => {
    setSaving(section);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/homepage-content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, payload })
      });
      const result = (await response.json()) as { success: boolean; message?: string; config?: HomepageContentConfig };
      if (!response.ok || !result.success || !result.config) {
        setMessage({ type: "error", text: result.message || "Unable to save homepage section." });
        return;
      }

      setConfig(result.config);
      setHeroDraft(result.config.hero);
      setNewArrivalsDraft(result.config.newArrivals);
      setFeaturedDraft(result.config.featuredCollections);
      setBestsellerDraft(result.config.bestseller);
      setSignatureDraft(result.config.signature);
      setMessage({ type: "success", text: result.message || "Homepage section updated." });
      setOpenSection(null);
    } catch {
      setMessage({ type: "error", text: "Unable to save homepage section." });
    } finally {
      setSaving(null);
    }
  };

  const saveNewTestimonial = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving("testimonials");
    setMessage(null);
    try {
      const formData = new FormData();
      formData.set("customerName", newTestimonial.customerName);
      formData.set("quote", newTestimonial.quote);
      formData.set("sortOrder", String(newTestimonial.sortOrder));
      formData.set("isActive", String(newTestimonial.isActive));
      if (newTestimonial.image) {
        formData.set("image", newTestimonial.image);
      }

      const response = await fetch("/api/admin/homepage-content/testimonials", {
        method: "POST",
        body: formData
      });
      const result = (await response.json()) as { success: boolean; message?: string };
      if (!response.ok || !result.success) {
        setMessage({ type: "error", text: result.message || "Unable to add testimonial." });
        return;
      }

      setNewTestimonial({ customerName: "", quote: "", sortOrder: testimonials.length + 1, isActive: true, image: null });
      await loadContent();
      setMessage({ type: "success", text: result.message || "Testimonial added." });
    } catch {
      setMessage({ type: "error", text: "Unable to add testimonial." });
    } finally {
      setSaving(null);
    }
  };

  const updateTestimonial = async (testimonialId: string) => {
    const draft = testimonialDrafts[testimonialId];
    if (!draft) return;

    setSaving("testimonials");
    setMessage(null);
    try {
      const formData = new FormData();
      formData.set("customerName", draft.customerName);
      formData.set("quote", draft.quote);
      formData.set("sortOrder", String(draft.sortOrder));
      formData.set("isActive", String(draft.isActive));
      const image = testimonialImages[testimonialId];
      if (image) {
        formData.set("image", image);
      }

      const response = await fetch(`/api/admin/homepage-content/testimonials/${testimonialId}`, {
        method: "PATCH",
        body: formData
      });
      const result = (await response.json()) as { success: boolean; message?: string };
      if (!response.ok || !result.success) {
        setMessage({ type: "error", text: result.message || "Unable to update testimonial." });
        return;
      }

      await loadContent();
      setMessage({ type: "success", text: result.message || "Testimonial updated." });
    } catch {
      setMessage({ type: "error", text: "Unable to update testimonial." });
    } finally {
      setSaving(null);
    }
  };

  const deleteTestimonial = async (testimonialId: string) => {
    const approved = await confirm({
      title: "Delete testimonial?",
      message: "This will permanently remove the testimonial from the homepage controls.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      tone: "danger"
    });
    if (!approved) return;

    setSaving("testimonials");
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/homepage-content/testimonials/${testimonialId}`, {
        method: "DELETE"
      });
      const result = (await response.json()) as { success: boolean; message?: string };
      if (!response.ok || !result.success) {
        setMessage({ type: "error", text: result.message || "Unable to delete testimonial." });
        return;
      }
      await loadContent();
      setMessage({ type: "success", text: result.message || "Testimonial deleted." });
    } catch {
      setMessage({ type: "error", text: "Unable to delete testimonial." });
    } finally {
      setSaving(null);
    }
  };

  if (loading && !config) {
    return (
      <section className="card p-5 sm:p-6">
        <p className="text-sm text-stone-600">Loading homepage sections...</p>
      </section>
    );
  }

  const selectedHeroProduct = heroDraft?.productId ? productMap.get(heroDraft.productId) || null : null;
  const featuredCategoriesCount = featuredDraft?.categoryIds.length || 0;
  const newArrivalCount = newArrivalsDraft?.productIds.length || 0;
  const signatureCount = signatureDraft?.productIds.length || 0;
  const bestsellerCount =
    (bestsellerDraft?.ringsProductIds.length || 0) +
    (bestsellerDraft?.necklacesProductIds.length || 0) +
    (bestsellerDraft?.earringsProductIds.length || 0) +
    (bestsellerDraft?.braceletsProductIds.length || 0);

  return (
    <section className="card space-y-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl text-stone-900 sm:text-4xl">Homepage Dynamic Sections</h2>
          <p className="mt-2 max-w-3xl text-sm text-stone-600">
            Control homepage merchandising section by section from one premium editing surface. Click a tile to open its editor modal.
          </p>
        </div>
      </div>

      {message ? (
        <p className={`text-sm ${message.type === "success" ? "text-emerald-700" : "text-rose-700"}`}>{message.text}</p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <SectionTile
          icon={<Sparkles size={19} />}
          title="Hero Capsule"
          description="Choose the lead product image, capsule label, and short line that sits over the hero."
          summary={selectedHeroProduct ? selectedHeroProduct.name : "No hero product selected yet"}
          onClick={() => setOpenSection("hero")}
        />
        <SectionTile
          icon={<ImageIcon size={19} />}
          title="New Arrivals"
          description="Pick the exact products that should run inside the continuous homepage arrival marquee."
          summary={`${newArrivalCount} product${newArrivalCount === 1 ? "" : "s"} selected`}
          onClick={() => setOpenSection("new-arrivals")}
        />
        <SectionTile
          icon={<Grid2X2 size={19} />}
          title="Featured Collections"
          description="Curate any three categories and edit the section heading plus one-line supporting description."
          summary={`${featuredCategoriesCount} of 3 categories selected`}
          onClick={() => setOpenSection("featured-collections")}
        />
        <SectionTile
          icon={<Layers3 size={19} />}
          title="Bestseller Tabs"
          description="Assign specific products to rings, necklaces, earrings, and bracelets inside the bestseller tabs."
          summary={`${bestsellerCount} product${bestsellerCount === 1 ? "" : "s"} selected across 4 tabs`}
          onClick={() => setOpenSection("bestseller")}
        />
        <SectionTile
          icon={<Crown size={19} />}
          title="Signature Pieces"
          description="Control exactly which four signature products get highlighted on the homepage signature section."
          summary={`${signatureCount} of 4 signature products selected`}
          onClick={() => setOpenSection("signature")}
        />
        <SectionTile
          icon={<MessageSquareQuote size={19} />}
          title="Testimonials"
          description="Create, edit, and remove customer testimonials with image, customer name, and one-line quote."
          summary={`${testimonials.length} testimonial${testimonials.length === 1 ? "" : "s"} in rotation`}
          onClick={() => setOpenSection("testimonials")}
        />
      </div>

      {openSection === "hero" && heroDraft ? (
        <ModalShell
          title="Hero Capsule"
          subtitle="Choose the product shown in the hero card and control the supporting copy."
          onClose={() => saving ? null : setOpenSection(null)}
        >
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.16em] text-stone-500">Hero Product</p>
                  <CustomSelect
                    value={heroDraft.productId || ""}
                    onValueChange={(value) => setHeroDraft({ ...heroDraft, productId: value || null })}
                    options={[
                      { value: "", label: "Select product" },
                      ...products.map((product) => ({ value: product.id, label: product.name }))
                    ]}
                    buttonClassName="h-11 w-full rounded-xl border border-black/15 px-3 text-sm"
                    menuClassName="w-full"
                  />
                </div>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.16em] text-stone-500">Capsule Label</p>
                  <input
                    value={heroDraft.badgeLabel}
                    onChange={(event) => setHeroDraft({ ...heroDraft, badgeLabel: event.target.value })}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 outline-none transition focus:border-stone-500"
                    placeholder="New Capsule"
                  />
                </div>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-[0.16em] text-stone-500">Short Description</p>
                  <textarea
                    value={heroDraft.description}
                    onChange={(event) => setHeroDraft({ ...heroDraft, description: event.target.value })}
                    rows={3}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 outline-none transition focus:border-stone-500"
                    placeholder="Engineered curves with warm golden tonality."
                  />
                </div>
              </div>
              <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white">
                {selectedHeroProduct ? (
                  <>
                    <div className="relative aspect-[0.9] w-full overflow-hidden bg-stone-100">
                      <Image src={selectedHeroProduct.image} alt={selectedHeroProduct.name} fill className="object-cover" />
                    </div>
                    <div className="space-y-2 p-4">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-[#685744]">{heroDraft.badgeLabel}</p>
                      <p className="font-heading text-2xl leading-none text-[#1e1c19]">{selectedHeroProduct.name}</p>
                      <p className="text-sm text-[#3d3832]">{heroDraft.description}</p>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full min-h-[16rem] items-center justify-center px-6 text-center text-sm text-stone-500">
                    Select a product to preview the hero capsule.
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void saveSection("hero", heroDraft)}
                disabled={saving === "hero"}
                className="inline-flex items-center gap-2 rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
              >
                <Save size={15} />
                {saving === "hero" ? "Saving..." : "Save Hero"}
              </button>
            </div>
          </div>
        </ModalShell>
      ) : null}

      {openSection === "new-arrivals" && newArrivalsDraft ? (
        <ModalShell
          title="New Arrivals"
          subtitle="Only the selected products will appear in the homepage arrival marquee."
          onClose={() => saving ? null : setOpenSection(null)}
        >
          <div className="space-y-5">
            <OrderedItemsEditor
              title="Arrival Products"
              description="Select products in the exact order they should slide."
              selectedIds={newArrivalsDraft.productIds}
              onChange={(next) => setNewArrivalsDraft({ productIds: uniqueIds(next, 12) })}
              options={products}
              limit={12}
              type="product"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void saveSection("new-arrivals", newArrivalsDraft)}
                disabled={saving === "new-arrivals"}
                className="inline-flex items-center gap-2 rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
              >
                <Save size={15} />
                {saving === "new-arrivals" ? "Saving..." : "Save New Arrivals"}
              </button>
            </div>
          </div>
        </ModalShell>
      ) : null}

      {openSection === "featured-collections" && featuredDraft ? (
        <ModalShell
          title="Featured Collections"
          subtitle="Choose the heading and exactly three categories for this homepage section."
          onClose={() => saving ? null : setOpenSection(null)}
        >
          <div className="space-y-5">
            <div className="grid gap-4">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.16em] text-stone-500">Heading</p>
                <input
                  value={featuredDraft.heading}
                  onChange={(event) => setFeaturedDraft({ ...featuredDraft, heading: event.target.value })}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 outline-none transition focus:border-stone-500"
                />
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.16em] text-stone-500">One-Line Description</p>
                <textarea
                  value={featuredDraft.description}
                  onChange={(event) => setFeaturedDraft({ ...featuredDraft, description: event.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 outline-none transition focus:border-stone-500"
                />
              </div>
            </div>
            <OrderedItemsEditor
              title="Featured Categories"
              description="Pick up to three categories to display."
              selectedIds={featuredDraft.categoryIds}
              onChange={(next) => setFeaturedDraft({ ...featuredDraft, categoryIds: uniqueIds(next, 3) })}
              options={categories}
              limit={3}
              type="category"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void saveSection("featured-collections", featuredDraft)}
                disabled={saving === "featured-collections"}
                className="inline-flex items-center gap-2 rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
              >
                <Save size={15} />
                {saving === "featured-collections" ? "Saving..." : "Save Featured Collections"}
              </button>
            </div>
          </div>
        </ModalShell>
      ) : null}

      {openSection === "bestseller" && bestsellerDraft ? (
        <ModalShell
          title="Bestseller Tabs"
          subtitle="Assign exact products per category tab. View-all links will use the real category listing pages."
          onClose={() => saving ? null : setOpenSection(null)}
        >
          <div className="space-y-5">
            <div className="grid gap-4">
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.16em] text-stone-500">Heading</p>
                <input
                  value={bestsellerDraft.heading}
                  onChange={(event) => setBestsellerDraft({ ...bestsellerDraft, heading: event.target.value })}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 outline-none transition focus:border-stone-500"
                />
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.16em] text-stone-500">One-Line Description</p>
                <textarea
                  value={bestsellerDraft.description}
                  onChange={(event) => setBestsellerDraft({ ...bestsellerDraft, description: event.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 outline-none transition focus:border-stone-500"
                />
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <OrderedItemsEditor
                title="Rings"
                description="Choose up to four ring products."
                selectedIds={bestsellerDraft.ringsProductIds}
                onChange={(next) => setBestsellerDraft({ ...bestsellerDraft, ringsProductIds: uniqueIds(next, 4) })}
                options={products.filter((product) => product.categorySlug === "rings")}
                limit={4}
                type="product"
              />
              <OrderedItemsEditor
                title="Necklaces"
                description="Choose up to four necklace products."
                selectedIds={bestsellerDraft.necklacesProductIds}
                onChange={(next) => setBestsellerDraft({ ...bestsellerDraft, necklacesProductIds: uniqueIds(next, 4) })}
                options={products.filter((product) => product.categorySlug === "necklaces")}
                limit={4}
                type="product"
              />
              <OrderedItemsEditor
                title="Earrings"
                description="Choose up to four earring products."
                selectedIds={bestsellerDraft.earringsProductIds}
                onChange={(next) => setBestsellerDraft({ ...bestsellerDraft, earringsProductIds: uniqueIds(next, 4) })}
                options={products.filter((product) => product.categorySlug === "earrings")}
                limit={4}
                type="product"
              />
              <OrderedItemsEditor
                title="Bracelets"
                description="Choose up to four bracelet products."
                selectedIds={bestsellerDraft.braceletsProductIds}
                onChange={(next) => setBestsellerDraft({ ...bestsellerDraft, braceletsProductIds: uniqueIds(next, 4) })}
                options={products.filter((product) => product.categorySlug === "bracelets")}
                limit={4}
                type="product"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void saveSection("bestseller", bestsellerDraft)}
                disabled={saving === "bestseller"}
                className="inline-flex items-center gap-2 rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
              >
                <Save size={15} />
                {saving === "bestseller" ? "Saving..." : "Save Bestseller Tabs"}
              </button>
            </div>
          </div>
        </ModalShell>
      ) : null}

      {openSection === "signature" && signatureDraft ? (
        <ModalShell
          title="Signature Pieces"
          subtitle="Select the four signature products that should appear on the homepage signature section."
          onClose={() => saving ? null : setOpenSection(null)}
        >
          <div className="space-y-5">
            <OrderedItemsEditor
              title="Signature Product Selection"
              description="Only products from the signature range should be selected here."
              selectedIds={signatureDraft.productIds}
              onChange={(next) => setSignatureDraft({ productIds: uniqueIds(next, 4) })}
              options={products.filter((product) => product.isSignature)}
              limit={4}
              type="product"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void saveSection("signature", signatureDraft)}
                disabled={saving === "signature"}
                className="inline-flex items-center gap-2 rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
              >
                <Save size={15} />
                {saving === "signature" ? "Saving..." : "Save Signature Section"}
              </button>
            </div>
          </div>
        </ModalShell>
      ) : null}

      {openSection === "testimonials" ? (
        <ModalShell
          title="Testimonials"
          subtitle="Create and curate the testimonial rotation shown on the homepage."
          onClose={() => saving ? null : setOpenSection(null)}
          maxWidth="max-w-6xl"
        >
          <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <form className="space-y-4 rounded-3xl border border-stone-200 bg-white p-5" onSubmit={saveNewTestimonial}>
              <div>
                <h4 className="font-medium text-stone-900">Add Testimonial</h4>
                <p className="mt-1 text-sm text-stone-600">Create a new homepage quote with a customer portrait.</p>
              </div>
              <input
                value={newTestimonial.customerName}
                onChange={(event) => setNewTestimonial((prev) => ({ ...prev, customerName: event.target.value }))}
                placeholder="Customer name"
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 outline-none transition focus:border-stone-500"
              />
              <textarea
                value={newTestimonial.quote}
                onChange={(event) => setNewTestimonial((prev) => ({ ...prev, quote: event.target.value }))}
                rows={4}
                placeholder="One-line testimonial"
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 outline-none transition focus:border-stone-500"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="number"
                  min={0}
                  value={newTestimonial.sortOrder}
                  onChange={(event) => setNewTestimonial((prev) => ({ ...prev, sortOrder: Number(event.target.value) || 0 }))}
                  placeholder="Sort order"
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 outline-none transition focus:border-stone-500"
                />
                <label className="flex items-center gap-3 rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-700">
                  <input
                    type="checkbox"
                    checked={newTestimonial.isActive}
                    onChange={(event) => setNewTestimonial((prev) => ({ ...prev, isActive: event.target.checked }))}
                  />
                  Active on homepage
                </label>
              </div>
              <label className="flex cursor-pointer items-center rounded-xl border border-dashed border-stone-300 bg-white px-3 py-3 text-sm text-stone-700">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  className="sr-only"
                  onChange={(event) => setNewTestimonial((prev) => ({ ...prev, image: event.target.files?.[0] || null }))}
                />
                {newTestimonial.image ? newTestimonial.image.name : "Choose customer image"}
              </label>
              <button
                type="submit"
                disabled={saving === "testimonials"}
                className="inline-flex items-center gap-2 rounded-full border border-stone-900 bg-stone-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
              >
                <Plus size={15} />
                {saving === "testimonials" ? "Saving..." : "Add Testimonial"}
              </button>
            </form>

            <div className="space-y-4">
              {testimonials.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-stone-300 bg-white/70 p-8 text-center text-sm text-stone-500">
                  No testimonials added yet.
                </div>
              ) : (
                testimonials.map((testimonial) => {
                  const draft = testimonialDrafts[testimonial.id] || testimonial;
                  return (
                    <div key={testimonial.id} className="rounded-3xl border border-stone-200 bg-white p-4">
                      <div className="grid gap-4 md:grid-cols-[120px_1fr]">
                        <div className="space-y-3">
                          <div className="relative h-28 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
                            <Image src={draft.imageUrl} alt={draft.customerName} fill className="object-cover" />
                          </div>
                          <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-700">
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/avif"
                              className="sr-only"
                              onChange={(event) => setTestimonialImages((prev) => ({ ...prev, [testimonial.id]: event.target.files?.[0] || null }))}
                            />
                            {testimonialImages[testimonial.id]?.name || "Replace image"}
                          </label>
                        </div>
                        <div className="space-y-3">
                          <input
                            value={draft.customerName}
                            onChange={(event) =>
                              setTestimonialDrafts((prev) => ({
                                ...prev,
                                [testimonial.id]: { ...draft, customerName: event.target.value }
                              }))
                            }
                            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 outline-none transition focus:border-stone-500"
                          />
                          <textarea
                            value={draft.quote}
                            onChange={(event) =>
                              setTestimonialDrafts((prev) => ({
                                ...prev,
                                [testimonial.id]: { ...draft, quote: event.target.value }
                              }))
                            }
                            rows={3}
                            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 outline-none transition focus:border-stone-500"
                          />
                          <div className="grid gap-3 sm:grid-cols-2">
                            <input
                              type="number"
                              min={0}
                              value={draft.sortOrder}
                              onChange={(event) =>
                                setTestimonialDrafts((prev) => ({
                                  ...prev,
                                  [testimonial.id]: { ...draft, sortOrder: Number(event.target.value) || 0 }
                                }))
                              }
                              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 outline-none transition focus:border-stone-500"
                            />
                            <label className="flex items-center gap-3 rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-700">
                              <input
                                type="checkbox"
                                checked={draft.isActive}
                                onChange={(event) =>
                                  setTestimonialDrafts((prev) => ({
                                    ...prev,
                                    [testimonial.id]: { ...draft, isActive: event.target.checked }
                                  }))
                                }
                              />
                              Active
                            </label>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => void updateTestimonial(testimonial.id)}
                              disabled={saving === "testimonials"}
                              className="inline-flex items-center gap-2 rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                            >
                              <Save size={15} />
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => void deleteTestimonial(testimonial.id)}
                              disabled={saving === "testimonials"}
                              className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 disabled:opacity-60"
                            >
                              <Trash2 size={15} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </ModalShell>
      ) : null}
    </section>
  );
}
