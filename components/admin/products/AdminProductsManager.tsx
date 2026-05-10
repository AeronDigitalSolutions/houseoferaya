"use client";

import { useMemo, useState } from "react";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { calculateJewelryPrice, PURITY_FACTOR_MAP } from "@/lib/jewelry-pricing";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { formatCurrency } from "@/lib/format";

type CategoryOption = { id: string; name: string; slug: string };
type ProductRow = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  stock: number;
  baseMetal: "GOLD" | "SILVER";
  purity: "K24" | "K22" | "K18" | "K14" | "S925";
  weightGrams: number;
  finalPrice: number;
  isActive: boolean;
};

type ProductFormState = {
  name: string;
  slug: string;
  description: string;
  sku: string;
  categoryId: string;
  stock: number;
  compareAtPrice: string;
  certification: string;
  baseMetal: "GOLD" | "SILVER";
  metalColor: "YELLOW_GOLD" | "ROSE_GOLD" | "WHITE_GOLD" | "OXIDISED_SILVER";
  purity: "K24" | "K22" | "K18" | "K14" | "S925";
  purityFactor: number;
  weightGrams: number;
  activeGoldRate: number;
  activeSilverRate: number;
  useManualSellingRate: boolean;
  manualSellingRate: number;
  makingChargeType: "PER_GRAM" | "FIXED" | "PERCENTAGE";
  makingChargeValue: number;
  hasStone: boolean;
  stoneType: string;
  stoneCarat: number;
  stoneCostType: "FIXED" | "PER_CARAT";
  stoneCostValue: number;
  huidCharge: number;
  gstPercentage: number;
};

const initialState: ProductFormState = {
  name: "",
  slug: "",
  description: "",
  sku: "",
  categoryId: "",
  stock: 0,
  compareAtPrice: "",
  certification: "In-house Certified",
  baseMetal: "GOLD",
  metalColor: "YELLOW_GOLD",
  purity: "K18",
  purityFactor: PURITY_FACTOR_MAP.K18,
  weightGrams: 1,
  activeGoldRate: 9500,
  activeSilverRate: 105,
  useManualSellingRate: false,
  manualSellingRate: 0,
  makingChargeType: "PER_GRAM",
  makingChargeValue: 2500,
  hasStone: false,
  stoneType: "",
  stoneCarat: 0,
  stoneCostType: "FIXED",
  stoneCostValue: 0,
  huidCharge: 55,
  gstPercentage: 3
};

export function AdminProductsManager({
  categories,
  initialProducts,
  canEditProducts
}: {
  categories: CategoryOption[];
  initialProducts: ProductRow[];
  canEditProducts: boolean;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [state, setState] = useState<ProductFormState>({
    ...initialState,
    categoryId: categories[0]?.id || ""
  });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedRate = useMemo(() => {
    if (state.useManualSellingRate && state.manualSellingRate > 0) return state.manualSellingRate;
    return state.baseMetal === "GOLD" ? state.activeGoldRate : state.activeSilverRate;
  }, [state.activeGoldRate, state.activeSilverRate, state.baseMetal, state.manualSellingRate, state.useManualSellingRate]);

  const preview = useMemo(
    () =>
      calculateJewelryPrice({
        baseMetal: state.baseMetal,
        metalRate: selectedRate,
        weightGrams: state.weightGrams,
        purityFactor: state.purityFactor,
        makingChargeType: state.makingChargeType,
        makingChargeValue: state.makingChargeValue,
        stoneCostType: state.stoneCostType,
        stoneCostValue: state.stoneCostValue,
        stoneCarat: state.stoneCarat,
        huidCharge: state.huidCharge,
        gstPercentage: state.gstPercentage
      }),
    [selectedRate, state]
  );

  const onField = <K extends keyof ProductFormState>(field: K, value: ProductFormState[K]) => {
    setState((prev) => ({ ...prev, [field]: value }));
  };

  const createProduct = async () => {
    if (!canEditProducts) return;
    setBusy(true);
    setNotice(null);
    setError(null);
    try {
      const payload = {
        ...state,
        compareAtPrice: state.compareAtPrice ? Number(state.compareAtPrice) : null
      };
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setError(data?.message || "Unable to create product.");
        return;
      }
      setNotice(data?.message || "Product created.");
      const created = data.product;
      setProducts((prev) => [
        {
          id: created.id,
          name: created.name,
          slug: created.slug,
          sku: created.sku,
          stock: created.stock,
          baseMetal: state.baseMetal,
          purity: state.purity,
          weightGrams: state.weightGrams,
          finalPrice: Number(created.price),
          isActive: true
        },
        ...prev
      ]);
      setState({ ...initialState, categoryId: categories[0]?.id || "" });
    } catch {
      setError("Unable to create product.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="font-heading text-3xl text-stone-900 sm:text-4xl">Products</h2>
        <p className="text-sm text-stone-600">
          Pricing is component-based. Final price is calculated from metal value, making, stone, HUID, and GST.
        </p>
      </div>

      {notice ? <div className="card border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</div> : null}
      {error ? <div className="card border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}

      <section className="card space-y-4 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#9b7445]" />
          <h3 className="font-heading text-xl text-stone-900">New Product Pricing Builder</h3>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Product Name</span>
            <input value={state.name} onChange={(e) => onField("name", e.target.value)} className="h-11 w-full rounded-xl border border-black/15 px-3 text-sm" />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Slug</span>
            <input value={state.slug} onChange={(e) => onField("slug", e.target.value.toLowerCase().replace(/\s+/g, "-"))} className="h-11 w-full rounded-xl border border-black/15 px-3 text-sm" />
          </label>
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Description</span>
            <textarea value={state.description} onChange={(e) => onField("description", e.target.value)} className="min-h-[88px] w-full rounded-xl border border-black/15 px-3 py-2 text-sm" />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.16em] text-stone-500">SKU</span>
            <input value={state.sku} onChange={(e) => onField("sku", e.target.value.toUpperCase())} className="h-11 w-full rounded-xl border border-black/15 px-3 text-sm" />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Category</span>
            <CustomSelect value={state.categoryId} onValueChange={(value) => onField("categoryId", value)} options={categories.map((cat) => ({ value: cat.id, label: cat.name }))} buttonClassName="h-11 w-full rounded-xl border border-black/15 px-3 text-sm" menuClassName="w-full" />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Stock</span>
            <input type="number" min={0} value={state.stock} onChange={(e) => onField("stock", Number(e.target.value))} className="h-11 w-full rounded-xl border border-black/15 px-3 text-sm" />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Compare At Price (optional)</span>
            <input type="number" min={0} value={state.compareAtPrice} onChange={(e) => onField("compareAtPrice", e.target.value)} className="h-11 w-full rounded-xl border border-black/15 px-3 text-sm" />
          </label>
        </div>

        <div className="grid gap-3 border-t border-black/10 pt-4 md:grid-cols-2">
          <CustomSelect value={state.baseMetal} onValueChange={(value) => onField("baseMetal", value as ProductFormState["baseMetal"])} options={[{ value: "GOLD", label: "Gold" }, { value: "SILVER", label: "Silver" }]} buttonClassName="h-11 w-full rounded-xl border border-black/15 px-3 text-sm" menuClassName="w-full" />
          <CustomSelect value={state.metalColor} onValueChange={(value) => onField("metalColor", value as ProductFormState["metalColor"])} options={[{ value: "YELLOW_GOLD", label: "Yellow Gold" }, { value: "ROSE_GOLD", label: "Rose Gold" }, { value: "WHITE_GOLD", label: "White Gold" }, { value: "OXIDISED_SILVER", label: "Oxidised Silver" }]} buttonClassName="h-11 w-full rounded-xl border border-black/15 px-3 text-sm" menuClassName="w-full" />
          <CustomSelect
            value={state.purity}
            onValueChange={(value) => {
              const nextPurity = value as ProductFormState["purity"];
              onField("purity", nextPurity);
              onField("purityFactor", PURITY_FACTOR_MAP[nextPurity]);
            }}
            options={[
              { value: "K24", label: "24K (1.0)" },
              { value: "K22", label: "22K (0.916)" },
              { value: "K18", label: "18K (0.75)" },
              { value: "K14", label: "14K (0.585)" },
              { value: "S925", label: "925 Silver (0.925)" }
            ]}
            buttonClassName="h-11 w-full rounded-xl border border-black/15 px-3 text-sm"
            menuClassName="w-full"
          />
          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Weight (grams)</span>
            <input type="number" min={0} step="0.001" value={state.weightGrams} onChange={(e) => onField("weightGrams", Number(e.target.value))} className="h-11 w-full rounded-xl border border-black/15 px-3 text-sm" />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Active Gold Rate (₹/g)</span>
            <input type="number" min={0} step="0.01" value={state.activeGoldRate} onChange={(e) => onField("activeGoldRate", Number(e.target.value))} className="h-11 w-full rounded-xl border border-black/15 px-3 text-sm" />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Active Silver Rate (₹/g)</span>
            <input type="number" min={0} step="0.01" value={state.activeSilverRate} onChange={(e) => onField("activeSilverRate", Number(e.target.value))} className="h-11 w-full rounded-xl border border-black/15 px-3 text-sm" />
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-black/10 bg-[#f8f5ef] px-3 py-2 text-sm text-stone-700">
            <input type="checkbox" checked={state.useManualSellingRate} onChange={(e) => onField("useManualSellingRate", e.target.checked)} className="h-4 w-4 accent-[#9b7445]" />
            Use manual selling rate
          </label>
          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Manual Selling Rate (₹/g)</span>
            <input type="number" min={0} step="0.01" value={state.manualSellingRate} onChange={(e) => onField("manualSellingRate", Number(e.target.value))} className="h-11 w-full rounded-xl border border-black/15 px-3 text-sm" />
          </label>
        </div>

        <div className="grid gap-3 border-t border-black/10 pt-4 md:grid-cols-2">
          <CustomSelect value={state.makingChargeType} onValueChange={(value) => onField("makingChargeType", value as ProductFormState["makingChargeType"])} options={[{ value: "PER_GRAM", label: "Making: Per Gram" }, { value: "FIXED", label: "Making: Fixed" }, { value: "PERCENTAGE", label: "Making: Percentage" }]} buttonClassName="h-11 w-full rounded-xl border border-black/15 px-3 text-sm" menuClassName="w-full" />
          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Making Charge Value</span>
            <input type="number" min={0} step="0.01" value={state.makingChargeValue} onChange={(e) => onField("makingChargeValue", Number(e.target.value))} className="h-11 w-full rounded-xl border border-black/15 px-3 text-sm" />
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-black/10 bg-[#f8f5ef] px-3 py-2 text-sm text-stone-700">
            <input type="checkbox" checked={state.hasStone} onChange={(e) => onField("hasStone", e.target.checked)} className="h-4 w-4 accent-[#9b7445]" />
            This piece has stone/diamond cost
          </label>
          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Stone Type</span>
            <input value={state.stoneType} onChange={(e) => onField("stoneType", e.target.value)} className="h-11 w-full rounded-xl border border-black/15 px-3 text-sm" />
          </label>
          <CustomSelect value={state.stoneCostType} onValueChange={(value) => onField("stoneCostType", value as ProductFormState["stoneCostType"])} options={[{ value: "FIXED", label: "Stone Cost: Fixed" }, { value: "PER_CARAT", label: "Stone Cost: Per Carat" }]} buttonClassName="h-11 w-full rounded-xl border border-black/15 px-3 text-sm" menuClassName="w-full" />
          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Stone Cost Value</span>
            <input type="number" min={0} step="0.01" value={state.stoneCostValue} onChange={(e) => onField("stoneCostValue", Number(e.target.value))} className="h-11 w-full rounded-xl border border-black/15 px-3 text-sm" />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Stone Carat</span>
            <input type="number" min={0} step="0.001" value={state.stoneCarat} onChange={(e) => onField("stoneCarat", Number(e.target.value))} className="h-11 w-full rounded-xl border border-black/15 px-3 text-sm" />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.16em] text-stone-500">HUID Charge</span>
            <input type="number" min={0} step="0.01" value={state.huidCharge} onChange={(e) => onField("huidCharge", Number(e.target.value))} className="h-11 w-full rounded-xl border border-black/15 px-3 text-sm" />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs uppercase tracking-[0.16em] text-stone-500">GST %</span>
            <input type="number" min={0} step="0.01" value={state.gstPercentage} onChange={(e) => onField("gstPercentage", Number(e.target.value))} className="h-11 w-full rounded-xl border border-black/15 px-3 text-sm" />
          </label>
        </div>

        <div className="rounded-2xl border border-black/10 bg-[#fbf8f2] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Final Price Preview</p>
          <div className="mt-3 grid gap-2 text-sm text-stone-700 sm:grid-cols-2">
            <p>Metal value: {formatCurrency(preview.metalPrice)}</p>
            <p>Making charge: {formatCurrency(preview.makingCharge)}</p>
            <p>Stone cost: {formatCurrency(preview.stoneCost)}</p>
            <p>HUID: {formatCurrency(preview.huidCharge)}</p>
            <p>GST: {formatCurrency(preview.gstAmount)}</p>
            <p className="font-semibold text-stone-900">Final: {formatCurrency(preview.finalPrice)}</p>
          </div>
          <p className="mt-2 text-xs text-stone-500">
            TODO: Locked metal rate integration can be pulled from pricing dashboard state/settings API.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => void createProduct()}
            disabled={!canEditProducts || busy}
            className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create Product
          </button>
        </div>
      </section>

      <section className="card p-4 sm:p-5">
        <h3 className="font-heading text-xl text-stone-900">Product Catalog</h3>
        <p className="mt-1 text-sm text-stone-600">Live calculated prices from stored pricing components.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[760px] text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-100">
              <tr>
                <th className="px-3 py-2.5">Name</th>
                <th className="px-3 py-2.5">SKU</th>
                <th className="px-3 py-2.5">Metal</th>
                <th className="px-3 py-2.5">Purity</th>
                <th className="px-3 py-2.5">Weight</th>
                <th className="px-3 py-2.5">Final Price</th>
                <th className="px-3 py-2.5">Stock</th>
                <th className="px-3 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-stone-100">
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-stone-900">{product.name}</p>
                    <p className="text-xs text-stone-500">/{product.slug}</p>
                  </td>
                  <td className="px-3 py-2.5">{product.sku}</td>
                  <td className="px-3 py-2.5">{product.baseMetal}</td>
                  <td className="px-3 py-2.5">{product.purity}</td>
                  <td className="px-3 py-2.5">{product.weightGrams}g</td>
                  <td className="px-3 py-2.5 font-semibold text-stone-900">{formatCurrency(product.finalPrice)}</td>
                  <td className="px-3 py-2.5">{product.stock}</td>
                  <td className="px-3 py-2.5">{product.isActive ? "Active" : "Inactive"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
