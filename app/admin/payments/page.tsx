import { StatusBadge } from "@/components/StatusBadge";

const paymentLogs = [
  { id: "pay_1", order: "HOE-1001", razorpayOrderId: "order_xxx", razorpayPaymentId: "pay_xxx", status: "PAID" as const },
  { id: "pay_2", order: "HOE-1002", razorpayOrderId: "order_yyy", razorpayPaymentId: "pay_yyy", status: "AUTHORIZED" as const }
];

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-5">
      <h2 className="font-heading text-3xl sm:text-4xl text-stone-900">Payments</h2>
      <div className="card overflow-x-auto">
        <table className="min-w-[720px] text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-100">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Razorpay Order ID</th>
              <th className="px-4 py-3">Razorpay Payment ID</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {paymentLogs.map((log) => (
              <tr key={log.id} className="border-b border-stone-100">
                <td className="px-4 py-3">{log.order}</td>
                <td className="px-4 py-3">{log.razorpayOrderId}</td>
                <td className="px-4 py-3">{log.razorpayPaymentId}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={log.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
