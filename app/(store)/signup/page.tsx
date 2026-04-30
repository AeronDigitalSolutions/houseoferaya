import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md space-y-5">
      <h1 className="font-heading text-3xl sm:text-4xl text-stone-900">Signup</h1>
      <section className="card space-y-4 p-5">
        <input className="w-full rounded-lg border border-stone-300 p-3 text-sm" placeholder="Full Name" />
        <input className="w-full rounded-lg border border-stone-300 p-3 text-sm" placeholder="Email" />
        <input className="w-full rounded-lg border border-stone-300 p-3 text-sm" placeholder="Phone" />
        <input className="w-full rounded-lg border border-stone-300 p-3 text-sm" placeholder="Password" type="password" />
        <button className="w-full rounded-full bg-stone-900 px-5 py-2 text-sm text-white">Create Account</button>
        <p className="text-center text-xs text-stone-500">
          Already registered? <Link href="/login" className="underline">Login</Link>
        </p>
      </section>
    </div>
  );
}
