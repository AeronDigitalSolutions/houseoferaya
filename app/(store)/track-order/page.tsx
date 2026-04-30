export default function TrackOrderPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-heading text-3xl sm:text-4xl text-stone-900">Track Order</h1>

      <section className="card space-y-4 p-6">
        <p className="text-sm text-stone-600">Enter Order ID and email/phone to fetch shipment details.</p>
        <div className="grid gap-3">
          <input className="rounded-lg border border-stone-300 p-3 text-sm" placeholder="Order ID" />
          <input className="rounded-lg border border-stone-300 p-3 text-sm" placeholder="Email or Phone" />
        </div>
        <button className="rounded-full bg-stone-900 px-5 py-2 text-sm text-white">Track</button>
      </section>
    </div>
  );
}
