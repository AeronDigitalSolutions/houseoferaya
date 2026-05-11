import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { buildProductPricing, productPricingSelect } from "@/lib/product-pricing";

const FREE_SHIPPING_THRESHOLD = 100000;

function buildOrderNumber() {
  const stamp = Date.now().toString().slice(-7);
  return `HOE-${stamp}`;
}

export async function POST(request: NextRequest) {
  const authUser = await getAuthUserFromRequest(request);
  if (!authUser || !authUser.isActive) {
    return NextResponse.json({ success: false, message: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const requestedAddressId = String(body?.addressId || "").trim();
    const notes = String(body?.notes || "").trim() || null;
    const couponCode = String(body?.couponCode || "").trim().toUpperCase();

    const [address, cart] = await Promise.all([
      prisma.address.findFirst({
        where: {
          userId: authUser.id,
          ...(requestedAddressId ? { id: requestedAddressId } : { isDefault: true })
        }
      }),
      prisma.cart.findUnique({
        where: { userId: authUser.id },
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
      return NextResponse.json({ success: false, message: "Please add/select a delivery address first." }, { status: 400 });
    }

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ success: false, message: "Your cart is empty." }, { status: 400 });
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

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId: authUser.id,
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
          notes
        }
      });

      for (const item of preparedLines) {
        const product = item.line.product;
        await tx.orderItem.create({
          data: {
            orderId: createdOrder.id,
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

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return createdOrder;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully.",
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          total
        }
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Unable to create order." },
      { status: 500 }
    );
  }
}
