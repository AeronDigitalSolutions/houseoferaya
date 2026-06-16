"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Crown,
  FileSpreadsheet,
  ImagePlus,
  Loader2,
  PencilLine,
  Plus,
  Sparkles,
  Trash2,
  UploadCloud,
  X
} from "lucide-react";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { useBrandDialog } from "@/components/providers/BrandDialogProvider";
import { calculateJewelryPrice, PURITY_FACTOR_MAP } from "@/lib/jewelry-pricing";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { formatCurrency } from "@/lib/format";
import {
  ARTIFICIAL_GST_PERCENTAGE,
  BASE_METAL_LABELS,
  getAdminPurityLabel,
  getAdminWeightLabel,
  type ProductBaseMetal,
  type ProductMetalColor,
  type ProductPurityType
} from "@/lib/product-materials";

type CategoryOption = { id: string; name: string; slug: string };
type MakingChargeValue = "PER_GRAM" | "FIXED" | "PERCENTAGE";
type StoneCostValue = "FIXED" | "PER_CARAT";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  categoryId: string;
  stock: number;
  compareAtPrice: number | null;
  offerPrice: number;
  certification: string;
  baseMetal: ProductBaseMetal;
  metalColor: ProductMetalColor;
  purity: ProductPurityType;
  purityFactor: number;
  weightGrams: number;
  activeGoldRate: number | null;
  activeSilverRate: number | null;
  useManualSellingRate: boolean;
  manualSellingRate: number | null;
  makingChargeType: MakingChargeValue;
  makingChargeValue: number;
  hasStone: boolean;
  stoneType: string;
  stoneCarat: number | null;
  stoneCostType: StoneCostValue;
  stoneCostValue: number;
  huidCharge: number;
  gstPercentage: number;
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
  offerPrice: string;
  certification: string;
  baseMetal: ProductBaseMetal;
  metalColor: ProductMetalColor;
  purity: ProductPurityType;
  purityFactor: number;
  weightGrams: number;
  activeGoldRate: number | null;
  activeSilverRate: number | null;
  useManualSellingRate: boolean;
  manualSellingRate: number;
  makingChargeType: MakingChargeValue;
  makingChargeValue: number;
  hasStone: boolean;
  stoneType: string;
  stoneCarat: number;
  stoneCostType: StoneCostValue;
  stoneCostValue: number;
  huidCharge: number;
  gstPercentage: number;
  isSignature: boolean;
};

type CsvRowRecord = Record<string, string>;

type AdminPricingRatesResponse = {
  success: boolean;
  rates: Array<{
    id: "gold" | "silver";
    sellingRate: number;
    status: "LOCKED" | "UNLOCKED";
    lockedRate: number | null;
  }>;
  message?: string;
};

const CSV_HEADERS = [
  "name",
  "slug",
  "description",
  "sku",
  "categorySlug",
  "stock",
  "compareAtPrice",
  "offerPrice",
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

const CSV_SAMPLE_ROWS = [
  [
    "Celeste Diamond Ring",
    "celeste-diamond-ring",
    "Premium signature-ready product created via CSV.",
    "RNG-CLST-001",
    "rings",
    "12",
    "58999",
    "55299",
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
  ],
  [
    "Velvet Bloom Bracelet",
    "velvet-bloom-bracelet",
    "Artificial premium bracelet with fixed pricing.",
    "ART-VBLM-001",
    "bracelets",
    "25",
    "4999",
    "3799",
    "Fashion Certified",
    "ARTIFICIAL",
    "NOT_APPLICABLE",
    "NOT_APPLICABLE",
    "0",
    "",
    "",
    "false",
    "",
    "FIXED",
    "0",
    "false",
    "",
    "0",
    "FIXED",
    "0",
    "0",
    "18",
    "false",
    "/uploads/products/velvet-bloom-bracelet/primary.jpg",
    "/uploads/products/velvet-bloom-bracelet/1.jpg|/uploads/products/velvet-bloom-bracelet/2.jpg"
  ]
];
const PAGE_SIZE = 20;
const ARTIFICIAL_FIELDS: Pick<
  ProductFormState,
  | "metalColor"
  | "purity"
  | "purityFactor"
  | "weightGrams"
  | "activeGoldRate"
  | "activeSilverRate"
  | "useManualSellingRate"
  | "manualSellingRate"
  | "makingChargeType"
  | "makingChargeValue"
  | "hasStone"
  | "stoneType"
  | "stoneCarat"
  | "stoneCostType"
  | "stoneCostValue"
  | "huidCharge"
  | "gstPercentage"
> = {
  metalColor: "NOT_APPLICABLE",
  purity: "NOT_APPLICABLE",
  purityFactor: PURITY_FACTOR_MAP.NOT_APPLICABLE,
  weightGrams: 0,
  activeGoldRate: null,
  activeSilverRate: null,
  useManualSellingRate: false,
  manualSellingRate: 0,
  makingChargeType: "FIXED",
  makingChargeValue: 0,
  hasStone: false,
  stoneType: "",
  stoneCarat: 0,
  stoneCostType: "FIXED",
  stoneCostValue: 0,
  huidCharge: 0,
  gstPercentage: ARTIFICIAL_GST_PERCENTAGE
};

const initialState: ProductFormState = {
  name: "",
  slug: "",
  description: "",
  sku: "",
  categoryId: "",
  stock: 0,
  compareAtPrice: "",
  offerPrice: "",
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

const METAL_COLOR_OPTIONS: Record<ProductFormState["baseMetal"], { value: ProductFormState["metalColor"]; label: string }[]> = {
  GOLD: [
    { value: "YELLOW_GOLD", label: "Yellow Gold" },
    { value: "ROSE_GOLD", label: "Rose Gold" },
    { value: "WHITE_GOLD", label: "White Gold" }
  ],
  SILVER: [{ value: "OXIDISED_SILVER", label: "Oxidised Silver" }],
  ARTIFICIAL: [{ value: "NOT_APPLICABLE", label: "Not Applicable" }]
};

const PURITY_OPTIONS: Record<ProductFormState["baseMetal"], { value: ProductFormState["purity"]; label: string }[]> = {
  GOLD: [
    { value: "K24", label: "24K (1.0)" },
    { value: "K22", label: "22K (0.916)" },
    { value: "K18", label: "18K (0.75)" },
    { value: "K14", label: "14K (0.585)" }
  ],
  SILVER: [{ value: "S925", label: "925 Silver (0.925)" }],
  ARTIFICIAL: [{ value: "NOT_APPLICABLE", label: "Not Applicable" }]
};

function buildStateForBaseMetal(baseMetal: ProductBaseMetal, previous: ProductFormState): ProductFormState {
  if (baseMetal === "ARTIFICIAL") {
    return {
      ...previous,
      baseMetal,
      ...ARTIFICIAL_FIELDS
    };
  }

  const nextMetalColor = METAL_COLOR_OPTIONS[baseMetal][0].value;
  const nextPurity = PURITY_OPTIONS[baseMetal][0].value;
  return {
    ...previous,
    baseMetal,
    metalColor: nextMetalColor,
    purity: nextPurity,
    purityFactor: PURITY_FACTOR_MAP[nextPurity],
    weightGrams: previous.baseMetal === "ARTIFICIAL" ? initialState.weightGrams : previous.weightGrams || initialState.weightGrams,
    activeGoldRate: previous.baseMetal === "ARTIFICIAL" ? initialState.activeGoldRate : previous.activeGoldRate ?? initialState.activeGoldRate,
    activeSilverRate: previous.baseMetal === "ARTIFICIAL" ? initialState.activeSilverRate : previous.activeSilverRate ?? initialState.activeSilverRate,
    useManualSellingRate: previous.baseMetal === "ARTIFICIAL" ? initialState.useManualSellingRate : previous.useManualSellingRate,
    manualSellingRate: previous.baseMetal === "ARTIFICIAL" ? initialState.manualSellingRate : previous.manualSellingRate,
    makingChargeType: previous.baseMetal === "ARTIFICIAL" ? initialState.makingChargeType : previous.makingChargeType,
    makingChargeValue: previous.baseMetal === "ARTIFICIAL" ? initialState.makingChargeValue : previous.makingChargeValue,
    hasStone: previous.baseMetal === "ARTIFICIAL" ? initialState.hasStone : previous.hasStone,
    stoneType: previous.baseMetal === "ARTIFICIAL" ? initialState.stoneType : previous.stoneType,
    stoneCarat: previous.baseMetal === "ARTIFICIAL" ? initialState.stoneCarat : previous.stoneCarat,
    stoneCostType: previous.baseMetal === "ARTIFICIAL" ? initialState.stoneCostType : previous.stoneCostType,
    stoneCostValue: previous.baseMetal === "ARTIFICIAL" ? initialState.stoneCostValue : previous.stoneCostValue,
    huidCharge: previous.baseMetal === "ARTIFICIAL" ? initialState.huidCharge : previous.huidCharge,
    gstPercentage: previous.baseMetal === "ARTIFICIAL" ? initialState.gstPercentage : previous.gstPercentage || initialState.gstPercentage
  };
}

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

function normalizeCsvSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}

function normalizeCsvCategorySlug(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === "pendant" || normalized === "pendants" || normalized === "chain" || normalized === "chains") {
    return "necklaces";
  }
  return normalized;
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
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [sortBy, setSortBy] = useState<
    "NEWEST" | "OLDEST" | "NAME_ASC" | "NAME_DESC" | "PRICE_HIGH" | "PRICE_LOW" | "STOCK_HIGH" | "STOCK_LOW"
  >("NEWEST");
  const [page, setPage] = useState(1);
  const [state, setState] = useState<ProductFormState>({
    ...initialState,
    categoryId: categories[0]?.id || ""
  });
  const [busy, setBusy] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [buildStep, setBuildStep] = useState<"TYPE" | "FORM">("TYPE");
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [primaryImageFile, setPrimaryImageFile] = useState<File | null>(null);
  const [secondaryImageFiles, setSecondaryImageFiles] = useState<File[]>([]);
  const [isRateSyncing, setIsRateSyncing] = useState(false);
  const [isMrpManuallyEdited, setIsMrpManuallyEdited] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [togglingProductId, setTogglingProductId] = useState<string | null>(null);

  const bulkCsvInputRef = useRef<HTMLInputElement | null>(null);
  const secondaryImagesInputRef = useRef<HTMLInputElement | null>(null);
  const { alert, confirm } = useBrandDialog();
  const isArtificialProduct = state.baseMetal === "ARTIFICIAL";
  const metalColorOptions = useMemo(() => METAL_COLOR_OPTIONS[state.baseMetal], [state.baseMetal]);
  const purityOptions = useMemo(() => PURITY_OPTIONS[state.baseMetal], [state.baseMetal]);
  const selectedRate = useMemo(() => {
    if (isArtificialProduct) return 0;
    if (state.useManualSellingRate && state.manualSellingRate > 0) return state.manualSellingRate;
    return state.baseMetal === "GOLD" ? state.activeGoldRate ?? 0 : state.activeSilverRate ?? 0;
  }, [isArtificialProduct, state.activeGoldRate, state.activeSilverRate, state.baseMetal, state.manualSellingRate, state.useManualSellingRate]);

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
  const offerPriceNumber = Number(state.offerPrice);
  const compareAtPriceNumber = Number(state.compareAtPrice);
  const hasOfferPrice = state.offerPrice.trim() !== "" && Number.isFinite(offerPriceNumber) && offerPriceNumber > 0;
  const hasCompareAt = state.compareAtPrice.trim() !== "" && Number.isFinite(compareAtPriceNumber) && compareAtPriceNumber > 0;
  const formulaPrice = isArtificialProduct ? (hasCompareAt ? compareAtPriceNumber : 0) : preview.finalPrice;
  const previewSellingPrice = hasOfferPrice ? offerPriceNumber : formulaPrice;
  const previewDiscountPct =
    hasCompareAt && compareAtPriceNumber > previewSellingPrice
      ? Math.round(((compareAtPriceNumber - previewSellingPrice) / compareAtPriceNumber) * 100)
      : 0;
  const artificialGstAmount = hasOfferPrice ? Number((previewSellingPrice - previewSellingPrice / 1.18).toFixed(2)) : 0;
  const artificialNetPrice = hasOfferPrice ? Number((previewSellingPrice / 1.18).toFixed(2)) : 0;

  useEffect(() => {
    if (isMrpManuallyEdited || isArtificialProduct) return;
    const suggestedMrp = formulaPrice > 0 ? formulaPrice.toFixed(2) : "";
    setState((prev) => (prev.compareAtPrice === suggestedMrp ? prev : { ...prev, compareAtPrice: suggestedMrp }));
  }, [formulaPrice, isArtificialProduct, isMrpManuallyEdited]);

  const categoryLabelById = useMemo(() => new Map(categories.map((cat) => [cat.id, cat.name])), [categories]);

  const filteredProducts = useMemo(() => {
    let next = [...products];

    if (listingMode === "SIGNATURE") {
      next = next.filter((product) => product.isSignature);
    } else if (listingMode === "NORMAL") {
      next = next.filter((product) => !product.isSignature);
    }

    if (categoryFilter !== "ALL") {
      next = next.filter((product) => product.categoryId === categoryFilter);
    }

    if (statusFilter === "ACTIVE") {
      next = next.filter((product) => product.isActive);
    } else if (statusFilter === "INACTIVE") {
      next = next.filter((product) => !product.isActive);
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (normalizedSearch) {
      next = next.filter((product) => {
        const categoryName = String(categoryLabelById.get(product.categoryId) || "").toLowerCase();
        return (
          product.name.toLowerCase().includes(normalizedSearch) ||
          product.slug.toLowerCase().includes(normalizedSearch) ||
          product.sku.toLowerCase().includes(normalizedSearch) ||
          categoryName.includes(normalizedSearch)
        );
      });
    }

    switch (sortBy) {
      case "OLDEST":
        next = [...next].reverse();
        break;
      case "NAME_ASC":
        next = [...next].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "NAME_DESC":
        next = [...next].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "PRICE_HIGH":
        next = [...next].sort((a, b) => b.finalPrice - a.finalPrice);
        break;
      case "PRICE_LOW":
        next = [...next].sort((a, b) => a.finalPrice - b.finalPrice);
        break;
      case "STOCK_HIGH":
        next = [...next].sort((a, b) => b.stock - a.stock);
        break;
      case "STOCK_LOW":
        next = [...next].sort((a, b) => a.stock - b.stock);
        break;
      default:
        break;
    }

    return next;
  }, [products, listingMode, categoryFilter, statusFilter, searchTerm, sortBy, categoryLabelById]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [listingMode, products, categoryFilter, statusFilter, searchTerm, sortBy]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pageProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page]);

  const onField = <K extends keyof ProductFormState>(field: K, value: ProductFormState[K]) => {
    setState((prev) => ({ ...prev, [field]: value }));
  };

  const onSecondaryImagesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files || []);
    if (!incoming.length) return;

    setSecondaryImageFiles((prev) => {
      const next = [...prev];
      const seen = new Set(prev.map((file) => `${file.name}-${file.size}-${file.lastModified}`));

      for (const file of incoming) {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        if (seen.has(key)) continue;
        seen.add(key);
        next.push(file);
      }

      return next;
    });

    // Allow selecting the same file again if it was removed later.
    event.target.value = "";
  };

  const removeSecondaryImage = (fileIndex: number) => {
    setSecondaryImageFiles((prev) => prev.filter((_, index) => index !== fileIndex));
  };

  const triggerSecondaryImagesPicker = () => {
    secondaryImagesInputRef.current?.click();
  };

  const setSignatureMode = (nextIsSignature: boolean) => {
    setState((prev) => {
      const baseSlug = prev.slug.replace(/^signature-/, "");
      return {
        ...prev,
        isSignature: nextIsSignature,
        slug: nextIsSignature ? (baseSlug ? `signature-${baseSlug}` : prev.slug) : baseSlug
      };
    });
  };

  useEffect(() => {
    let isMounted = true;

    const syncRates = async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!silent) setIsRateSyncing(true);
      try {
        const response = await fetch("/api/admin/pricing/rates", { method: "GET", cache: "no-store" });
        const payload = (await response.json()) as AdminPricingRatesResponse;
        if (!response.ok || !payload.success) return;

        const gold = payload.rates.find((entry) => entry.id === "gold");
        const silver = payload.rates.find((entry) => entry.id === "silver");
        if (!isMounted || !gold || !silver) return;

        setState((prev) => ({
          ...prev,
          activeGoldRate:
            prev.baseMetal === "ARTIFICIAL"
              ? prev.activeGoldRate
              : Number(gold.sellingRate) > 0
                ? Number(gold.sellingRate)
                : prev.activeGoldRate,
          activeSilverRate:
            prev.baseMetal === "ARTIFICIAL"
              ? prev.activeSilverRate
              : Number(silver.sellingRate) > 0
                ? Number(silver.sellingRate)
                : prev.activeSilverRate
        }));
      } finally {
        if (!silent && isMounted) setIsRateSyncing(false);
      }
    };

    void syncRates({ silent: true });
    const intervalId = setInterval(() => void syncRates({ silent: true }), 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const resetBuilder = () => {
    setBuildStep("TYPE");
    setState({ ...initialState, categoryId: categories[0]?.id || "" });
    setEditorMode("create");
    setEditingProductId(null);
    setPrimaryImageFile(null);
    setSecondaryImageFiles([]);
    setIsMrpManuallyEdited(false);
  };

  const showProductError = useCallback(
    async (message: string, title = "Unable to List Product") => {
      await alert({
        title,
        message,
        confirmLabel: "Understood",
        tone: "danger"
      });
    },
    [alert]
  );

  const openCreateBuilder = () => {
    resetBuilder();
    setIsAddProductModalOpen(true);
  };

  const openEditBuilder = (product: ProductRow) => {
    setEditorMode("edit");
    setEditingProductId(product.id);
    setBuildStep("FORM");
    setState({
      name: product.name,
      slug: product.slug,
      description: product.description,
      sku: product.sku,
      categoryId: product.categoryId,
      stock: product.stock,
      compareAtPrice: product.compareAtPrice ? String(product.compareAtPrice) : "",
      offerPrice: String(product.offerPrice),
      certification: product.certification,
      baseMetal: product.baseMetal,
      metalColor: product.metalColor,
      purity: product.purity,
      purityFactor: product.purityFactor,
      weightGrams: product.weightGrams,
      activeGoldRate: product.baseMetal === "ARTIFICIAL" ? null : product.activeGoldRate ?? initialState.activeGoldRate,
      activeSilverRate: product.baseMetal === "ARTIFICIAL" ? null : product.activeSilverRate ?? initialState.activeSilverRate,
      useManualSellingRate: product.useManualSellingRate,
      manualSellingRate: product.manualSellingRate ?? 0,
      makingChargeType: product.makingChargeType,
      makingChargeValue: product.makingChargeValue,
      hasStone: product.hasStone,
      stoneType: product.stoneType,
      stoneCarat: product.stoneCarat ?? 0,
      stoneCostType: product.stoneCostType,
      stoneCostValue: product.stoneCostValue,
      huidCharge: product.huidCharge,
      gstPercentage: product.gstPercentage,
      isSignature: product.isSignature
    });
    setPrimaryImageFile(null);
    setSecondaryImageFiles([]);
    setIsMrpManuallyEdited(Boolean(product.compareAtPrice));
    setIsAddProductModalOpen(true);
  };

  const deleteProduct = async (product: ProductRow) => {
    if (!canEditProducts) return;

    const shouldDelete = await confirm({
      title: "Delete Product",
      message: `Delete "${product.name}" from catalog? This action cannot be undone.`,
      confirmLabel: "Delete Product",
      cancelLabel: "Keep Product",
      tone: "danger"
    });

    if (!shouldDelete) return;

    setDeletingProductId(product.id);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE"
      });
      const payload = (await response.json()) as { success: boolean; message?: string };

      if (!response.ok || !payload.success) {
        await showProductError(payload.message || "Unable to delete product.", "Unable to Delete Product");
        return;
      }

      setProducts((prev) => prev.filter((entry) => entry.id !== product.id));
      if (editingProductId === product.id) {
        setIsAddProductModalOpen(false);
        resetBuilder();
      }
      setNotice(payload.message || "Product deleted.");
    } catch {
      await showProductError("Unable to delete product right now. Please try again.", "Delete Failed");
    } finally {
      setDeletingProductId(null);
    }
  };

  const toggleProductStatus = async (product: ProductRow) => {
    if (!canEditProducts) return;
    setTogglingProductId(product.id);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive })
      });
      const payload = (await response.json()) as {
        success: boolean;
        message?: string;
        product?: { id: string; isActive: boolean };
      };

      if (!response.ok || !payload.success || !payload.product) {
        await showProductError(payload.message || "Unable to update product status.", "Status Update Failed");
        return;
      }

      setProducts((prev) =>
        prev.map((entry) =>
          entry.id === payload.product?.id ? { ...entry, isActive: payload.product.isActive } : entry
        )
      );
      setNotice(payload.message || `Product marked as ${payload.product.isActive ? "active" : "inactive"}.`);
    } catch {
      await showProductError("Unable to update product status right now. Please try again.", "Status Update Failed");
    } finally {
      setTogglingProductId(null);
    }
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

  const saveProduct = async () => {
    if (!canEditProducts) return;

    setBusy(true);
    setNotice(null);

    try {
      if (!state.offerPrice || Number(state.offerPrice) <= 0) {
        await showProductError("Offer price is required and must be greater than 0.", "Product Listing Incomplete");
        return;
      }
      if (!state.compareAtPrice || Number(state.compareAtPrice) <= 0) {
        await showProductError("MRP must be set and greater than 0.", "Product Listing Incomplete");
        return;
      }
      if (Number(state.offerPrice) > Number(state.compareAtPrice)) {
        await showProductError("Offer price cannot be greater than MRP.", "Invalid Pricing Condition");
        return;
      }

      const payload = {
        ...state,
        offerPrice: state.offerPrice ? Number(state.offerPrice) : null,
        compareAtPrice: state.compareAtPrice ? Number(state.compareAtPrice) : null
      };
      const isEditing = editorMode === "edit" && Boolean(editingProductId);
      const endpoint = isEditing ? `/api/admin/products/${editingProductId}` : "/api/admin/products";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        await showProductError(
          data?.message || `Unable to ${isEditing ? "update" : "create"} product.`,
          isEditing ? "Unable to Update Product" : "Unable to Create Product"
        );
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

      const nextRow: ProductRow = {
        id: created.id,
        name: created.name,
        slug: created.slug,
        description: state.description,
        sku: created.sku,
        categoryId: state.categoryId,
        stock: created.stock,
        compareAtPrice: state.compareAtPrice ? Number(state.compareAtPrice) : null,
        offerPrice: Number(created.price),
        certification: state.certification,
        baseMetal: state.baseMetal,
        metalColor: state.metalColor,
        purity: state.purity,
        purityFactor: state.purityFactor,
        weightGrams: state.weightGrams,
        activeGoldRate: state.baseMetal === "GOLD" ? state.activeGoldRate : null,
        activeSilverRate: state.baseMetal === "SILVER" ? state.activeSilverRate : null,
        useManualSellingRate: state.useManualSellingRate,
        manualSellingRate: state.useManualSellingRate ? state.manualSellingRate : null,
        makingChargeType: state.makingChargeType,
        makingChargeValue: state.makingChargeValue,
        hasStone: state.hasStone,
        stoneType: state.stoneType,
        stoneCarat: state.hasStone ? state.stoneCarat : null,
        stoneCostType: state.stoneCostType,
        stoneCostValue: state.stoneCostValue,
        huidCharge: state.huidCharge,
        gstPercentage: state.gstPercentage,
        finalPrice: Number(created.price),
        isActive: true,
        isSignature: Boolean(created.isSignature)
      };

      setProducts((prev) =>
        isEditing
          ? prev.map((item) => (item.id === nextRow.id ? nextRow : item))
          : [nextRow, ...prev]
      );

      setNotice(`Product ${isEditing ? "updated" : "created"} successfully${primaryImageFile || secondaryImageFiles.length ? " with images." : "."}`);
      setIsAddProductModalOpen(false);
      resetBuilder();
    } catch (createError) {
      await showProductError(
        createError instanceof Error ? createError.message : "Unable to save product.",
        editorMode === "edit" ? "Product Update Failed" : "Product Listing Failed"
      );
    } finally {
      setBusy(false);
    }
  };

  const downloadCsvTemplate = () => {
    const csvRows = CSV_SAMPLE_ROWS.map((row) =>
      row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    const csv = `${CSV_HEADERS.join(",")}\n${csvRows}\n`;
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
    if (value === "SILVER") return "SILVER";
    if (value === "ARTIFICIAL") return "ARTIFICIAL";
    return "GOLD";
  };

  const normalizePurity = (value: string): ProductRow["purity"] => {
    const normalized = value.toUpperCase();
    if (normalized === "NOT_APPLICABLE") return "NOT_APPLICABLE";
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

    try {
      const text = await file.text();
      const parsed = csvToRecords(text);
      if (parsed.error) {
        await showProductError(parsed.error, "CSV Format Error");
        return;
      }
      if (!parsed.rows.length) {
        await showProductError("CSV has no product rows.", "CSV Upload Failed");
        return;
      }

      const categoryBySlug = new Map(categories.map((cat) => [cat.slug.trim().toLowerCase(), cat.id]));
      let createdCount = 0;
      let failedCount = 0;
      const failedReasons: string[] = [];

      for (const [index, row] of parsed.rows.entries()) {
        const rowNumber = index + 2;
        const name = String(row.name || "").trim();
        const slug = normalizeCsvSlug(row.slug || name);
        const description = String(row.description || "").trim() || `${name} premium catalog product.`;
        const skuBase = String(row.sku || "").trim().toUpperCase();
        const sku = skuBase || `SKU-${String(rowNumber).padStart(3, "0")}-${slug.slice(0, 12).toUpperCase().replace(/[^A-Z0-9]/g, "")}`;
        const normalizedCategorySlug = normalizeCsvCategorySlug(row.categorySlug || "");
        const categoryId = categoryBySlug.get(normalizedCategorySlug);

        if (!name || !slug || !sku) {
          failedCount += 1;
          failedReasons.push(`Row ${rowNumber}: missing name/slug/sku.`);
          continue;
        }

        if (!categoryId) {
          failedCount += 1;
          failedReasons.push(`Row ${rowNumber}: unknown categorySlug "${row.categorySlug}".`);
          continue;
        }

        const baseMetal = normalizeBaseMetal((row.baseMetal || "GOLD").toUpperCase());
        const isArtificialRow = baseMetal === "ARTIFICIAL";
        const defaultMetalColor = METAL_COLOR_OPTIONS[baseMetal][0].value;
        const defaultPurity = PURITY_OPTIONS[baseMetal][0].value;

        const payload = {
          name,
          slug,
          description,
          sku,
          categoryId,
          stock: toNumberOr(row.stock, 0),
          compareAtPrice: row.compareAtPrice ? toNumberOr(row.compareAtPrice, 0) : null,
          offerPrice: row.offerPrice ? toNumberOr(row.offerPrice, 0) : null,
          certification: row.certification || "In-house Certified",
          baseMetal,
          metalColor: isArtificialRow ? "NOT_APPLICABLE" : ((row.metalColor || defaultMetalColor).toUpperCase() as ProductRow["metalColor"]),
          purity: isArtificialRow ? "NOT_APPLICABLE" : normalizePurity((row.purity || defaultPurity).toUpperCase()),
          purityFactor: isArtificialRow
            ? PURITY_FACTOR_MAP.NOT_APPLICABLE
            : PURITY_FACTOR_MAP[normalizePurity((row.purity || defaultPurity).toUpperCase())],
          weightGrams: isArtificialRow ? 0 : toNumberOr(row.weightGrams, 1),
          activeGoldRate: isArtificialRow ? null : toNumberOr(row.activeGoldRate, 9500),
          activeSilverRate: isArtificialRow ? null : toNumberOr(row.activeSilverRate, 105),
          useManualSellingRate: isArtificialRow ? false : normalizeBool(row.useManualSellingRate || "false"),
          manualSellingRate: isArtificialRow ? 0 : toNumberOr(row.manualSellingRate, 0),
          makingChargeType: isArtificialRow ? "FIXED" : ((row.makingChargeType || "PER_GRAM").toUpperCase() as ProductFormState["makingChargeType"]),
          makingChargeValue: isArtificialRow ? 0 : toNumberOr(row.makingChargeValue, 0),
          hasStone: isArtificialRow ? false : normalizeBool(row.hasStone || "false"),
          stoneType: isArtificialRow ? "" : row.stoneType || "",
          stoneCarat: isArtificialRow ? 0 : toNumberOr(row.stoneCarat, 0),
          stoneCostType: isArtificialRow ? "FIXED" : ((row.stoneCostType || "FIXED").toUpperCase() as ProductFormState["stoneCostType"]),
          stoneCostValue: isArtificialRow ? 0 : toNumberOr(row.stoneCostValue, 0),
          huidCharge: isArtificialRow ? 0 : toNumberOr(row.huidCharge, 55),
          gstPercentage: isArtificialRow ? ARTIFICIAL_GST_PERCENTAGE : toNumberOr(row.gstPercentage, 3),
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
          failedReasons.push(`Row ${rowNumber}: ${result?.message || "API rejected row."}`);
          continue;
        }

        const created = result.product;
        setProducts((prev) => [
          {
            id: created.id,
            name: created.name,
            slug: created.slug,
            description: payload.description,
            sku: created.sku,
            categoryId: payload.categoryId,
            stock: created.stock,
            compareAtPrice: payload.compareAtPrice,
            offerPrice: Number(created.price),
            certification: payload.certification,
            baseMetal: normalizeBaseMetal(String(payload.baseMetal)),
            metalColor: String(payload.metalColor) as ProductRow["metalColor"],
            purity: normalizePurity(String(payload.purity)),
            purityFactor: Number(payload.purityFactor),
            weightGrams: payload.weightGrams,
            activeGoldRate: payload.baseMetal === "GOLD" ? payload.activeGoldRate : null,
            activeSilverRate: payload.baseMetal === "SILVER" ? payload.activeSilverRate : null,
            useManualSellingRate: payload.useManualSellingRate,
            manualSellingRate: payload.useManualSellingRate ? payload.manualSellingRate : null,
            makingChargeType: String(payload.makingChargeType) as ProductRow["makingChargeType"],
            makingChargeValue: Number(payload.makingChargeValue),
            hasStone: payload.hasStone,
            stoneType: payload.stoneType,
            stoneCarat: payload.hasStone ? payload.stoneCarat : null,
            stoneCostType: String(payload.stoneCostType) as ProductRow["stoneCostType"],
            stoneCostValue: Number(payload.stoneCostValue),
            huidCharge: Number(payload.huidCharge),
            gstPercentage: Number(payload.gstPercentage),
            finalPrice: Number(created.price),
            isActive: true,
            isSignature: Boolean(created.isSignature)
          },
          ...prev
        ]);
        createdCount += 1;
      }

      const reasonPreview =
        failedReasons.length > 0
          ? ` First issues: ${failedReasons.slice(0, 3).join(" | ")}${failedReasons.length > 3 ? " ..." : ""}`
          : "";
      setNotice(`Bulk upload completed. Created: ${createdCount}. Failed: ${failedCount}.${reasonPreview}`);
    } catch (bulkError) {
      await showProductError(
        bulkError instanceof Error ? bulkError.message : "Bulk upload failed.",
        "Bulk Upload Failed"
      );
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
              onClick={openCreateBuilder}
              className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              Add New Product
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.14em] text-stone-500">
            Showing {filteredProducts.length}{" "}
            {listingMode === "ALL" ? "products" : listingMode === "SIGNATURE" ? "signature pieces" : "normal products"}
          </p>
          <p className="text-xs text-stone-500">Click any row to open pre-filled product editor.</p>
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

        <div className="mt-3 grid gap-3 rounded-2xl border border-stone-200 bg-white/70 p-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="sm:col-span-2 lg:col-span-2">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">Search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Name, SKU, slug, category"
              className="h-10 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-700 outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
            />
          </label>

          <label>
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">Category</span>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="h-10 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-700 outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
            >
              <option value="ALL">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">Status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "ALL" | "ACTIVE" | "INACTIVE")}
              className="h-10 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-700 outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </label>

          <label>
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">Sort By</span>
            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target.value as
                    | "NEWEST"
                    | "OLDEST"
                    | "NAME_ASC"
                    | "NAME_DESC"
                    | "PRICE_HIGH"
                    | "PRICE_LOW"
                    | "STOCK_HIGH"
                    | "STOCK_LOW"
                )
              }
              className="h-10 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-700 outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-stone-200"
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="NAME_ASC">Name A-Z</option>
              <option value="NAME_DESC">Name Z-A</option>
              <option value="PRICE_HIGH">Price High-Low</option>
              <option value="PRICE_LOW">Price Low-High</option>
              <option value="STOCK_HIGH">Stock High-Low</option>
              <option value="STOCK_LOW">Stock Low-High</option>
            </select>
          </label>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-[#d8c7a3]/55 bg-gradient-to-b from-[#fdfbf6] to-[#f6f1e8] shadow-[0_10px_30px_rgba(111,89,47,0.08)]">
          <table className="min-w-[760px] text-left text-sm">
            <thead className="border-b border-[#d8c7a3]/50 bg-gradient-to-r from-[#f6ede0] via-[#f4ecd9] to-[#f8f2e8]">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700">Name</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700">SKU</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700">Metal</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700">Purity</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700">Weight</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700">Final Price</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700">Stock</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-stone-700">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.16em] text-stone-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ddcfb2]/55">
              {pageProducts.map((product) => (
                <tr
                  key={product.id}
                  className="group cursor-pointer bg-white/50 transition hover:bg-[#fff8eb]"
                  onClick={() => openEditBuilder(product)}
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="font-medium text-stone-900 group-hover:text-[#7a5b1f]">{product.name}</p>
                      {product.isSignature ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#d4b46a]/60 bg-[#122b7a]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#122b7a]">
                          <Crown className="h-3 w-3 text-[#c79d4a]" />
                          Signature
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-stone-500">/{product.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-stone-700">{product.sku}</td>
                  <td className="px-4 py-3 text-stone-700">{BASE_METAL_LABELS[product.baseMetal]}</td>
                  <td className="px-4 py-3 text-stone-700">{getAdminPurityLabel(product.baseMetal, product.purity)}</td>
                  <td className="px-4 py-3 text-stone-700">{getAdminWeightLabel(product.baseMetal, product.weightGrams)}</td>
                  <td className="px-4 py-3 font-semibold text-[#2b1b09]">{formatCurrency(product.finalPrice)}</td>
                  <td className="px-4 py-3 text-stone-700">{product.stock}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        void toggleProductStatus(product);
                      }}
                      disabled={!canEditProducts || togglingProductId === product.id}
                      aria-label={product.isActive ? "Deactivate product" : "Activate product"}
                      className={`relative inline-flex h-7 w-[66px] items-center rounded-full border px-1 transition ${
                        product.isActive
                          ? "border-emerald-300 bg-emerald-100"
                          : "border-rose-300 bg-rose-100"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <span
                        className={`inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition-transform ${
                          product.isActive ? "translate-x-[36px]" : "translate-x-0"
                        }`}
                      >
                        {togglingProductId === product.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-stone-600" />
                        ) : (
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              product.isActive ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                        )}
                      </span>
                    </button>
                    <span
                      className={`ml-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        product.isActive
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border border-rose-200 bg-rose-50 text-rose-700"
                      }`}
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEditBuilder(product);
                        }}
                        disabled={!canEditProducts}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#d8b16b]/50 bg-gradient-to-r from-[#122b7a] to-[#0f235f] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#f3d38a] shadow-[0_8px_18px_rgba(11,30,94,0.22)] transition hover:from-[#15348e] hover:to-[#12306f] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <PencilLine className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void deleteProduct(product);
                        }}
                        disabled={!canEditProducts || deletingProductId === product.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/45 bg-gradient-to-r from-rose-700 to-rose-600 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_8px_18px_rgba(127,29,29,0.24)] transition hover:from-rose-800 hover:to-rose-700 disabled:cursor-not-allowed disabled:opacity-55"
                      >
                        {deletingProductId === product.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pageProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-sm text-stone-500">
                    No products found for this listing view.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <AdminPagination
          page={page}
          totalPages={totalPages}
          totalItems={filteredProducts.length}
          pageSize={PAGE_SIZE}
          currentCount={pageProducts.length}
          onPageChange={setPage}
          itemLabel={listingMode === "SIGNATURE" ? "signature pieces" : listingMode === "NORMAL" ? "products" : "products"}
        />
      </section>

      {isAddProductModalOpen ? (
        <ModalShell
          title={editorMode === "edit" ? "Edit Product Pricing Builder" : "New Product Pricing Builder"}
          subtitle={
            editorMode === "edit"
              ? "Update product details and pricing components with a pre-filled editor."
              : "Add a normal or signature piece product with full pricing components and image assets."
          }
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
                    onClick={() => setSignatureMode(false)}
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
                    onClick={() => setSignatureMode(true)}
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
                      onClick={() => setSignatureMode(false)}
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
                      onClick={() => setSignatureMode(true)}
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
                        ref={secondaryImagesInputRef}
                        type="file"
                        multiple
                        accept="image/png,image/jpeg,image/webp,image/avif"
                        onChange={onSecondaryImagesSelected}
                        className="h-11 w-full rounded-xl border border-black/15 px-3 py-2 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-stone-900 file:px-3 file:py-1 file:text-xs file:text-white"
                      />
                      <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
                        <p>
                          {secondaryImageFiles.length ? `${secondaryImageFiles.length} secondary images selected.` : "No secondary images selected."}
                        </p>
                        {secondaryImageFiles.length ? (
                          <button
                            type="button"
                            onClick={() => setSecondaryImageFiles([])}
                            className="rounded-full border border-stone-300 px-2.5 py-1 text-[11px] font-medium text-stone-700 hover:bg-stone-100"
                          >
                            Clear all
                          </button>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={triggerSecondaryImagesPicker}
                          className="rounded-full border border-[#1a2e7a]/20 bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1a2e7a] hover:bg-[#f5f7ff]"
                        >
                          {secondaryImageFiles.length ? "Add More Images" : "Select Images"}
                        </button>
                      </div>
                      {secondaryImageFiles.length ? (
                        <div className="max-h-24 space-y-1 overflow-y-auto rounded-lg border border-black/10 bg-white/70 p-2">
                          {secondaryImageFiles.map((file, fileIndex) => (
                            <div key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center justify-between gap-2">
                              <p className="truncate text-xs text-stone-600">{file.name}</p>
                              <button
                                type="button"
                                onClick={() => removeSecondaryImage(fileIndex)}
                                className="rounded-full border border-rose-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-rose-700 hover:bg-rose-50"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </label>
                  </div>
                  <p className="mt-2 text-xs text-stone-500">
                    For bulk upload: keep image URLs in CSV fields `primaryImageUrl` and `secondaryImageUrls` (use `|` between secondary URLs).
                  </p>
                  <p className="mt-1 text-xs text-stone-500">
                    The CSV template includes both a jewelry sample row and an `Artificial` sample row for the simplified fixed-price flow.
                  </p>
                </div>

                <div className="grid gap-3 border-t border-black/10 pt-4 md:grid-cols-2">
                  <CustomSelect
                    value={state.baseMetal}
                    onValueChange={(value) =>
                      setState((prev) => buildStateForBaseMetal(value as ProductFormState["baseMetal"], prev))
                    }
                    options={[
                      { value: "GOLD", label: "Gold" },
                      { value: "SILVER", label: "Silver" },
                      { value: "ARTIFICIAL", label: "Artificial" }
                    ]}
                    buttonClassName="h-11 w-full rounded-xl border border-black/15 px-3 text-sm"
                    menuClassName="w-full"
                  />
                  {isArtificialProduct ? (
                    <div className="md:col-span-2 rounded-2xl border border-[#d9c79a]/70 bg-gradient-to-r from-[#fdf8eb] to-white p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8f6b3f]">Artificial Product Mode</p>
                          <p className="text-sm text-stone-700">
                            Simplified fixed-price listing. GST is locked to 18% and jewelry calculation fields are not required.
                          </p>
                        </div>
                        <span className="rounded-full border border-[#d7bb83] bg-[#f4ead6] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8b6736]">
                          GST Fixed at 18%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <CustomSelect
                        value={state.metalColor}
                        onValueChange={(value) => onField("metalColor", value as ProductFormState["metalColor"])}
                        options={metalColorOptions}
                        buttonClassName="h-11 w-full rounded-xl border border-black/15 px-3 text-sm"
                        menuClassName="w-full"
                      />
                      <CustomSelect
                        value={state.purity}
                        onValueChange={(value) => {
                          const nextPurity = value as ProductFormState["purity"];
                          onField("purity", nextPurity);
                          onField("purityFactor", PURITY_FACTOR_MAP[nextPurity]);
                        }}
                        options={purityOptions}
                        buttonClassName="h-11 w-full rounded-xl border border-black/15 px-3 text-sm"
                        menuClassName="w-full"
                      />
                      <label className="space-y-1.5">
                        <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Weight (grams)</span>
                        <input type="number" min={0} step="0.001" value={state.weightGrams} onChange={(e) => onField("weightGrams", Number(e.target.value))} className="h-11 w-full rounded-xl border border-black/15 px-3 text-sm" />
                      </label>
                      <label className="space-y-1.5">
                        <span className="text-xs uppercase tracking-[0.16em] text-stone-500">
                          {state.useManualSellingRate
                            ? `Manual ${state.baseMetal === "GOLD" ? "Gold" : "Silver"} Rate (₹/g)`
                            : `Active ${state.baseMetal === "GOLD" ? "Gold" : "Silver"} Rate (₹/g)`}
                        </span>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={state.useManualSellingRate ? state.manualSellingRate : state.baseMetal === "GOLD" ? state.activeGoldRate ?? 0 : state.activeSilverRate ?? 0}
                          onChange={(e) => {
                            if (!state.useManualSellingRate) return;
                            onField("manualSellingRate", Number(e.target.value));
                          }}
                          readOnly={!state.useManualSellingRate}
                          disabled={!state.useManualSellingRate}
                          className={`h-11 w-full rounded-xl border border-black/15 px-3 text-sm ${
                            state.useManualSellingRate ? "bg-white text-stone-900" : "bg-stone-100 text-stone-500"
                          }`}
                        />
                        <p className="text-xs text-stone-500">
                          {state.useManualSellingRate
                            ? "Manual rate is active for this product."
                            : isRateSyncing
                              ? "Syncing active rate from Pricing Updates panel..."
                              : "Rate is auto-fetched from Pricing Updates panel."}
                        </p>
                      </label>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={state.useManualSellingRate}
                        onClick={() =>
                          setState((prev) => {
                            const next = !prev.useManualSellingRate;
                            const fallbackRate = prev.baseMetal === "GOLD" ? prev.activeGoldRate ?? initialState.activeGoldRate ?? 0 : prev.activeSilverRate ?? initialState.activeSilverRate ?? 0;
                            return {
                              ...prev,
                              useManualSellingRate: next,
                              manualSellingRate: next && prev.manualSellingRate <= 0 ? fallbackRate : prev.manualSellingRate
                            };
                          })
                        }
                        className={`group flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all ${
                          state.useManualSellingRate
                            ? "border-[#c79d4a] bg-gradient-to-r from-[#122b7a] to-[#0c1f5d] text-[#f3d38a] shadow-[0_8px_24px_rgba(14,34,97,0.25)]"
                            : "border-stone-300 bg-white text-stone-700 hover:border-stone-400"
                        }`}
                      >
                        <span className="text-sm font-medium">Use Manual Selling Rate</span>
                        <span
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                            state.useManualSellingRate ? "bg-[#f3d38a]/35" : "bg-stone-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                              state.useManualSellingRate ? "translate-x-5" : "translate-x-1"
                            }`}
                          />
                        </span>
                      </button>
                    </>
                  )}
                </div>

                <div className="grid gap-3 border-t border-black/10 pt-4 md:grid-cols-2">
                  {isArtificialProduct ? (
                    <>
                      <div className="rounded-2xl border border-[#d9c79a]/70 bg-[#fdf8eb] px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Artificial Pricing</p>
                        <p className="mt-1 text-sm text-stone-700">
                          Only fixed MRP and offer price are required. No making, HUID, weight, or stone pricing is applied.
                        </p>
                      </div>
                      <label className="space-y-1.5">
                        <span className="text-xs uppercase tracking-[0.16em] text-stone-500">GST %</span>
                        <input value={ARTIFICIAL_GST_PERCENTAGE} readOnly className="h-11 w-full rounded-xl border border-black/15 bg-stone-100 px-3 text-sm text-stone-500" />
                      </label>
                    </>
                  ) : (
                    <>
                      <CustomSelect value={state.makingChargeType} onValueChange={(value) => onField("makingChargeType", value as ProductFormState["makingChargeType"])} options={[{ value: "PER_GRAM", label: "Making: Per Gram" }, { value: "FIXED", label: "Making: Fixed" }, { value: "PERCENTAGE", label: "Making: Percentage" }]} buttonClassName="h-11 w-full rounded-xl border border-black/15 px-3 text-sm" menuClassName="w-full" />
                      <label className="space-y-1.5">
                        <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Making Charge Value</span>
                        <input type="number" min={0} step="0.01" value={state.makingChargeValue} onChange={(e) => onField("makingChargeValue", Number(e.target.value))} className="h-11 w-full rounded-xl border border-black/15 px-3 text-sm" />
                      </label>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={state.hasStone}
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            hasStone: !prev.hasStone,
                            stoneType: !prev.hasStone ? prev.stoneType : "",
                            stoneCarat: !prev.hasStone ? prev.stoneCarat : 0,
                            stoneCostValue: !prev.hasStone ? prev.stoneCostValue : 0
                          }))
                        }
                        className={`group flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all ${
                          state.hasStone
                            ? "border-[#c79d4a] bg-gradient-to-r from-[#122b7a] to-[#0c1f5d] text-[#f3d38a] shadow-[0_8px_24px_rgba(14,34,97,0.25)]"
                            : "border-stone-300 bg-white text-stone-700 hover:border-stone-400"
                        }`}
                      >
                        <span className="text-sm font-medium">This Piece Has Stone/Diamond Cost</span>
                        <span
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                            state.hasStone ? "bg-[#f3d38a]/35" : "bg-stone-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                              state.hasStone ? "translate-x-5" : "translate-x-1"
                            }`}
                          />
                        </span>
                      </button>
                      {state.hasStone ? (
                        <>
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
                        </>
                      ) : null}
                      <label className="space-y-1.5">
                        <span className="text-xs uppercase tracking-[0.16em] text-stone-500">HUID Charge</span>
                        <input type="number" min={0} step="0.01" value={state.huidCharge} onChange={(e) => onField("huidCharge", Number(e.target.value))} className="h-11 w-full rounded-xl border border-black/15 px-3 text-sm" />
                      </label>
                      <label className="space-y-1.5">
                        <span className="text-xs uppercase tracking-[0.16em] text-stone-500">GST %</span>
                        <input type="number" min={0} step="0.01" value={state.gstPercentage} onChange={(e) => onField("gstPercentage", Number(e.target.value))} className="h-11 w-full rounded-xl border border-black/15 px-3 text-sm" />
                      </label>
                    </>
                  )}
                  <label className="space-y-1.5">
                    <span className="text-xs uppercase tracking-[0.16em] text-stone-500">
                      {isArtificialProduct ? "MRP" : "MRP (Auto from Calculated, Editable)"}
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={state.compareAtPrice}
                      onChange={(e) => {
                        setIsMrpManuallyEdited(true);
                        onField("compareAtPrice", e.target.value);
                      }}
                      className="h-11 w-full rounded-xl border border-black/15 px-3 text-sm"
                    />
                    {!isArtificialProduct ? (
                      <div className="mt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setIsMrpManuallyEdited(false);
                            onField("compareAtPrice", formulaPrice > 0 ? formulaPrice.toFixed(2) : "");
                          }}
                          className="rounded-full border border-stone-300 bg-white px-3 py-1 text-[11px] font-medium text-stone-700 transition hover:bg-stone-50"
                        >
                          Use Calculated MRP
                        </button>
                      </div>
                    ) : null}
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-xs uppercase tracking-[0.16em] text-stone-500">Offer Price (Selling)</span>
                    <input
                      type="number"
                      min={0}
                      value={state.offerPrice}
                      onChange={(e) => onField("offerPrice", e.target.value)}
                      className="h-11 w-full rounded-xl border border-black/15 px-3 text-sm"
                    />
                    <p className="text-xs text-stone-500">
                      Required. This is the final selling price used for discount display.
                    </p>
                  </label>
                  <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-600">
                    Discount preview:{" "}
                    <span className="font-semibold text-stone-900">
                      {previewDiscountPct > 0 ? `${previewDiscountPct}% OFF` : "Add valid MRP + offer to calculate"}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-[#fbf8f2] p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-stone-500">
                    {isArtificialProduct ? "Artificial Price Preview" : "Final Price Preview"}
                  </p>
                  {isArtificialProduct ? (
                    <>
                      <div className="mt-3 grid gap-2 text-sm text-stone-700 sm:grid-cols-2">
                        <p className="font-semibold text-stone-900">MRP: {hasCompareAt ? formatCurrency(compareAtPriceNumber) : "--"}</p>
                        <p className="font-semibold text-stone-900">Offer Price: {hasOfferPrice ? formatCurrency(previewSellingPrice) : "--"}</p>
                        <p>Net Before GST: {hasOfferPrice ? formatCurrency(artificialNetPrice) : "--"}</p>
                        <p>GST (18%): {hasOfferPrice ? formatCurrency(artificialGstAmount) : "--"}</p>
                        <p className="font-semibold text-stone-900">Storefront Discount: {previewDiscountPct > 0 ? `${previewDiscountPct}% OFF` : "0%"}</p>
                      </div>
                      <p className="mt-2 text-xs text-stone-500">
                        Fixed-price artificial flow: manual MRP and offer price only. Jewelry calculations are not applied.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="mt-3 grid gap-2 text-sm text-stone-700 sm:grid-cols-2">
                        <p>Metal value: {formatCurrency(preview.metalPrice)}</p>
                        <p>Making charge: {formatCurrency(preview.makingCharge)}</p>
                        <p>Stone cost: {formatCurrency(preview.stoneCost)}</p>
                        <p>HUID: {formatCurrency(preview.huidCharge)}</p>
                        <p>Calculated Before GST: {formatCurrency(preview.subtotalBeforeGst)}</p>
                        <p>GST: {formatCurrency(preview.gstAmount)}</p>
                        <p className="font-semibold text-stone-900">Calculated Price (MRP Suggestion): {formatCurrency(formulaPrice)}</p>
                        <p className="font-semibold text-stone-900">MRP: {hasCompareAt ? formatCurrency(compareAtPriceNumber) : "--"}</p>
                        <p className="font-semibold text-stone-900">Selling Price: {formatCurrency(previewSellingPrice)}</p>
                        <p className="font-semibold text-stone-900">Main Page Discount: {previewDiscountPct > 0 ? `${previewDiscountPct}% OFF` : "0%"}</p>
                      </div>
                      <p className="mt-2 text-xs text-stone-500">
                        {"Flow: Calculated Price -> Editable MRP -> Manual Offer Price -> Discount % on storefront."}
                      </p>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap justify-between gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (editorMode === "edit") {
                        setIsAddProductModalOpen(false);
                        resetBuilder();
                        return;
                      }
                      setBuildStep("TYPE");
                    }}
                    className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700"
                  >
                    {editorMode === "edit" ? "Close" : "Back"}
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
                      onClick={() => void saveProduct()}
                      disabled={!canEditProducts || busy}
                      className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                    >
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      {editorMode === "edit" ? "Update Product" : "Create Product"}
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
