import { prisma } from "@/lib/prisma";
import { buildProductPricing, productPricingSelect } from "@/lib/product-pricing";

const FREE_SHIPPING_THRESHOLD = 100000;

function buildOrderNumber() {
  const stamp = Date.now().toString().slice(-7);
  return `HOE-${stamp}`;
}

type PrepareCheckoutOrderInput = {
  userId: string;
  addressId?: string;
  notes?: string | null;
  couponCode?: string | null;
};

export type PreparedCheckoutOrder = {
  order: {
    id: string;
    orderNumber: string;
  };
  amountRupees: number;
  amountPaise: number;
  currency: "INR";
  subtotal: number;
  shippingCharge: number;
  discount: number;
  total: number;
};

export async function prepareCheckoutOrder(input: PrepareCheckoutOrderInput): Promise<PreparedCheckoutOrder> {
  const requestedAddressId = String(input.addressId || "").trim();
  const notes = String(input.notes || "").trim() || null;
  const couponCode = String(input.couponCode || "")
    .trim()
    .toUpperCase();

  return prisma.$transaction(async (tx) => {
    const [address, cart] = await Promise.all([
      tx.address.findFirst({
        where: {
          userId: input.userId,
          ...(requestedAddressId ? { id: requestedAddressId } : { isDefault: true })
        }
      }),
      tx.cart.findUnique({
        where: { userId: input.userId },
        include: {
          items: {
            include: {
              product: {
                select: productPricingSelect
              }
            }
          }
        }
      })
    ]);

    if (!address) {
      throw new Error("Please add/select a delivery address first.");
    }

    if (!cart || cart.items.length === 0) {
      throw new Error("Your cart is empty.");
    }

    const preparedLines = cart.items.map((line) => {
      const pricing = buildProductPricing(line.product);
      return {
        line,
        pricing,
        unitPrice: pricing.finalPrice,
        totalPrice: pricing.finalPrice * line.quantity
      };
    });

    const subtotal = preparedLines.reduce((sum, item) => sum + item.totalPrice, 0);
    const shippingCharge = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 199;
    const discount =
      couponCode === "ERAYA10" ? Math.round(subtotal * 0.1) : couponCode === "LUXE5" ? Math.round(subtotal * 0.05) : 0;
    const total = subtotal + shippingCharge - discount;
    const amountPaise = Math.round(total * 100);

    if (amountPaise < 100) {
      throw new Error("Minimum payable amount is ₹1.00.");
    }

    const existingPendingOrder = await tx.order.findFirst({
      where: {
        userId: input.userId,
        paymentStatus: "PENDING",
        orderStatus: "PENDING"
      },
      select: {
        id: true,
        orderNumber: true
      },
      orderBy: {
        updatedAt: "desc"
      }
    });

    const order = existingPendingOrder
      ? await tx.order.update({
          where: { id: existingPendingOrder.id },
          data: {
            addressId: address.id,
            subtotal,
            shippingCharge,
            discount,
            total,
            shippingFullName: address.fullName,
            shippingPhone: address.phone,
            shippingLine1: address.line1,
            shippingLine2: address.line2,
            shippingCity: address.city,
            shippingState: address.state,
            shippingCountry: address.country,
            shippingPincode: address.pincode,
            billingFullName: address.fullName,
            billingPhone: address.phone,
            billingLine1: address.line1,
            billingLine2: address.line2,
            billingCity: address.city,
            billingState: address.state,
            billingCountry: address.country,
            billingPincode: address.pincode,
            notes
          },
          select: {
            id: true,
            orderNumber: true
          }
        })
      : await tx.order.create({
          data: {
            userId: input.userId,
            addressId: address.id,
            orderNumber: buildOrderNumber(),
            subtotal,
            shippingCharge,
            discount,
            total,
            shippingFullName: address.fullName,
            shippingPhone: address.phone,
            shippingLine1: address.line1,
            shippingLine2: address.line2,
            shippingCity: address.city,
            shippingState: address.state,
            shippingCountry: address.country,
            shippingPincode: address.pincode,
            billingFullName: address.fullName,
            billingPhone: address.phone,
            billingLine1: address.line1,
            billingLine2: address.line2,
            billingCity: address.city,
            billingState: address.state,
            billingCountry: address.country,
            billingPincode: address.pincode,
            notes
          },
          select: {
            id: true,
            orderNumber: true
          }
        });

    await Promise.all([
      tx.orderItem.deleteMany({ where: { orderId: order.id } }),
      tx.payment.deleteMany({ where: { orderId: order.id, status: "PENDING" } })
    ]);

    for (const item of preparedLines) {
      const product = item.line.product;
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          variantId: null,
          productName: product.name,
          sku: product.sku,
          quantity: item.line.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          baseMetalUsed: product.baseMetal,
          metalRateUsed: item.pricing.metalRate,
          weightGramsUsed: Number(product.weightGrams),
          purityUsed: product.purity,
          purityFactorUsed: Number(product.purityFactor),
          metalPriceUsed: item.pricing.metalPrice,
          makingChargeTypeUsed: product.makingChargeType,
          makingChargeValueUsed: Number(product.makingChargeValue),
          makingChargeUsed: item.pricing.makingCharge,
          hasStoneUsed: product.hasStone,
          stoneTypeUsed: product.stoneType,
          stoneCostTypeUsed: product.stoneCostType,
          stoneCaratUsed: product.stoneCarat ? Number(product.stoneCarat) : null,
          stoneCostValueUsed: Number(product.stoneCostValue),
          stoneCostUsed: item.pricing.stoneCost,
          huidChargeUsed: item.pricing.huidCharge,
          subtotalBeforeGstUsed: item.pricing.subtotalBeforeGst,
          gstPercentageUsed: Number(product.gstPercentage),
          gstAmountUsed: item.pricing.gstAmount
        }
      });
    }

    return {
      order,
      amountRupees: total,
      amountPaise,
      currency: "INR" as const,
      subtotal,
      shippingCharge,
      discount,
      total
    };
  });
}
