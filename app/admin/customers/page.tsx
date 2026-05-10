import { requireAdminPermission } from "@/lib/auth/admin-guard";
import { AdminCustomersDirectory } from "@/components/admin/AdminCustomersDirectory";
import { prisma } from "@/lib/prisma";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(value);
}

export default async function AdminCustomersPage() {
  await requireAdminPermission("canViewCustomers");

  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      dateOfBirth: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      addresses: {
        select: {
          id: true,
          nickname: true,
          label: true,
          type: true,
          fullName: true,
          phone: true,
          line1: true,
          line2: true,
          city: true,
          state: true,
          country: true,
          pincode: true,
          isDefault: true,
          createdAt: true
        }
      },
      wishlist: {
        select: {
          id: true,
          items: {
            select: {
              id: true,
              createdAt: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  price: true,
                  metalType: true,
                  gemstone: true,
                  images: {
                    select: {
                      url: true,
                      isPrimary: true,
                      sortOrder: true
                    },
                    orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
                    take: 1
                  }
                }
              }
            },
            orderBy: { createdAt: "desc" }
          }
        }
      },
      orders: {
        select: {
          id: true,
          orderNumber: true,
          total: true,
          orderStatus: true,
          paymentStatus: true,
          shippingStatus: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              productName: true,
              sku: true,
              quantity: true,
              unitPrice: true,
              totalPrice: true
            }
          }
        }
      }
    }
  });

  const customers = users.map((user) => {
    const orders = user.orders
      .map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        total: Number(order.total),
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        shippingStatus: order.shippingStatus,
        createdAt: order.createdAt.toISOString(),
        items: order.items.map((item) => ({
          id: item.id,
          productName: item.productName,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice)
        }))
      }))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

    const lifetimeValue = orders.reduce((sum, order) => sum + order.total, 0);

    const wishlistItems =
      user.wishlist?.items.map((item) => ({
        id: item.id,
        productId: item.product.id,
        productName: item.product.name,
        productSlug: item.product.slug,
        price: Number(item.product.price),
        metalType: item.product.metalType,
        gemstone: item.product.gemstone,
        imageUrl: item.product.images[0]?.url ?? null,
        addedAt: item.createdAt.toISOString()
      })) ?? [];

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : null,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      orderCount: orders.length,
      lifetimeValue,
      lastOrderAt: orders[0]?.createdAt ?? null,
      addressCount: user.addresses.length,
      hasWishlist: Boolean(user.wishlist),
      addresses: user.addresses
        .map((address) => ({
          id: address.id,
          nickname: address.nickname,
          label: address.label,
          type: address.type,
          fullName: address.fullName,
          phone: address.phone,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          country: address.country,
          pincode: address.pincode,
          isDefault: address.isDefault,
          createdAt: address.createdAt.toISOString()
        }))
        .sort((a, b) => {
          if (a.isDefault && !b.isDefault) return -1;
          if (!a.isDefault && b.isDefault) return 1;
          return +new Date(b.createdAt) - +new Date(a.createdAt);
        }),
      orders,
      wishlistItems
    };
  });

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((customer) => customer.isActive).length;
  const customersWithOrders = customers.filter((customer) => customer.orderCount > 0).length;
  const totalLifetimeValue = customers.reduce((sum, customer) => sum + customer.lifetimeValue, 0);

  return (
    <div className="space-y-5">
      <h2 className="font-heading text-3xl text-stone-900 sm:text-4xl">Customers</h2>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="card p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-stone-500">Total Customers</p>
          <p className="mt-2 font-heading text-3xl text-stone-900">{totalCustomers}</p>
        </article>
        <article className="card p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-stone-500">Active Customers</p>
          <p className="mt-2 font-heading text-3xl text-stone-900">{activeCustomers}</p>
        </article>
        <article className="card p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-stone-500">With Orders</p>
          <p className="mt-2 font-heading text-3xl text-stone-900">{customersWithOrders}</p>
        </article>
        <article className="card p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-stone-500">Customer LTV</p>
          <p className="mt-2 font-heading text-2xl text-stone-900">{formatCurrency(totalLifetimeValue)}</p>
        </article>
      </section>

      <AdminCustomersDirectory customers={customers} />
    </div>
  );
}
