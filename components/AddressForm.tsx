"use client";

export function AddressForm({ title = "Address" }: { title?: string }) {
  return (
    <section className="card space-y-4 p-5">
      <h3 className="font-heading text-xl text-stone-900">{title}</h3>

      <div className="grid gap-3 sm:grid-cols-2">
        <input className="rounded-lg border border-stone-300 p-3 text-sm" placeholder="Full Name" />
        <input className="rounded-lg border border-stone-300 p-3 text-sm" placeholder="Phone" />
        <input className="rounded-lg border border-stone-300 p-3 text-sm sm:col-span-2" placeholder="Address Line 1" />
        <input className="rounded-lg border border-stone-300 p-3 text-sm sm:col-span-2" placeholder="Address Line 2 (Optional)" />
        <input className="rounded-lg border border-stone-300 p-3 text-sm" placeholder="City" />
        <input className="rounded-lg border border-stone-300 p-3 text-sm" placeholder="State" />
        <input className="rounded-lg border border-stone-300 p-3 text-sm" placeholder="Pincode" />
        <input className="rounded-lg border border-stone-300 p-3 text-sm" placeholder="Country" defaultValue="India" />
      </div>

      <p className="text-xs text-stone-500">Pincode validation can be plugged into shipping API later.</p>
    </section>
  );
}
