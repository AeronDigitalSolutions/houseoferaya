import Link from "next/link";
import type { Category } from "@/lib/types";

export function CollectionCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/collections/${category.slug}`}
      className="group card overflow-hidden transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-stone-100">
        <img
          src={category.image}
          alt={category.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="space-y-2 p-4">
        <h3 className="font-heading text-xl text-stone-900">{category.name}</h3>
        <p className="text-sm text-stone-600">{category.description}</p>
      </div>
    </Link>
  );
}
