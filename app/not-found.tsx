import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-base py-20 text-center">
      <h1 className="font-heading text-3xl sm:text-4xl text-stone-900">Page Not Found</h1>
      <p className="mt-3 text-sm text-stone-600">The requested placeholder route does not exist.</p>
      <Link href="/collections" className="mt-6 inline-flex rounded-full bg-stone-900 px-5 py-2 text-sm text-white">
        Go to Collections
      </Link>
    </div>
  );
}
