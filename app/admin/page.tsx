export default function AdminDashboardPage() {
  return (
    <div className="space-y-5">
      <h2 className="font-heading text-3xl sm:text-4xl text-stone-900">Dashboard</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {["Total Orders", "Pending Shipments", "Revenue", "Active Customers"].map((metric) => (
          <div key={metric} className="card p-4">
            <p className="text-sm text-stone-600">{metric}</p>
            <p className="mt-2 font-heading text-2xl text-stone-900">--</p>
          </div>
        ))}
      </div>
    </div>
  );
}
