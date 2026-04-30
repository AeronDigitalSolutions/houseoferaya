export default function AdminShipmentsPage() {
  return (
    <div className="space-y-5">
      <h2 className="font-heading text-3xl sm:text-4xl text-stone-900">Shipments</h2>
      <section className="card space-y-4 p-5">
        <p className="text-sm text-stone-600">Create shipment and label generation placeholders.</p>
        <div className="flex flex-wrap gap-2">
          <button className="rounded-full border border-stone-300 px-4 py-2 text-sm">Create Shipment</button>
          <button className="rounded-full border border-stone-300 px-4 py-2 text-sm">Generate Label</button>
          <button className="rounded-full border border-stone-300 px-4 py-2 text-sm">Track Shipment</button>
        </div>
      </section>
    </div>
  );
}
