import { AddressForm } from "@/components/AddressForm";

export default function AddressManagementPage() {
  return (
    <div className="space-y-5">
      <h1 className="font-heading text-3xl sm:text-4xl text-stone-900">Address Management</h1>
      <AddressForm title="Add New Address" />

      <section className="card space-y-3 p-5">
        <h2 className="font-heading text-2xl text-stone-900">Saved Addresses</h2>
        <div className="rounded-xl border border-stone-200 p-4 text-sm text-stone-700">
          <p>Placeholder Address Block</p>
          <p>Street Placeholder, City, State - 400001</p>
          <div className="mt-3 flex gap-2">
            <button className="rounded-full border border-stone-300 px-4 py-1 text-xs">Edit</button>
            <button className="rounded-full border border-rose-200 px-4 py-1 text-xs text-rose-700">Delete</button>
          </div>
        </div>
      </section>
    </div>
  );
}
