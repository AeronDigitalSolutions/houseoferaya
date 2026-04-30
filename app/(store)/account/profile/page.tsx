export default function ProfilePage() {
  return (
    <div className="space-y-5">
      <h1 className="font-heading text-3xl sm:text-4xl text-stone-900">Profile</h1>
      <section className="card space-y-3 p-5">
        <p className="text-sm text-stone-600">Placeholder account profile form.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="rounded-lg border border-stone-300 p-3 text-sm" placeholder="Full Name" />
          <input className="rounded-lg border border-stone-300 p-3 text-sm" placeholder="Email" />
          <input className="rounded-lg border border-stone-300 p-3 text-sm" placeholder="Phone" />
          <input className="rounded-lg border border-stone-300 p-3 text-sm" placeholder="Date of Birth" />
        </div>
        <button className="rounded-full bg-stone-900 px-5 py-2 text-sm text-white">Save Profile</button>
      </section>
    </div>
  );
}
