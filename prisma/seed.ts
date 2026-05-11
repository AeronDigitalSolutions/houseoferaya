import {
  BaseMetal,
  MakingChargeType,
  MetalColor,
  PrismaClient,
  PurityType,
  StoneCostType
} from "@prisma/client";
import { PURITY_FACTOR_MAP, calculateJewelryPrice } from "../lib/jewelry-pricing";

const prisma = new PrismaClient();

async function main() {
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.user.deleteMany();

  const [rings, necklaces, earrings] = await Promise.all([
    prisma.category.create({
      data: {
        name: "Rings",
        slug: "rings",
        description: "Placeholder ring category",
        image: "/assets/collection-ring.jpg"
      }
    }),
    prisma.category.create({
      data: {
        name: "Necklaces",
        slug: "necklaces",
        description: "Placeholder necklace category",
        image: "/assets/collection-necklace.jpg"
      }
    }),
    prisma.category.create({
      data: {
        name: "Earrings",
        slug: "earrings",
        description: "Placeholder earrings category",
        image: "/assets/collection-earring.jpg"
      }
    })
  ]);

  const productInputs = [
    {
      name: "Celeste Diamond Ring",
      slug: "celeste-diamond-ring",
      description: "Placeholder product description.",
      compareAtPrice: "58999.00",
      sku: "RNG-CLST-001",
      stock: 14,
      metalType: "18K Gold",
      gemstone: "Diamond",
      weight: "4.8g",
      certification: "IGI Certified",
      categoryId: rings.id,
      image: "/assets/signature-ring.jpg",
      baseMetal: BaseMetal.GOLD,
      metalColor: MetalColor.YELLOW_GOLD,
      purity: PurityType.K18,
      weightGrams: 4.8,
      activeGoldRate: 9500,
      activeSilverRate: 105,
      useManualSellingRate: false,
      manualSellingRate: null,
      makingChargeType: MakingChargeType.PER_GRAM,
      makingChargeValue: 2500,
      hasStone: true,
      stoneType: "Diamond",
      stoneCarat: 0.45,
      stoneCostType: StoneCostType.FIXED,
      stoneCostValue: 12000,
      huidCharge: 55,
      gstPercentage: 3
    },
    {
      name: "Luna Halo Ring",
      slug: "luna-halo-ring",
      description: "Placeholder product description.",
      compareAtPrice: "46999.00",
      sku: "RNG-LUNA-002",
      stock: 8,
      metalType: "14K Rose Gold",
      gemstone: "Moissanite",
      weight: "4.2g",
      certification: "In-house Certified",
      categoryId: rings.id,
      image: "/assets/collection-ring-vermilion.jpg",
      baseMetal: BaseMetal.GOLD,
      metalColor: MetalColor.ROSE_GOLD,
      purity: PurityType.K14,
      weightGrams: 4.2,
      activeGoldRate: 9500,
      activeSilverRate: 105,
      useManualSellingRate: false,
      manualSellingRate: null,
      makingChargeType: MakingChargeType.PER_GRAM,
      makingChargeValue: 1950,
      hasStone: true,
      stoneType: "Moissanite",
      stoneCarat: 0.35,
      stoneCostType: StoneCostType.FIXED,
      stoneCostValue: 8500,
      huidCharge: 55,
      gstPercentage: 3
    },
    {
      name: "Astra Pendant Necklace",
      slug: "astra-pendant-necklace",
      description: "Placeholder product description.",
      compareAtPrice: null,
      sku: "NCK-ASTR-001",
      stock: 20,
      metalType: "18K Gold",
      gemstone: "Sapphire",
      weight: "8.4g",
      certification: "BIS Hallmarked",
      categoryId: necklaces.id,
      image: "/assets/collection-aura.jpg",
      baseMetal: BaseMetal.GOLD,
      metalColor: MetalColor.YELLOW_GOLD,
      purity: PurityType.K18,
      weightGrams: 8.4,
      activeGoldRate: 9500,
      activeSilverRate: 105,
      useManualSellingRate: false,
      manualSellingRate: null,
      makingChargeType: MakingChargeType.PER_GRAM,
      makingChargeValue: 1650,
      hasStone: true,
      stoneType: "Sapphire",
      stoneCarat: 0.3,
      stoneCostType: StoneCostType.PER_CARAT,
      stoneCostValue: 18000,
      huidCharge: 55,
      gstPercentage: 3
    },
    {
      name: "Noir Chain Necklace",
      slug: "noir-chain-necklace",
      description: "Placeholder product description.",
      compareAtPrice: null,
      sku: "NCK-NOIR-002",
      stock: 17,
      metalType: "Sterling Silver",
      gemstone: "None",
      weight: "11.1g",
      certification: "BIS Hallmarked",
      categoryId: necklaces.id,
      image: "/assets/collection-noir.jpg",
      baseMetal: BaseMetal.SILVER,
      metalColor: MetalColor.OXIDISED_SILVER,
      purity: PurityType.S925,
      weightGrams: 11.1,
      activeGoldRate: 9500,
      activeSilverRate: 105,
      useManualSellingRate: false,
      manualSellingRate: null,
      makingChargeType: MakingChargeType.PER_GRAM,
      makingChargeValue: 220,
      hasStone: false,
      stoneType: null,
      stoneCarat: null,
      stoneCostType: StoneCostType.FIXED,
      stoneCostValue: 0,
      huidCharge: 55,
      gstPercentage: 3
    },
    {
      name: "Solstice Geo Earrings",
      slug: "solstice-geo-earrings",
      description: "Placeholder product description.",
      compareAtPrice: null,
      sku: "EAR-SOL-001",
      stock: 25,
      metalType: "14K Gold",
      gemstone: "Emerald",
      weight: "5.1g",
      certification: "In-house Certified",
      categoryId: earrings.id,
      image: "/assets/collection-earrings-geo.jpg",
      baseMetal: BaseMetal.GOLD,
      metalColor: MetalColor.WHITE_GOLD,
      purity: PurityType.K14,
      weightGrams: 5.1,
      activeGoldRate: 9500,
      activeSilverRate: 105,
      useManualSellingRate: false,
      manualSellingRate: null,
      makingChargeType: MakingChargeType.PER_GRAM,
      makingChargeValue: 1750,
      hasStone: true,
      stoneType: "Emerald",
      stoneCarat: 0.2,
      stoneCostType: StoneCostType.FIXED,
      stoneCostValue: 4000,
      huidCharge: 55,
      gstPercentage: 3
    }
  ];

  for (const input of productInputs) {
    const purityFactor = PURITY_FACTOR_MAP[input.purity];
    const metalRate = input.baseMetal === BaseMetal.GOLD ? input.activeGoldRate : input.activeSilverRate;
    const price = calculateJewelryPrice({
      baseMetal: input.baseMetal,
      metalRate,
      weightGrams: input.weightGrams,
      purityFactor,
      makingChargeType: input.makingChargeType,
      makingChargeValue: input.makingChargeValue,
      stoneCostType: input.stoneCostType,
      stoneCostValue: input.stoneCostValue,
      stoneCarat: input.stoneCarat ?? 0,
      huidCharge: input.huidCharge,
      gstPercentage: input.gstPercentage
    }).finalPrice;

    const product = await prisma.product.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        price,
        compareAtPrice: input.compareAtPrice,
        baseMetal: input.baseMetal,
        metalColor: input.metalColor,
        purity: input.purity,
        purityFactor,
        weightGrams: input.weightGrams,
        activeGoldRate: input.activeGoldRate,
        activeSilverRate: input.activeSilverRate,
        useLockedRate: true,
        useManualSellingRate: input.useManualSellingRate,
        manualSellingRate: input.manualSellingRate,
        makingChargeType: input.makingChargeType,
        makingChargeValue: input.makingChargeValue,
        hasStone: input.hasStone,
        stoneType: input.stoneType,
        stoneCarat: input.stoneCarat,
        stoneCostType: input.stoneCostType,
        stoneCostValue: input.stoneCostValue,
        huidCharge: input.huidCharge,
        gstPercentage: input.gstPercentage,
        sku: input.sku,
        stock: input.stock,
        metalType: input.metalType,
        gemstone: input.gemstone,
        weight: input.weight,
        certification: input.certification,
        categoryId: input.categoryId,
        isActive: true
      }
    });

    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: input.image,
        altText: input.name,
        isPrimary: true,
        sortOrder: 1
      }
    });

    await prisma.productVariant.create({
      data: {
        productId: product.id,
        name: "Default Variant",
        sku: `${input.sku}-V1`,
        price,
        stock: input.stock,
        metalType: input.metalType,
        gemstone: input.gemstone,
        weight: input.weight,
        isActive: true
      }
    });
  }

  const customer = await prisma.user.create({
    data: {
      name: "Placeholder Customer",
      email: "customer@example.com",
      passwordHash: "placeholder_hash",
      phone: "+919000000000"
    }
  });

  await prisma.address.create({
    data: {
      userId: customer.id,
      fullName: "Placeholder Customer",
      phone: "+919000000000",
      line1: "123 Placeholder Street",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      isDefault: true
    }
  });

  await prisma.cart.create({ data: { userId: customer.id } });
  await prisma.wishlist.create({ data: { userId: customer.id } });

  await prisma.adminUser.create({
    data: {
      name: "Placeholder Admin",
      email: "admin@example.com",
      passwordHash: "placeholder_admin_hash",
      role: "SUPER_ADMIN"
    }
  });

  console.log("Seed complete: categories, products, variants, customer, admin.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
