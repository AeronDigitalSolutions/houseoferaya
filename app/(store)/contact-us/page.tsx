export default function ContactUsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-heading text-3xl sm:text-4xl text-stone-900">Contact Us</h1>

      <section className="card space-y-4 p-6">
        <p className="text-sm text-stone-600">Please share your query and our team will get back to you.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="rounded-lg border border-stone-300 p-3 text-sm" placeholder="Name" />
          <input className="rounded-lg border border-stone-300 p-3 text-sm" placeholder="Email" />
          <input className="rounded-lg border border-stone-300 p-3 text-sm sm:col-span-2" placeholder="Subject" />
          <textarea className="rounded-lg border border-stone-300 p-3 text-sm sm:col-span-2" placeholder="Message" rows={5} />
        </div>
        <button className="rounded-full bg-stone-900 px-5 py-2 text-sm text-white">Send Message</button>

        <div className="space-y-1 border-t border-stone-200 pt-4 text-sm text-stone-600">
          <p>Email: [Insert Support Email]</p>
          <p>Phone: [Insert Phone Number]</p>
          <p>Operating Hours: [Insert Timings]</p>
          <p>Address: Plot no-252, Varanasi Enclave Colony, P.O.- Bhullanpur, Marhauli, Varanasi (U.P) 221108</p>
        </div>
      </section>
    </div>
  );
}
