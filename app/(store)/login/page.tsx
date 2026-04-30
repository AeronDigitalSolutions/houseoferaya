import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-5">
      <h1 className="font-heading text-3xl sm:text-4xl text-stone-900">Login</h1>
      <section className="card space-y-4 p-5">
        <input className="w-full rounded-lg border border-stone-300 p-3 text-sm" placeholder="Email" />
        <input className="w-full rounded-lg border border-stone-300 p-3 text-sm" placeholder="Password" type="password" />
        <button className="w-full rounded-full bg-stone-900 px-5 py-2 text-sm text-white">Login</button>
        <p className="text-center text-xs text-stone-500">
          New user? <Link href="/signup" className="underline">Create account</Link>
        </p>
      </section>
    </div>
  );
}
