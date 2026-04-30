import { PrismaClient } from "@prisma/client";

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
    prisma.category.create({ data: { name: "Rings", slug: "rings", description: "Placeholder ring category" } }),
    prisma.category.create({ data: { name: "Necklaces", slug: "necklaces", description: "Placeholder necklace category" } }),
    prisma.category.create({ data: { name: "Earrings", slug: "earrings", description: "Placeholder earrings category" } })
  ]);

  const productInputs = [
    {
      name: "Celeste Diamond Ring",
      slug: "celeste-diamond-ring",
      description: "Placeholder product description.",
      price: "52999.00",
      compareAtPrice: "58999.00",
      sku: "RNG-CLST-001",
      stock: 14,
      metalType: "18K Gold",
      gemstone: "Diamond",
      weight: "4.8g",
      certification: "IGI Certified",
      categoryId: rings.id,
      image: "/assets/signature-ring.jpg"
    },
    {
      name: "Luna Halo Ring",
      slug: "luna-halo-ring",
      description: "Placeholder product description.",
      price: "41999.00",
      compareAtPrice: "46999.00",
      sku: "RNG-LUNA-002",
      stock: 8,
      metalType: "14K Rose Gold",
      gemstone: "Moissanite",
      weight: "4.2g",
      certification: "In-house Certified",
      categoryId: rings.id,
      image: "/assets/collection-ring-vermilion.jpg"
    },
    {
      name: "Astra Pendant Necklace",
      slug: "astra-pendant-necklace",
      description: "Placeholder product description.",
      price: "28999.00",
      compareAtPrice: null,
      sku: "NCK-ASTR-001",
      stock: 20,
      metalType: "18K Gold",
      gemstone: "Sapphire",
      weight: "8.4g",
      certification: "BIS Hallmarked",
      categoryId: necklaces.id,
      image: "/assets/collection-aura.jpg"
    },
    {
      name: "Noir Chain Necklace",
      slug: "noir-chain-necklace",
      description: "Placeholder product description.",
      price: "24999.00",
      compareAtPrice: null,
      sku: "NCK-NOIR-002",
      stock: 17,
      metalType: "Sterling Silver",
      gemstone: "None",
      weight: "11.1g",
      certification: "BIS Hallmarked",
      categoryId: necklaces.id,
      image: "/assets/collection-noir.jpg"
    },
    {
      name: "Solstice Geo Earrings",
      slug: "solstice-geo-earrings",
      description: "Placeholder product description.",
      price: "17999.00",
      compareAtPrice: null,
      sku: "EAR-SOL-001",
      stock: 25,
      metalType: "14K Gold",
      gemstone: "Emerald",
      weight: "5.1g",
      certification: "In-house Certified",
      categoryId: earrings.id,
      image: "/assets/collection-earrings-geo.jpg"
    }
  ];

  for (const input of productInputs) {
    const product = await prisma.product.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        price: input.price,
        compareAtPrice: input.compareAtPrice,
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
        price: input.price,
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
