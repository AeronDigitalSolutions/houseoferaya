import type { Prisma } from "@prisma/client";
import { resolveImageUrlWithFallback } from "@/lib/image-url";
import { prisma } from "@/lib/prisma";
import { buildProductPricing, productPricingSelect, type ProductWithPricing } from "@/lib/product-pricing";
import { getStorefrontGemstone, getStorefrontWeight } from "@/lib/product-materials";
import { isSignatureProductSlug } from "@/lib/signature-piece";
import { testimonials as fallbackTestimonials } from "@/lib/data";
import type { Category, Product } from "@/lib/types";

export type HomepageHeroSectionConfig = {
  productId: string | null;
  badgeLabel: string;
  description: string;
};

export type HomepageNewArrivalsSectionConfig = {
  productIds: string[];
};

export type HomepageFeaturedCollectionsSectionConfig = {
  heading: string;
  description: string;
  categoryIds: string[];
};

export type HomepageBestsellerSectionConfig = {
  heading: string;
  description: string;
  ringsProductIds: string[];
  necklacesProductIds: string[];
  earringsProductIds: string[];
  braceletsProductIds: string[];
};

export type HomepageSignatureSectionConfig = {
  productIds: string[];
};

export type HomepageContentConfig = {
  hero: HomepageHeroSectionConfig;
  newArrivals: HomepageNewArrivalsSectionConfig;
  featuredCollections: HomepageFeaturedCollectionsSectionConfig;
  bestseller: HomepageBestsellerSectionConfig;
  signature: HomepageSignatureSectionConfig;
};

export type HomepageCatalogProductOption = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  isSignature: boolean;
  image: string;
  price: number;
};

export type HomepageCatalogCategoryOption = {
  id: string;
  name: string;
  slug: string;
  image: string;
};

export type HomepageTestimonialItem = {
  id: string;
  customerName: string;
  quote: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
};

export type HomepageSectionTileData = {
  heroProduct: HomepageCatalogProductOption | null;
  newArrivalProducts: Product[];
  featuredCollections: Category[];
  bestsellerTabs: Array<{
    key: "rings" | "necklaces" | "earrings" | "bracelets";
    label: string;
    categorySlug: string | null;
    products: Product[];
  }>;
  signatureProducts: Product[];
  testimonials: HomepageTestimonialItem[];
};

const DEFAULT_CONFIG: HomepageContentConfig = {
  hero: {
    productId: null,
    badgeLabel: "New Capsule",
    description: "Engineered curves with warm golden tonality."
  },
  newArrivals: {
    productIds: []
  },
  featuredCollections: {
    heading: "Featured Collections",
    description: "Curated categories selected to lead the storefront narrative.",
    categoryIds: []
  },
  bestseller: {
    heading: "Bestsellers",
    description: "Best-performing pieces grouped by signature buying intent.",
    ringsProductIds: [],
    necklacesProductIds: [],
    earringsProductIds: [],
    braceletsProductIds: []
  },
  signature: {
    productIds: []
  }
};

function isConfigEffectivelyUnconfigured(config: HomepageContentConfig) {
  return (
    !config.hero.productId &&
    config.newArrivals.productIds.length === 0 &&
    config.featuredCollections.categoryIds.length === 0 &&
    config.bestseller.ringsProductIds.length === 0 &&
    config.bestseller.necklacesProductIds.length === 0 &&
    config.bestseller.earringsProductIds.length === 0 &&
    config.bestseller.braceletsProductIds.length === 0 &&
    config.signature.productIds.length === 0
  );
}

function buildSeedConfig(
  products: HomepageCatalogProductOption[],
  categories: HomepageCatalogCategoryOption[]
): HomepageContentConfig {
  const byCategorySlug = (slug: string) =>
    products
      .filter((product) => product.categorySlug === slug)
      .slice(0, 4)
      .map((product) => product.id);

  return {
    hero: {
      productId: products[0]?.id ?? null,
      badgeLabel: DEFAULT_CONFIG.hero.badgeLabel,
      description: DEFAULT_CONFIG.hero.description
    },
    newArrivals: {
      productIds: products.slice(0, 6).map((product) => product.id)
    },
    featuredCollections: {
      heading: DEFAULT_CONFIG.featuredCollections.heading,
      description: DEFAULT_CONFIG.featuredCollections.description,
      categoryIds: categories.slice(0, 3).map((category) => category.id)
    },
    bestseller: {
      heading: DEFAULT_CONFIG.bestseller.heading,
      description: DEFAULT_CONFIG.bestseller.description,
      ringsProductIds: byCategorySlug("rings"),
      necklacesProductIds: byCategorySlug("necklaces"),
      earringsProductIds: byCategorySlug("earrings"),
      braceletsProductIds: byCategorySlug("bracelets")
    },
    signature: {
      productIds: products
        .filter((product) => product.isSignature)
        .slice(0, 4)
        .map((product) => product.id)
    }
  };
}

function hydrateConfigWithSeed(config: HomepageContentConfig, seed: HomepageContentConfig): HomepageContentConfig {
  return {
    hero: {
      productId: config.hero.productId || seed.hero.productId,
      badgeLabel: config.hero.badgeLabel,
      description: config.hero.description
    },
    newArrivals: {
      productIds: config.newArrivals.productIds.length > 0 ? config.newArrivals.productIds : seed.newArrivals.productIds
    },
    featuredCollections: {
      heading: config.featuredCollections.heading,
      description: config.featuredCollections.description,
      categoryIds:
        config.featuredCollections.categoryIds.length > 0
          ? config.featuredCollections.categoryIds
          : seed.featuredCollections.categoryIds
    },
    bestseller: {
      heading: config.bestseller.heading,
      description: config.bestseller.description,
      // Do not auto-seed bestseller products; admin should explicitly select them.
      ringsProductIds: config.bestseller.ringsProductIds,
      necklacesProductIds: config.bestseller.necklacesProductIds,
      earringsProductIds: config.bestseller.earringsProductIds,
      braceletsProductIds: config.bestseller.braceletsProductIds
    },
    signature: {
      productIds: config.signature.productIds.length > 0 ? config.signature.productIds : seed.signature.productIds
    }
  };
}

function sanitizeConfigAgainstCatalog(
  config: HomepageContentConfig,
  products: Array<{ id: string; slug: string; category?: { slug: string } | null }>,
  categories: Array<{ id: string }>
): HomepageContentConfig {
  const categoryIds = new Set(categories.map((category) => category.id));
  const productById = new Map(products.map((product) => [product.id, product]));

  const onlyExisting = (ids: string[], limit: number) =>
    uniqueStringArray(
      ids.filter((id) => productById.has(id)),
      limit
    );

  const onlyCategory = (ids: string[], categorySlug: "rings" | "necklaces" | "earrings" | "bracelets") =>
    uniqueStringArray(
      ids.filter((id) => productById.get(id)?.category?.slug === categorySlug),
      4
    );

  return {
    hero: {
      ...config.hero,
      productId: config.hero.productId && productById.has(config.hero.productId) ? config.hero.productId : null
    },
    newArrivals: {
      productIds: onlyExisting(config.newArrivals.productIds, 12)
    },
    featuredCollections: {
      ...config.featuredCollections,
      categoryIds: uniqueStringArray(
        config.featuredCollections.categoryIds.filter((id) => categoryIds.has(id)),
        3
      )
    },
    bestseller: {
      ...config.bestseller,
      ringsProductIds: onlyCategory(config.bestseller.ringsProductIds, "rings"),
      necklacesProductIds: onlyCategory(config.bestseller.necklacesProductIds, "necklaces"),
      earringsProductIds: onlyCategory(config.bestseller.earringsProductIds, "earrings"),
      braceletsProductIds: onlyCategory(config.bestseller.braceletsProductIds, "bracelets")
    },
    signature: {
      productIds: uniqueStringArray(
        config.signature.productIds.filter((id) => {
          const product = productById.get(id);
          return Boolean(product && isSignatureProductSlug(product.slug));
        }),
        4
      )
    }
  };
}

function clampString(value: unknown, fallback: string) {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function uniqueStringArray(value: unknown, limit: number) {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const entry of value) {
    const next = String(entry ?? "").trim();
    if (!next || seen.has(next)) continue;
    seen.add(next);
    result.push(next);
    if (result.length >= limit) break;
  }
  return result;
}

function parseHeroSection(value: Prisma.JsonValue | null | undefined): HomepageHeroSectionConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) return DEFAULT_CONFIG.hero;
  return {
    productId: String((value as Record<string, unknown>).productId ?? "").trim() || null,
    badgeLabel: clampString((value as Record<string, unknown>).badgeLabel, DEFAULT_CONFIG.hero.badgeLabel),
    description: clampString((value as Record<string, unknown>).description, DEFAULT_CONFIG.hero.description)
  };
}

function parseNewArrivalsSection(value: Prisma.JsonValue | null | undefined): HomepageNewArrivalsSectionConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) return DEFAULT_CONFIG.newArrivals;
  return {
    productIds: uniqueStringArray((value as Record<string, unknown>).productIds, 12)
  };
}

function parseFeaturedCollectionsSection(
  value: Prisma.JsonValue | null | undefined
): HomepageFeaturedCollectionsSectionConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) return DEFAULT_CONFIG.featuredCollections;
  return {
    heading: clampString((value as Record<string, unknown>).heading, DEFAULT_CONFIG.featuredCollections.heading),
    description: clampString(
      (value as Record<string, unknown>).description,
      DEFAULT_CONFIG.featuredCollections.description
    ),
    categoryIds: uniqueStringArray((value as Record<string, unknown>).categoryIds, 3)
  };
}

function parseBestsellerSection(value: Prisma.JsonValue | null | undefined): HomepageBestsellerSectionConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) return DEFAULT_CONFIG.bestseller;
  const record = value as Record<string, unknown>;
  return {
    heading: clampString(record.heading, DEFAULT_CONFIG.bestseller.heading),
    description: clampString(record.description, DEFAULT_CONFIG.bestseller.description),
    ringsProductIds: uniqueStringArray(record.ringsProductIds, 4),
    necklacesProductIds: uniqueStringArray(record.necklacesProductIds, 4),
    earringsProductIds: uniqueStringArray(record.earringsProductIds, 4),
    braceletsProductIds: uniqueStringArray(record.braceletsProductIds, 4)
  };
}

function parseSignatureSection(value: Prisma.JsonValue | null | undefined): HomepageSignatureSectionConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) return DEFAULT_CONFIG.signature;
  return {
    productIds: uniqueStringArray((value as Record<string, unknown>).productIds, 4)
  };
}

export function parseHomepageContentConfig(row: {
  heroSection: Prisma.JsonValue | null;
  newArrivalsSection: Prisma.JsonValue | null;
  featuredCollectionsSection: Prisma.JsonValue | null;
  bestsellerSection: Prisma.JsonValue | null;
  signatureSection: Prisma.JsonValue | null;
} | null): HomepageContentConfig {
  if (!row) return DEFAULT_CONFIG;
  return {
    hero: parseHeroSection(row.heroSection),
    newArrivals: parseNewArrivalsSection(row.newArrivalsSection),
    featuredCollections: parseFeaturedCollectionsSection(row.featuredCollectionsSection),
    bestseller: parseBestsellerSection(row.bestsellerSection),
    signature: parseSignatureSection(row.signatureSection)
  };
}

function ensureProductHrefSlug(slug: string) {
  return isSignatureProductSlug(slug) ? `/signature-pieces/${slug}` : `/products/${slug}`;
}

async function mapStorefrontProduct(
  product: ProductWithPricing & { category?: { name: string; slug: string } | null }
): Promise<Product> {
  const pricing = buildProductPricing(product);
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: pricing.finalPrice,
    compareAtPrice: pricing.compareAtPrice ?? undefined,
    sku: product.sku,
    stock: product.stock,
    metalType: product.metalType,
    gemstone: getStorefrontGemstone(product),
    weight: getStorefrontWeight(product),
    certification: product.certification || "In-house Certified",
    categoryId: product.categoryId,
    image: await resolveImageUrlWithFallback(product.images[0]?.url, null),
    isActive: product.isActive,
    isSignature: isSignatureProductSlug(product.slug),
    pricingBreakdown: {
      metalRate: pricing.metalRate,
      metalPrice: pricing.metalPrice,
      makingCharge: pricing.makingCharge,
      stoneCost: pricing.stoneCost,
      huidCharge: pricing.huidCharge,
      subtotalBeforeGst: pricing.subtotalBeforeGst,
      gstAmount: pricing.gstAmount,
      finalPrice: pricing.finalPrice
    }
  };
}

async function mapCategoryItem(category: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}): Promise<Category> {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || "",
    image: await resolveImageUrlWithFallback(category.image, null)
  };
}

function orderProductsByIds<T extends { id: string }>(items: T[], ids: string[]) {
  const map = new Map(items.map((item) => [item.id, item]));
  return ids.map((id) => map.get(id)).filter(Boolean) as T[];
}

export async function getHomepageAdminContentPayload() {
  const [contentRow, products, categories, testimonialRows] = await Promise.all([
    prisma.homepageContent.findFirst({
      where: { key: "main" },
      select: {
        heroSection: true,
        newArrivalsSection: true,
        featuredCollectionsSection: true,
        bestsellerSection: true,
        signatureSection: true
      }
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ createdAt: "desc" }],
      select: {
        ...productPricingSelect,
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ name: "asc" }],
      select: { id: true, name: true, slug: true, image: true, description: true }
    }),
    prisma.homepageTestimonial.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
    })
  ]);

  const productOptions = await Promise.all(
    products.map(async (product) => {
      const storefront = await mapStorefrontProduct(product);
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        categoryId: product.categoryId,
        categoryName: product.category?.name || "Uncategorized",
        categorySlug: product.category?.slug || "",
        isSignature: isSignatureProductSlug(product.slug),
        image: storefront.image,
        price: storefront.price
      } satisfies HomepageCatalogProductOption;
    })
  );

  const categoryOptions = await Promise.all(
    categories.map(async (category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      image: await resolveImageUrlWithFallback(category.image, null)
    }))
  );

  const parsedConfig = parseHomepageContentConfig(contentRow);
  const sanitizedParsedConfig = sanitizeConfigAgainstCatalog(parsedConfig, products, categories);
  const seedConfig = buildSeedConfig(productOptions, categoryOptions);
  const effectiveConfig = hydrateConfigWithSeed(sanitizedParsedConfig, seedConfig);

  if (!contentRow || isConfigEffectivelyUnconfigured(sanitizedParsedConfig)) {
    await prisma.homepageContent.upsert({
      where: { key: "main" },
      create: {
        key: "main",
        heroSection: effectiveConfig.hero as never,
        newArrivalsSection: effectiveConfig.newArrivals as never,
        featuredCollectionsSection: effectiveConfig.featuredCollections as never,
        bestsellerSection: effectiveConfig.bestseller as never,
        signatureSection: effectiveConfig.signature as never
      },
      update: {
        heroSection: effectiveConfig.hero as never,
        newArrivalsSection: effectiveConfig.newArrivals as never,
        featuredCollectionsSection: effectiveConfig.featuredCollections as never,
        bestsellerSection: effectiveConfig.bestseller as never,
        signatureSection: effectiveConfig.signature as never
      }
    });
  }

  if (testimonialRows.length === 0) {
    await prisma.homepageTestimonial.createMany({
      data: fallbackTestimonials.map((testimonial, index) => ({
        customerName: testimonial.name,
        quote: testimonial.quote,
        imageUrl: testimonial.image,
        sortOrder: index,
        isActive: true
      }))
    });
  }

  const testimonials = testimonialRows.length > 0
    ? testimonialRows
    : await prisma.homepageTestimonial.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
      });

  const testimonialItems = await Promise.all(
    testimonials.map(async (testimonial) => ({
      id: testimonial.id,
      customerName: testimonial.customerName,
      quote: testimonial.quote,
      imageUrl: await resolveImageUrlWithFallback(testimonial.imageUrl, "/assets/testimonial-1.jpg"),
      sortOrder: testimonial.sortOrder,
      isActive: testimonial.isActive
    }))
  );

  return {
    config: effectiveConfig,
    products: productOptions,
    categories: categoryOptions,
    testimonials: testimonialItems
  };
}

export async function getHomepageStorefrontData() {
  const [contentRow, products, categories, testimonialRows] = await Promise.all([
    prisma.homepageContent.findFirst({
      where: { key: "main" },
      select: {
        heroSection: true,
        newArrivalsSection: true,
        featuredCollectionsSection: true,
        bestsellerSection: true,
        signatureSection: true
      }
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ createdAt: "desc" }],
      select: {
        ...productPricingSelect,
        category: { select: { name: true, slug: true } }
      }
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ createdAt: "asc" }],
      select: { id: true, name: true, slug: true, description: true, image: true }
    }),
    prisma.homepageTestimonial.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
    })
  ]);

  const productOptionsSeed = await Promise.all(
    products.map(async (product) => {
      const storefront = await mapStorefrontProduct(product);
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        categoryId: product.categoryId,
        categoryName: product.category?.name || "Uncategorized",
        categorySlug: product.category?.slug || "",
        isSignature: isSignatureProductSlug(product.slug),
        image: storefront.image,
        price: storefront.price
      } satisfies HomepageCatalogProductOption;
    })
  );
  const categoryOptionsSeed = await Promise.all(
    categories.map(async (category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      image: await resolveImageUrlWithFallback(category.image, null)
    }))
  );

  const parsedConfig = parseHomepageContentConfig(contentRow);
  const sanitizedParsedConfig = sanitizeConfigAgainstCatalog(parsedConfig, products, categories);
  const seedConfig = buildSeedConfig(productOptionsSeed, categoryOptionsSeed);
  const config = hydrateConfigWithSeed(sanitizedParsedConfig, seedConfig);
  const mappedProducts = await Promise.all(products.map((product) => mapStorefrontProduct(product)));
  const mappedCategories = await Promise.all(categories.map((category) => mapCategoryItem(category)));

  const productMap = new Map(mappedProducts.map((item) => [item.id, item]));
  const categoryMap = new Map(mappedCategories.map((item) => [item.id, item]));
  const categoryMetaBySlug = new Map(categories.map((category) => [category.slug, category]));

  const heroProduct = config.hero.productId ? productMap.get(config.hero.productId) || null : null;
  const fallbackHeroProduct = mappedProducts[0] || null;
  const selectedHeroProduct = heroProduct || fallbackHeroProduct;

  const newArrivalProducts =
    orderProductsByIds(mappedProducts, config.newArrivals.productIds).slice(0, 12).length > 0
      ? orderProductsByIds(mappedProducts, config.newArrivals.productIds).slice(0, 12)
      : mappedProducts.slice(0, 6);

  const featuredCollections =
    orderProductsByIds(mappedCategories, config.featuredCollections.categoryIds).slice(0, 3).length > 0
      ? orderProductsByIds(mappedCategories, config.featuredCollections.categoryIds).slice(0, 3)
      : mappedCategories.slice(0, 3);

  const signatureProductsFallback = mappedProducts.filter((product) => product.isSignature).slice(0, 4);
  const signatureProducts =
    orderProductsByIds(mappedProducts, config.signature.productIds).filter((product) => product.isSignature).slice(0, 4)
      .length > 0
      ? orderProductsByIds(mappedProducts, config.signature.productIds).filter((product) => product.isSignature).slice(0, 4)
      : signatureProductsFallback;

  const buildBestsellerTab = (label: string, slug: "rings" | "necklaces" | "earrings" | "bracelets", ids: string[]) => {
    const manual = orderProductsByIds(mappedProducts, ids).slice(0, 4);
    const categoryMeta = categoryMetaBySlug.get(slug);

    return {
      key: slug,
      label,
      categorySlug: categoryMeta?.slug || null,
      products: manual
    };
  };

  const bestsellerTabs = [
    buildBestsellerTab("Rings", "rings", config.bestseller.ringsProductIds),
    buildBestsellerTab("Necklaces", "necklaces", config.bestseller.necklacesProductIds),
    buildBestsellerTab("Earrings", "earrings", config.bestseller.earringsProductIds),
    buildBestsellerTab("Bracelets", "bracelets", config.bestseller.braceletsProductIds)
  ];

  const testimonials =
    testimonialRows.length > 0
      ? await Promise.all(
          testimonialRows.map(async (testimonial) => ({
            id: testimonial.id,
            customerName: testimonial.customerName,
            quote: testimonial.quote,
            imageUrl: await resolveImageUrlWithFallback(testimonial.imageUrl, "/assets/testimonial-1.jpg"),
            sortOrder: testimonial.sortOrder,
            isActive: testimonial.isActive
          }))
        )
      : fallbackTestimonials.map((testimonial, index) => ({
          id: `fallback-${index}`,
          customerName: testimonial.name,
          quote: testimonial.quote,
          imageUrl: testimonial.image,
          sortOrder: index,
          isActive: true
        }));

  return {
    config,
    heroProduct: selectedHeroProduct
      ? {
          ...selectedHeroProduct,
          href: ensureProductHrefSlug(selectedHeroProduct.slug)
        }
      : null,
    newArrivalProducts,
    featuredCollections,
    bestsellerTabs,
    signatureProducts,
    testimonials
  };
}
