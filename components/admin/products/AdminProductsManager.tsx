"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import {
  Crown,
  FileSpreadsheet,
  ImagePlus,
  Loader2,
  Plus,
  Sparkles,
  UploadCloud,
  X
} from "lucide-react";
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
  isSignature: boolean;
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
  isSignature: boolean;
};

type CsvRowRecord = Record<string, string>;

const CSV_HEADERS = [
  "name",
  "slug",
  "description",
  "sku",
  "categorySlug",
  "stock",
  "compareAtPrice",
  "certification",
  "baseMetal",
  "metalColor",
  "purity",
  "weightGrams",
  "activeGoldRate",
  "activeSilverRate",
  "useManualSellingRate",
  "manualSellingRate",
  "makingChargeType",
  "makingChargeValue",
  "hasStone",
  "stoneType",
  "stoneCarat",
  "stoneCostType",
  "stoneCostValue",
  "huidCharge",
  "gstPercentage",
  "isSignature",
  "primaryImageUrl",
  "secondaryImageUrls"
];

const CSV_SAMPLE_ROW = [
  "Celeste Diamond Ring",
  "celeste-diamond-ring",
  "Premium signature-ready product created via CSV.",
  "RNG-CLST-001",
  "rings",
  "12",
  "58999",
  "IGI Certified",
  "GOLD",
  "ROSE_GOLD",
  "K18",
  "4.8",
  "9500",
  "105",
  "false",
  "0",
  "PER_GRAM",
  "2500",
  "true",
  "Diamond",
  "0.9",
  "FIXED",
  "25000",
  "55",
  "3",
  "true",
  "/uploads/products/celeste-diamond-ring/primary.jpg",
  "/uploads/products/celeste-diamond-ring/1.jpg|/uploads/products/celeste-diamond-ring/2.jpg"
];

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
  gstPercentage: 3,
  isSignature: false
};

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function csvToRecords(csvText: string) {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { rows: [] as CsvRowRecord[], error: "CSV should include headers and at least one row." };
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.trim());
  const missingHeaders = CSV_HEADERS.filter((header) => !headers.includes(header));
  if (missingHeaders.length) {
    return { rows: [] as CsvRowRecord[], error: `Missing headers: ${missingHeaders.join(", ")}` };
  }

  const rows = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce<CsvRowRecord>((acc, header, idx) => {
      acc[header] = (values[idx] ?? "").trim();
      return acc;
    }, {});
  });

  return { rows, error: null as string | null };
}

function ModalShell({
  title,
  subtitle,
  onClose,
  children
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[130] flex items-end bg-black/45 p-0 backdrop-blur-[2px] sm:items-center sm:justify-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] border border-stone-200 bg-[#f8f5f0] p-5 shadow-2xl sm:max-w-5xl sm:rounded-3xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-heading text-2xl text-stone-900 sm:text-3xl">{title}</h3>
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
  const [listingMode, setListingMode] = useState<"ALL" | "NORMAL" | "SIGNATURE">("ALL");
  const [state, setState] = useState<ProductFormState>({
    ...initialState,
    categoryId: categories[0]?.id || ""
  });
  const [busy, setBusy] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [buildStep, setBuildStep] = useState<"TYPE" | "FORM">("TYPE");
  const [primaryImageFile, setPrimaryImageFile] = useState<File | null>(null);
  const [secondaryImageFiles, setSecondaryImageFiles] = useState<File[]>([]);

  const bulkCsvInputRef = useRef<HTMLInputElement | null>(null);
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

  const listedProducts = useMemo(() => {
    if (listingMode === "SIGNATURE") return products.filter((product) => product.isSignature);
    if (listingMode === "NORMAL") return products.filter((product) => !product.isSignature);
    return products;
  }, [listingMode, products]);

  const onField = <K extends keyof ProductFormState>(field: K, value: ProductFormState[K]) => {
    setState((prev) => ({ ...prev, [field]: value }));
  };

  const resetBuilder = () => {
    setBuildStep("TYPE");
    setState({ ...initialState, categoryId: categories[0]?.id || "" });
    setPrimaryImageFile(null);
    setSecondaryImageFiles([]);
  };

  const uploadProductImage = async ({
    productSlug,
    file,
    fileName,
    isPrimary,
    sortOrder
  }: {
    productSlug: string;
    file: File;
    fileName: string;
    isPrimary: boolean;
    sortOrder: number;
  }) => {
    const formData = new FormData();
    formData.append("productSlug", productSlug);
    formData.append("fileName", fileName);
    formData.append("isPrimary", isPrimary ? "true" : "false");
    formData.append("sortOrder", String(sortOrder));
    formData.append("altText", state.name || "Product image");
    formData.append("file", file);

    const res = await fetch("/api/admin/product-images", {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || "Image upload failed.");
    }
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

      const created = data.product;
      const productSlug = created.slug as string;

      if (primaryImageFile) {
        await uploadProductImage({
          productSlug,
          file: primaryImageFile,
          fileName: `primary-${Date.now()}`,
          isPrimary: true,
          sortOrder: 0
        });
      }

      if (secondaryImageFiles.length) {
        for (let index = 0; index < secondaryImageFiles.length; index += 1) {
          await uploadProductImage({
            productSlug,
            file: secondaryImageFiles[index],
            fileName: `secondary-${index + 1}-${Date.now()}`,
            isPrimary: false,
            sortOrder: index + 1
          });
        }
      }

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
          isActive: true,
          isSignature: Boolean(created.isSignature)
        },
        ...prev
      ]);

      setNotice(`Product created successfully${primaryImageFile || secondaryImageFiles.length ? " with images." : "."}`);
      setIsAddProductModalOpen(false);
      resetBuilder();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create product.");
    } finally {
      setBusy(false);
    }
  };

  const downloadCsvTemplate = () => {
    const csv = `${CSV_HEADERS.join(",")}\n${CSV_SAMPLE_ROW.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")}\n`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "eraya-products-bulk-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const normalizeBool = (value: string) => {
    const text = value.trim().toLowerCase();
    return text === "true" || text === "1" || text === "yes";
  };

  const toNumberOr = (value: string, fallback: number) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const normalizeBaseMetal = (value: string): ProductRow["baseMetal"] => {
    return value === "SILVER" ? "SILVER" : "GOLD";
  };

  const normalizePurity = (value: string): ProductRow["purity"] => {
    const normalized = value.toUpperCase();
    if (normalized === "K24") return "K24";
    if (normalized === "K22") return "K22";
    if (normalized === "K14") return "K14";
    if (normalized === "S925") return "S925";
    return "K18";
  };

  const handleBulkCsvSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBulkBusy(true);
    setNotice(null);
    setError(null);

    try {
      const text = await file.text();
      const parsed = csvToRecords(text);
      if (parsed.error) {
        setError(parsed.error);
        return;
      }
      if (!parsed.rows.length) {
        setError("CSV has no product rows.");
        return;
      }

      const categoryBySlug = new Map(categories.map((cat) => [cat.slug, cat.id]));
      let createdCount = 0;
      let failedCount = 0;

      for (const row of parsed.rows) {
        const categoryId = categoryBySlug.get(row.categorySlug);
        if (!categoryId) {
          failedCount += 1;
          continue;
        }

        const payload = {
          name: row.name,
          slug: row.slug,
          description: row.description,
          sku: row.sku,
          categoryId,
          stock: toNumberOr(row.stock, 0),
          compareAtPrice: row.compareAtPrice ? toNumberOr(row.compareAtPrice, 0) : null,
          certification: row.certification || "In-house Certified",
          baseMetal: (row.baseMetal || "GOLD").toUpperCase(),
          metalColor: (row.metalColor || "YELLOW_GOLD").toUpperCase(),
          purity: (row.purity || "K18").toUpperCase(),
          purityFactor: PURITY_FACTOR_MAP[(row.purity || "K18").toUpperCase() as keyof typeof PURITY_FACTOR_MAP] ?? PURITY_FACTOR_MAP.K18,
          weightGrams: toNumberOr(row.weightGrams, 1),
          activeGoldRate: toNumberOr(row.activeGoldRate, 9500),
          activeSilverRate: toNumberOr(row.activeSilverRate, 105),
          useManualSellingRate: normalizeBool(row.useManualSellingRate || "false"),
          manualSellingRate: toNumberOr(row.manualSellingRate, 0),
          makingChargeType: (row.makingChargeType || "PER_GRAM").toUpperCase(),
          makingChargeValue: toNumberOr(row.makingChargeValue, 0),
          hasStone: normalizeBool(row.hasStone || "false"),
          stoneType: row.stoneType || "",
          stoneCarat: toNumberOr(row.stoneCarat, 0),
          stoneCostType: (row.stoneCostType || "FIXED").toUpperCase(),
          stoneCostValue: toNumberOr(row.stoneCostValue, 0),
          huidCharge: toNumberOr(row.huidCharge, 55),
          gstPercentage: toNumberOr(row.gstPercentage, 3),
          isSignature: normalizeBool(row.isSignature || "false"),
          primaryImageUrl: row.primaryImageUrl || "",
          secondaryImageUrls: row.secondaryImageUrls
            ? row.secondaryImageUrls.split("|").map((entry) => entry.trim()).filter(Boolean)
            : []
        };

        const response = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok || !result?.success) {
          failedCount += 1;
          continue;
        }

        const created = result.product;
        setProducts((prev) => [
          {
            id: created.id,
            name: created.name,
            slug: created.slug,
            sku: created.sku,
            stock: created.stock,
            baseMetal: normalizeBaseMetal(String(payload.baseMetal)),
            purity: normalizePurity(String(payload.purity)),
            weightGrams: payload.weightGrams,
            finalPrice: Number(created.price),
            isActive: true,
            isSignature: Boolean(created.isSignature)
          },
          ...prev
        ]);
        createdCount += 1;
      }

      setNotice(`Bulk upload completed. Created: ${createdCount}. Failed: ${failedCount}.`);
    } catch (bulkError) {
      setError(bulkError instanceof Error ? bulkError.message : "Bulk upload failed.");
    } finally {
      event.target.value = "";
      setBulkBusy(false);
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

      <section className="card p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-heading text-xl text-stone-900">Product Catalog</h3>
            <p className="mt-1 text-sm text-stone-600">Manage listed products, segments, and premium signature pieces.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={downloadCsvTemplate}
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700"
            >
              <FileSpreadsheet className="h-4 w-4" />
              CSV Template
            </button>

            <input
              ref={bulkCsvInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => void handleBulkCsvSelected(event)}
            />
            <button
              type="button"
              onClick={() => bulkCsvInputRef.current?.click()}
              disabled={!canEditProducts || bulkBusy}
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 disabled:opacity-60"
            >
              {bulkBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              Bulk Upload CSV
            </button>

            <button
              type="button"
              disabled={!canEditProducts}
              onClick={() => {
                resetBuilder();
                setIsAddProductModalOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              Add New Product
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.14em] text-stone-500">
            Showing {listedProducts.length} {listingMode === "ALL" ? "products" : listingMode === "SIGNATURE" ? "signature pieces" : "normal products"}
          </p>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-100 p-1">
            <button
              type="button"
              onClick={() => setListingMode("ALL")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                listingMode === "ALL"
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:bg-white hover:text-stone-900"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setListingMode("NORMAL")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                listingMode === "NORMAL"
                  ? "bg-stone-900 text-white"
                  : "text-stone-600 hover:bg-white hover:text-stone-900"
              }`}
            >
              Normal
            </button>
            <button
              type="button"
              onClick={() => setListingMode("SIGNATURE")}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                listingMode === "SIGNATURE"
                  ? "bg-[#122b7a] text-[#f3d38a]"
                  : "text-[#122b7a] hover:bg-white"
              }`}
            >
              <Crown className="h-3.5 w-3.5" />
              Signature
            </button>
          </div>
        </div>

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
              {listedProducts.map((product) => (
                <tr key={product.id} className="border-b border-stone-100">
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="font-medium text-stone-900">{product.name}</p>
                      {product.isSignature ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#d4b46a]/60 bg-[#122b7a]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#122b7a]">
                          <Crown className="h-3 w-3 text-[#c79d4a]" />
                          Signature
                        </span>
                      ) : null}
                    </div>
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
              {listedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-sm text-stone-500">
                    No products found for this listing view.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {isAddProductModalOpen ? (
        <ModalShell
          title="New Product Pricing Builder"
          subtitle="Add a normal or signature piece product with full pricing components and image assets."
          onClose={() => {
            setIsAddProductModalOpen(false);
            resetBuilder();
          }}
        >
          <div className="space-y-4">
            {buildStep === "TYPE" ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => onField("isSignature", false)}
                    className={`rounded-2xl border px-4 py-4 text-left transition ${
                      !state.isSignature
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-300 bg-white text-stone-700 hover:border-stone-500"
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.16em]">Normal Product</p>
                    <p className="mt-1 text-sm">For regular catalog listings and store browse pages.</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => onField("isSignature", true)}
                    className={`rounded-2xl border px-4 py-4 text-left transition ${
                      state.isSignature
                        ? "border-[#c79d4a] bg-[#122b7a] text-[#f3d38a]"
                        : "border-[#d2c4a0] bg-[#f9f4e6] text-[#122b7a] hover:border-[#c79d4a]"
                    }`}
                  >
                    <p className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.16em]">
                      <Crown className="h-4 w-4" />
                      Signature Piece
                    </p>
                    <p className="mt-1 text-sm">For premium royal-blue and gold curated segment.</p>
                  </button>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setBuildStep("FORM")}
                    className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white"
                  >
                    Continue
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/10 bg-[#fbf8f2] p-3">
                  <div className="inline-flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#9b7445]" />
                    <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Product Type</p>
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full border border-stone-200 bg-stone-100 p-1">
                    <button
                      type="button"
                      onClick={() => onField("isSignature", false)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                        !state.isSignature
                          ? "bg-stone-900 text-white"
                          : "text-stone-600 hover:bg-white hover:text-stone-900"
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      type="button"
                      onClick={() => onField("isSignature", true)}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                        state.isSignature
                          ? "bg-[#122b7a] text-[#f3d38a]"
                          : "text-[#122b7a] hover:bg-white"
                      }`}
                    >
                      <Crown className="h-3.5 w-3.5" />
                      Signature
                    </button>
                  </div>
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

                <div className="rounded-2xl border border-[#d9c79a]/70 bg-[#fdf8eb] p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <ImagePlus className="h-4 w-4 text-[#9b7445]" />
                    <p className="text-xs uppercase tracking-[0.16em] text-stone-600">Product Images</p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="space-y-1.5">
                      <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Primary Image (required for best storefront display)</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/avif"
                        onChange={(event) => setPrimaryImageFile(event.target.files?.[0] || null)}
                        className="h-11 w-full rounded-xl border border-black/15 px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-stone-900 file:px-3 file:py-1 file:text-xs file:text-white"
                      />
                      <p className="text-xs text-stone-500">{primaryImageFile ? primaryImageFile.name : "No primary image selected."}</p>
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Secondary Images (multiple)</span>
                      <input
                        type="file"
                        multiple
                        accept="image/png,image/jpeg,image/webp,image/avif"
                        onChange={(event) => setSecondaryImageFiles(Array.from(event.target.files || []))}
                        className="h-11 w-full rounded-xl border border-black/15 px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-stone-900 file:px-3 file:py-1 file:text-xs file:text-white"
                      />
                      <p className="text-xs text-stone-500">
                        {secondaryImageFiles.length ? `${secondaryImageFiles.length} secondary images selected.` : "No secondary images selected."}
                      </p>
                    </label>
                  </div>
                  <p className="mt-2 text-xs text-stone-500">
                    For bulk upload: keep image URLs in CSV fields `primaryImageUrl` and `secondaryImageUrls` (use `|` between secondary URLs).
                  </p>
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

                <div className="flex flex-wrap justify-between gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setBuildStep("TYPE")}
                    className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700"
                  >
                    Back
                  </button>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddProductModalOpen(false);
                        resetBuilder();
                      }}
                      className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700"
                    >
                      Cancel
                    </button>
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
                </div>
              </>
            )}
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
}
