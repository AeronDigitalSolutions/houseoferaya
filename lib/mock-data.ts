import type { CartLine, Category, Order, Product, TimelineEvent } from "@/lib/types";

export const categories: Category[] = [
  {
    id: "cat-ring",
    name: "Rings",
    slug: "rings",
    description: "Signature rings for daily and occasion wear.",
    image: "/assets/signature-ring.jpg"
  },
  {
    id: "cat-necklace",
    name: "Necklaces",
    slug: "necklaces",
    description: "Layered and statement necklace collection.",
    image: "/assets/collection-aura.jpg"
  },
  {
    id: "cat-earrings",
    name: "Earrings",
    slug: "earrings",
    description: "Studs, hoops, and sculptural earrings.",
    image: "/assets/collection-earrings-geo.jpg"
  },
  {
    id: "cat-bracelets",
    name: "Bracelets",
    slug: "bracelets",
    description: "Minimal cuffs and chain bracelets.",
    image: "/assets/collection-noir.jpg"
  }
];

export const products: Product[] = [
  {
    id: "prod-1",
    name: "Celeste Diamond Ring",
    slug: "celeste-diamond-ring",
    description: "Placeholder description for a premium ring.",
    price: 52999,
    compareAtPrice: 58999,
    sku: "RNG-CLST-001",
    stock: 14,
    metalType: "18K Gold",
    gemstone: "Diamond",
    weight: "4.8g",
    certification: "IGI Certified",
    categoryId: "cat-ring",
    image: "/assets/signature-ring.jpg",
    isActive: true
  },
  {
    id: "prod-2",
    name: "Luna Halo Ring",
    slug: "luna-halo-ring",
    description: "Placeholder description for a halo ring.",
    price: 41999,
    compareAtPrice: 46999,
    sku: "RNG-LUNA-002",
    stock: 8,
    metalType: "14K Rose Gold",
    gemstone: "Moissanite",
    weight: "4.2g",
    certification: "In-house Certified",
    categoryId: "cat-ring",
    image: "/assets/collection-ring-vermilion.jpg",
    isActive: true
  },
  {
    id: "prod-3",
    name: "Astra Pendant Necklace",
    slug: "astra-pendant-necklace",
    description: "Placeholder description for a pendant necklace.",
    price: 28999,
    sku: "NCK-ASTR-001",
    stock: 20,
    metalType: "18K Gold",
    gemstone: "Sapphire",
    weight: "8.4g",
    certification: "BIS Hallmarked",
    categoryId: "cat-necklace",
    image: "/assets/collection-aura.jpg",
    isActive: true
  },
  {
    id: "prod-4",
    name: "Noir Chain Necklace",
    slug: "noir-chain-necklace",
    description: "Placeholder description for a chain necklace.",
    price: 24999,
    sku: "NCK-NOIR-002",
    stock: 17,
    metalType: "Sterling Silver",
    gemstone: "None",
    weight: "11.1g",
    certification: "BIS Hallmarked",
    categoryId: "cat-necklace",
    image: "/assets/collection-noir.jpg",
    isActive: true
  },
  {
    id: "prod-5",
    name: "Solstice Geo Earrings",
    slug: "solstice-geo-earrings",
    description: "Placeholder description for geometric earrings.",
    price: 17999,
    sku: "EAR-SOL-001",
    stock: 25,
    metalType: "14K Gold",
    gemstone: "Emerald",
    weight: "5.1g",
    certification: "In-house Certified",
    categoryId: "cat-earrings",
    image: "/assets/collection-earrings-geo.jpg",
    isActive: true
  },
  {
    id: "prod-6",
    name: "Sculpt Hoop Earrings",
    slug: "sculpt-hoop-earrings",
    description: "Placeholder description for hoop earrings.",
    price: 15999,
    sku: "EAR-SCULP-002",
    stock: 22,
    metalType: "Sterling Silver",
    gemstone: "Topaz",
    weight: "4.7g",
    certification: "In-house Certified",
    categoryId: "cat-earrings",
    image: "/assets/collection-earrings-sculpt.jpg",
    isActive: true
  }
];

export const cartItems: CartLine[] = [
  {
    id: "line-1",
    product: products[0],
    quantity: 1
  },
  {
    id: "line-2",
    product: products[4],
    quantity: 2
  }
];

const defaultTimeline: TimelineEvent[] = [
  {
    id: "t1",
    title: "Order Placed",
    description: "Order has been created successfully.",
    timestamp: "2026-04-26 10:30",
    isCompleted: true
  },
  {
    id: "t2",
    title: "Packed",
    description: "Jewelry packed and quality-checked.",
    timestamp: "2026-04-27 12:15",
    isCompleted: true
  },
  {
    id: "t3",
    title: "Shipped",
    description: "Shipment handed over to courier partner.",
    timestamp: "2026-04-28 09:50",
    isCompleted: true
  },
  {
    id: "t4",
    title: "Out for Delivery",
    description: "Delivery partner will attempt delivery soon.",
    timestamp: "Pending",
    isCompleted: false
  }
];

export const orders: Order[] = [
  {
    id: "ord_1001",
    orderNumber: "HOE-1001",
    subtotal: 88997,
    shippingCharge: 199,
    discount: 1500,
    total: 87696,
    orderStatus: "SHIPPED",
    paymentStatus: "PAID",
    shippingStatus: "IN_TRANSIT",
    estimatedDelivery: "2026-05-02",
    items: cartItems,
    shippingAddress: {
      fullName: "Placeholder Customer",
      phone: "+91 90000 00000",
      line1: "House/Flat Placeholder",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001",
      country: "India"
    },
    shipment: {
      courierName: "Delhivery",
      awbCode: "DLV123456789",
      trackingUrl: "#",
      timeline: defaultTimeline
    }
  },
  {
    id: "ord_1002",
    orderNumber: "HOE-1002",
    subtotal: 24999,
    shippingCharge: 0,
    discount: 0,
    total: 24999,
    orderStatus: "CONFIRMED",
    paymentStatus: "AUTHORIZED",
    shippingStatus: "READY_TO_SHIP",
    estimatedDelivery: "2026-05-04",
    items: [
      {
        id: "line-3",
        product: products[3],
        quantity: 1
      }
    ],
    shippingAddress: {
      fullName: "Placeholder Customer",
      phone: "+91 90000 00000",
      line1: "Street Placeholder",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560001",
      country: "India"
    }
  }
];

export function getCollectionBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

export function getProductsByCollectionSlug(slug: string): Product[] {
  const category = getCollectionBySlug(slug);
  if (!category) {
    return [];
  }

  return products.filter((product) => product.categoryId === category.id && product.isActive);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getOrderById(orderId: string): Order | undefined {
  return orders.find((order) => order.id === orderId || order.orderNumber === orderId);
}
