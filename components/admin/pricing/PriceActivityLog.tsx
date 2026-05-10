import type { ActivityLogItem } from "@/components/admin/pricing/types";
import { formatCurrency, formatDateTime } from "@/components/admin/pricing/utils";

export function PriceActivityLog({ logs }: { logs: ActivityLogItem[] }) {
  return (
    <section className="card rounded-3xl">
      <div className="border-b border-stone-200 px-5 py-4 sm:px-6">
        <h3 className="font-heading text-2xl text-stone-900">Price History / Activity Logs</h3>
      </div>

      <div className="space-y-3 p-4 sm:hidden">
        {logs.map((log) => {
          const isUp = log.changeAmount > 0;
          const isDown = log.changeAmount < 0;
          return (
            <article key={log.id} className="rounded-2xl border border-stone-200 bg-stone-50/80 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-stone-500">{formatDateTime(log.timestamp)}</p>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    log.status === "Success"
                      ? "bg-emerald-100 text-emerald-700"
                      : log.status === "Failed"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {log.status}
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <p className="text-stone-500">Metal</p>
                <p className="text-right font-medium text-stone-900">{log.metal}</p>
                <p className="text-stone-500">Old Rate</p>
                <p className="text-right text-stone-700">{formatCurrency(log.oldRate)}</p>
                <p className="text-stone-500">New Rate</p>
                <p className="text-right text-stone-700">{formatCurrency(log.newRate)}</p>
                <p className="text-stone-500">Change</p>
                <p className={`text-right ${isUp ? "text-emerald-700" : isDown ? "text-rose-700" : "text-stone-700"}`}>
                  {log.changeAmount > 0 ? "+" : ""}
                  {formatCurrency(log.changeAmount)}
                </p>
                <p className="text-stone-500">Action</p>
                <p className="text-right text-stone-700">{log.action}</p>
                <p className="text-stone-500">Updated By</p>
                <p className="text-right text-stone-700">{log.updatedBy}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto sm:block">
        <table className="min-w-[980px] text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-100/80 text-xs uppercase tracking-[0.12em] text-stone-600">
            <tr>
              <th className="px-4 py-3">Date/Time</th>
              <th className="px-4 py-3">Metal</th>
              <th className="px-4 py-3">Old Rate</th>
              <th className="px-4 py-3">New Rate</th>
              <th className="px-4 py-3">Change</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated By</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => {
              const isUp = log.changeAmount > 0;
              const isDown = log.changeAmount < 0;
              return (
                <tr key={log.id} className="border-b border-stone-100">
                  <td className="px-4 py-3 text-stone-700">{formatDateTime(log.timestamp)}</td>
                  <td className="px-4 py-3 font-medium text-stone-900">{log.metal}</td>
                  <td className="px-4 py-3 text-stone-700">{formatCurrency(log.oldRate)}</td>
                  <td className="px-4 py-3 text-stone-700">{formatCurrency(log.newRate)}</td>
                  <td className={`px-4 py-3 ${isUp ? "text-emerald-700" : isDown ? "text-rose-700" : "text-stone-700"}`}>
                    {log.changeAmount > 0 ? "+" : ""}
                    {formatCurrency(log.changeAmount)}
                  </td>
                  <td className="px-4 py-3 text-stone-700">{log.action}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        log.status === "Success"
                          ? "bg-emerald-100 text-emerald-700"
                          : log.status === "Failed"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-700">{log.updatedBy}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
