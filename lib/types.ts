export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  stock: number;
  metalType: string;
  gemstone: string;
  weight: string;
  certification: string;
  categoryId: string;
  image: string;
  isActive: boolean;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
};

export type CartLine = {
  id: string;
  product: Product;
  quantity: number;
};

export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "AUTHORIZED" | "PAID" | "FAILED" | "REFUNDED";
export type ShippingStatus = "NOT_CREATED" | "READY_TO_SHIP" | "IN_TRANSIT" | "DELIVERED" | "RETURNED";

export type TimelineEvent = {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  isCompleted: boolean;
};

export type Order = {
  id: string;
  orderNumber: string;
  subtotal: number;
  shippingCharge: number;
  discount: number;
  total: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus;
  estimatedDelivery: string;
  items: CartLine[];
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  shipment?: {
    courierName: string;
    awbCode: string;
    trackingUrl: string;
    timeline: TimelineEvent[];
  };
};
