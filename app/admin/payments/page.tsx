import { Prisma, PaymentProvider, PaymentStatus } from "@prisma/client";
import { AdminPaymentsManager } from "@/components/admin/AdminPaymentsManager";
import { requireAdminPermission } from "@/lib/auth/admin-guard";
import { prisma } from "@/lib/prisma";
import { getRazorpayClient, isRazorpayConfigured } from "@/lib/razorpay";

export const dynamic = "force-dynamic";

type PaymentRow = Prisma.PaymentGetPayload<{
  select: {
    id: true;
    provider: true;
    status: true;
    amount: true;
    razorpayOrderId: true;
    razorpayPaymentId: true;
    paidAt: true;
    createdAt: true;
    updatedAt: true;
    order: {
      select: {
        id: true;
        orderNumber: true;
        total: true;
        paymentStatus: true;
        orderStatus: true;
        createdAt: true;
        user: {
          select: {
            name: true;
            email: true;
            phone: true;
          };
        };
      };
    };
  };
}>;

type SyncedPayment = {
  id: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  methodLabel: string;
  failureReason: string | null;
  syncError: boolean;
  order: {
    id: string;
    orderNumber: string;
    total: number;
    paymentStatus: PaymentStatus;
    orderStatus: string;
    createdAt: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
};

function formatDateTime(value?: string | Date | null) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function mapRazorpayStatus(status: string | undefined, fallback: PaymentStatus): PaymentStatus {
  if (status === "authorized") return PaymentStatus.AUTHORIZED;
  if (status === "captured") return PaymentStatus.PAID;
  if (status === "refunded") return PaymentStatus.REFUNDED;
  if (status === "failed") return PaymentStatus.FAILED;
  if (status === "created") return PaymentStatus.PENDING;
  return fallback;
}

function getMethodLabel(provider: PaymentProvider, method?: string | null) {
  if (provider !== PaymentProvider.RAZORPAY) return titleCase(provider);
  if (!method) return "Razorpay";
  return `Razorpay · ${titleCase(method)}`;
}

function buildUnsyncedPayments(paymentRows: PaymentRow[]): SyncedPayment[] {
  return paymentRows.map<SyncedPayment>((payment) => ({
    id: payment.id,
    provider: payment.provider,
    status: payment.status,
    amount: Number(payment.amount),
    razorpayOrderId: payment.razorpayOrderId,
    razorpayPaymentId: payment.razorpayPaymentId,
    paidAt: payment.paidAt?.toISOString() || null,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
    methodLabel: getMethodLabel(payment.provider),
    failureReason: null,
    syncError: false,
    order: {
      id: payment.order.id,
      orderNumber: payment.order.orderNumber,
      total: Number(payment.order.total),
      paymentStatus: payment.order.paymentStatus,
      orderStatus: payment.order.orderStatus,
      createdAt: payment.order.createdAt.toISOString(),
      customerName: payment.order.user.name || "Guest Customer",
      customerEmail: payment.order.user.email || "—",
      customerPhone: payment.order.user.phone || "—"
    }
  }));
}

async function syncPaymentsWithRazorpay(paymentRows: PaymentRow[]) {
  if (!isRazorpayConfigured()) {
    return {
      payments: buildUnsyncedPayments(paymentRows),
      razorpayLinked: false,
      syncErrorCount: 0
    };
  }

  const razorpay = getRazorpayClient();
  try {
    await razorpay.orders.all({ count: 1 });
  } catch {
    return {
      payments: buildUnsyncedPayments(paymentRows),
      razorpayLinked: false,
      syncErrorCount: paymentRows.length ? 1 : 0
    };
  }

  const updateQueries: Prisma.PrismaPromise<unknown>[] = [];
  let syncErrorCount = 0;

  const payments = await Promise.all(
    paymentRows.map(async (payment) => {
      let status = payment.status;
      let razorpayPaymentId = payment.razorpayPaymentId;
      let paidAt = payment.paidAt?.toISOString() || null;
      let methodLabel = getMethodLabel(payment.provider);
      let failureReason: string | null = null;
      let syncError = false;

      if (payment.provider === PaymentProvider.RAZORPAY && (payment.razorpayPaymentId || payment.razorpayOrderId)) {
        try {
          let remotePayment:
            | {
                id?: string;
                status?: string;
                created_at?: number;
                method?: string | null;
                error_description?: string | null;
                error_reason?: string | null;
              }
            | null = null;

          if (payment.razorpayPaymentId) {
            remotePayment = await razorpay.payments.fetch(payment.razorpayPaymentId);
          } else if (payment.razorpayOrderId) {
            const paymentCollection = await razorpay.orders.fetchPayments(payment.razorpayOrderId);
            remotePayment =
              paymentCollection.items.sort((left, right) => right.created_at - left.created_at)[0] || null;
          }

          if (remotePayment) {
            status = mapRazorpayStatus(remotePayment.status, payment.status);
            razorpayPaymentId = remotePayment.id || razorpayPaymentId;
            methodLabel = getMethodLabel(payment.provider, remotePayment.method || null);
            failureReason = remotePayment.error_description || remotePayment.error_reason || null;

            if (!paidAt && remotePayment.created_at && status === PaymentStatus.PAID) {
              paidAt = new Date(remotePayment.created_at * 1000).toISOString();
            }

            const shouldUpdatePayment =
              status !== payment.status ||
              razorpayPaymentId !== payment.razorpayPaymentId ||
              (paidAt || null) !== (payment.paidAt?.toISOString() || null);

            if (shouldUpdatePayment) {
              updateQueries.push(
                prisma.payment.update({
                  where: { id: payment.id },
                  data: {
                    status,
                    razorpayPaymentId,
                    paidAt: paidAt ? new Date(paidAt) : null
                  }
                })
              );
            }

            if (payment.order.paymentStatus !== status) {
              updateQueries.push(
                prisma.order.update({
                  where: { id: payment.order.id },
                  data: {
                    paymentStatus: status,
                    ...(status === PaymentStatus.PAID && payment.order.orderStatus === "PENDING"
                      ? { orderStatus: "CONFIRMED" }
                      : {})
                  }
                })
              );
            }
          }
        } catch {
          syncError = true;
          syncErrorCount += 1;
        }
      }

      return {
        id: payment.id,
        provider: payment.provider,
        status,
        amount: Number(payment.amount),
        razorpayOrderId: payment.razorpayOrderId,
        razorpayPaymentId,
        paidAt,
        createdAt: payment.createdAt.toISOString(),
        updatedAt: payment.updatedAt.toISOString(),
        methodLabel,
        failureReason,
        syncError,
        order: {
          id: payment.order.id,
          orderNumber: payment.order.orderNumber,
          total: Number(payment.order.total),
          paymentStatus: status,
          orderStatus: payment.order.orderStatus,
          createdAt: payment.order.createdAt.toISOString(),
          customerName: payment.order.user.name || "Guest Customer",
          customerEmail: payment.order.user.email || "—",
          customerPhone: payment.order.user.phone || "—"
        }
      } satisfies SyncedPayment;
    })
  );

  if (updateQueries.length) {
    await prisma.$transaction(updateQueries);
  }

  return {
    payments,
    razorpayLinked: true,
    syncErrorCount
  };
}

export default async function AdminPaymentsPage() {
  await requireAdminPermission("canViewPayments");

  const paymentRows = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      provider: true,
      status: true,
      amount: true,
      razorpayOrderId: true,
      razorpayPaymentId: true,
      paidAt: true,
      createdAt: true,
      updatedAt: true,
      order: {
        select: {
          id: true,
          orderNumber: true,
          total: true,
          paymentStatus: true,
          orderStatus: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true,
              phone: true
            }
          }
        }
      }
    }
  });

  const { payments, razorpayLinked, syncErrorCount } = await syncPaymentsWithRazorpay(paymentRows);

  return <AdminPaymentsManager payments={payments} razorpayLinked={razorpayLinked} syncErrorCount={syncErrorCount} />;
}
