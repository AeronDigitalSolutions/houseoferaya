"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Crown, FolderPlus, Heart, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/EmptyState";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { SafeImage } from "@/components/ui/SafeImage";
import { formatCurrency } from "@/lib/format";
import { isSignatureProductSlug } from "@/lib/signature-piece";

type WishlistProduct = {
  id: string;
  itemId: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  metalType: string;
  image: string;
};

type WishlistGroup = {
  id: string;
  name: string;
  productIds: string[];
};

export function WishlistContent() {
  const router = useRouter();
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const [groups, setGroups] = useState<WishlistGroup[]>([
    { id: "grp-daily", name: "Daily Edit", productIds: [] },
    { id: "grp-gifts", name: "Gift Ideas", productIds: [] }
  ]);
  const [activeGroupId, setActiveGroupId] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const loadWishlist = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/account/wishlist", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        setError(data?.message || "Unable to load wishlist.");
        return;
      }

      const parsed: WishlistProduct[] = (data?.wishlist?.items || []).map((item: any) => ({
        id: item.product.id,
        itemId: item.id,
        name: item.product.name,
        slug: item.product.slug,
        price: Number(item.product.price),
        compareAtPrice: item.product.compareAtPrice ? Number(item.product.compareAtPrice) : null,
        metalType: item.product.metalType,
        image: item.product.images?.[0]?.url || "/assets/collection-aura.jpg"
      }));

      setProducts(parsed);
      setGroups((prev) =>
        prev.map((group) => ({
          ...group,
          productIds: group.productIds.filter((id) => parsed.some((product) => product.id === id))
        }))
      );
    } catch {
      setError("Unable to load wishlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadWishlist();
  }, []);

  const groupTabs = useMemo(
    () => [
      { id: "all", name: "All Items", count: products.length },
      ...groups.map((group) => ({
        id: group.id,
        name: group.name,
        count: group.productIds.filter((id) => products.some((product) => product.id === id)).length
      }))
    ],
    [groups, products]
  );

  const visibleProducts = useMemo(() => {
    if (activeGroupId === "all") return products;
    const group = groups.find((item) => item.id === activeGroupId);
    if (!group) return [];
    return products.filter((product) => group.productIds.includes(product.id));
  }, [activeGroupId, groups, products]);

  const removeFromWishlist = async (itemId: string) => {
    setError("");
    setStatus("");
    try {
      const res = await fetch(`/api/account/wishlist/items/${itemId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Unable to remove item.");
        return;
      }
      setStatus(data?.message || "Removed from wishlist.");
      await loadWishlist();
    } catch {
      setError("Unable to remove item.");
    }
  };

  const getAssignedGroupId = (productId: string): string => {
    const group = groups.find((item) => item.productIds.includes(productId));
    return group?.id ?? "ungrouped";
  };

  const moveToGroup = (productId: string, nextGroupId: string) => {
    setGroups((prev) => {
      const cleaned = prev.map((group) => ({
        ...group,
        productIds: group.productIds.filter((id) => id !== productId)
      }));
      if (nextGroupId === "ungrouped") return cleaned;
      return cleaned.map((group) =>
        group.id === nextGroupId ? { ...group, productIds: [...group.productIds, productId] } : group
      );
    });
  };

  const createGroup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = newGroupName.trim();
    if (!name) return;
    setGroups((prev) => [...prev, { id: `grp_${Date.now()}`, name, productIds: [] }]);
    setNewGroupName("");
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-royal-700/60">Saved Pieces</p>
          <h1 className="font-heading text-3xl text-royal-800 sm:text-4xl">Wishlist</h1>
          <p className="mt-1 text-sm text-royal-700/70">Organize favorites and keep your best picks ready.</p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#9c7346]/50 bg-[#f6ece0] px-5 py-2.5 text-sm font-medium text-royal-800 transition hover:bg-[#efe0cb]"
        >
          <FolderPlus size={16} />
          Create Group
        </button>
      </header>

      <section className="card p-4 sm:p-5">
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {groupTabs.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => setActiveGroupId(group.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.16em] transition ${
                activeGroupId === group.id
                  ? "border-royal-800 bg-royal-800 text-white"
                  : "border-black/12 bg-white text-royal-700/80 hover:border-royal-700"
              }`}
            >
              {group.name} ({group.count})
            </button>
          ))}
        </div>
      </section>

      {loading ? <div className="card p-4 text-sm text-royal-700/80">Loading wishlist...</div> : null}
      {error ? <div className="card p-4 text-sm text-rose-700">{error}</div> : null}
      {status ? <div className="card p-4 text-sm text-emerald-700">{status}</div> : null}

      {!loading && !error && visibleProducts.length === 0 ? (
        <EmptyState
          title="No Saved Products"
          description={
            activeGroupId === "all"
              ? "Your wishlist is currently empty. Add products to start curating your favorites."
              : "No products in this group yet."
          }
        />
      ) : null}

      {!loading && !error && visibleProducts.length > 0 ? (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {visibleProducts.map((product) => (
            (() => {
              const isSignature = isSignatureProductSlug(product.slug);
              const productHref = isSignature ? `/signature-pieces/${product.slug}` : `/products/${product.slug}`;

              return (
                <article
                  key={product.itemId}
                  className={`group overflow-hidden rounded-2xl border shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    isSignature
                      ? "border-[#1b3c95]/35 bg-gradient-to-b from-[#0a225f] via-[#10327f] to-[#0a235f] text-white"
                      : "border-black/10 bg-white/85"
                  }`}
                >
                  <div className="relative">
                    {isSignature ? (
                      <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full border border-[#d8b16b] bg-[#081c56]/85 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#f4d59a]">
                        <Crown size={10} />
                        Signature Piece
                      </span>
                    ) : null}

                <button
                  type="button"
                  onClick={() => void removeFromWishlist(product.itemId)}
                  className="absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full border border-rose-200 bg-white/95 text-rose-600 shadow-sm transition hover:bg-rose-50"
                  aria-label={`Remove ${product.name} from wishlist`}
                >
                  <Trash2 size={12} />
                </button>

                    <Link href={productHref} className="block aspect-square overflow-hidden bg-stone-100">
                  <SafeImage
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </Link>
                  </div>

                  <div className="space-y-2.5 p-3">
                    <Link href={productHref} className="block">
                      <h3
                        className={`font-heading text-base leading-tight sm:text-lg ${
                          isSignature ? "text-[#f6eddd]" : "text-royal-800"
                        }`}
                      >
                        {product.name}
                      </h3>
                      <p
                        className={`mt-1 text-[10px] uppercase tracking-[0.16em] sm:text-xs ${
                          isSignature ? "text-[#e3d1b0]/85" : "text-royal-700/65"
                        }`}
                      >
                        {product.metalType}
                      </p>
                    </Link>

                    <div className="flex items-center gap-2">
                      <p className={`text-lg font-semibold sm:text-xl ${isSignature ? "text-[#f7e6c7]" : "text-royal-800"}`}>
                        {formatCurrency(product.price)}
                      </p>
                      {product.compareAtPrice ? (
                        <p className={`text-xs line-through ${isSignature ? "text-[#dac6a3]/65" : "text-royal-700/45"}`}>
                          {formatCurrency(product.compareAtPrice)}
                        </p>
                      ) : null}
                    </div>

                    <div
                      className={`rounded-xl border p-2 ${
                        isSignature ? "border-[#d5b57b]/35 bg-[#0a1e58]/65" : "border-black/10 bg-[#fbf7f1]"
                      }`}
                    >
                      <label
                        className={`mb-1 block text-[10px] uppercase tracking-[0.16em] ${
                          isSignature ? "text-[#e6d5b7]/80" : "text-royal-700/60"
                        }`}
                      >
                        Group
                      </label>
                      <CustomSelect
                        value={getAssignedGroupId(product.id)}
                        onValueChange={(value) => moveToGroup(product.id, value)}
                        options={[
                          { value: "ungrouped", label: "Ungrouped" },
                          ...groups.map((group) => ({ value: group.id, label: group.name }))
                        ]}
                        buttonClassName={`w-full rounded-lg border px-2.5 py-1.5 text-xs outline-none ${
                          isSignature
                            ? "border-[#d6b884]/45 bg-[#112d77] text-[#f5deba]"
                            : "border-black/12 bg-white text-royal-700"
                        }`}
                        menuClassName="w-full"
                      />
                    </div>
                  </div>
                </article>
              );
            })()
          ))}
        </section>
      ) : null}

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-[85] flex items-end bg-black/35 p-0 backdrop-blur-[2px] sm:items-center sm:justify-center sm:p-6">
          <button
            type="button"
            aria-label="Close modal backdrop"
            className="absolute inset-0"
            onClick={() => setIsCreateModalOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Create wishlist group"
            className="relative z-10 w-full rounded-t-3xl border border-black/10 bg-[#f8f4ee] p-4 shadow-2xl sm:max-w-md sm:rounded-3xl sm:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-heading text-2xl text-royal-800">Create Wishlist Group</h3>
                <p className="mt-1 text-sm text-royal-700/70">Organize your saved products into custom lists.</p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/15 bg-white text-royal-700 transition hover:bg-stone-100"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            <form className="space-y-4" onSubmit={createGroup}>
              <input
                required
                value={newGroupName}
                onChange={(event) => setNewGroupName(event.target.value)}
                placeholder="e.g. Wedding Picks"
                className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm text-royal-800 outline-none placeholder:text-royal-700/45 focus:border-[#9c7346]/55"
              />

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-full border border-black/15 bg-white px-5 py-2.5 text-sm text-royal-700 transition hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-full bg-royal-800 px-5 py-2.5 text-sm font-medium text-white">
                  Save Group
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <section className="card flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
        <div className="flex items-center gap-2 text-sm text-royal-700/80">
          <Heart size={16} className="text-[#9c7346]" />
          <span>{products.length} items currently saved</span>
        </div>
        <Link
          href="/collections"
          className="rounded-full border border-black/15 bg-white px-4 py-2 text-xs uppercase tracking-[0.14em] text-royal-700 transition hover:border-royal-700"
        >
          Continue Shopping
        </Link>
      </section>
    </div>
  );
}
