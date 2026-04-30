import { CollectionCard } from "@/components/CollectionCard";
import { ProductGrid } from "@/components/ProductGrid";
import { categories, products } from "@/lib/mock-data";

export default function CollectionsPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl sm:text-4xl text-stone-900">Collections</h1>
        <p className="text-sm text-stone-600">Browse categories, featured products, and placeholder listing filters.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => (
          <CollectionCard key={category.id} category={category} />
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="card h-fit space-y-4 p-5">
          <h2 className="font-heading text-xl text-stone-900">Filters</h2>
          <div className="space-y-2 text-sm text-stone-700">
            <label className="block">Price Range</label>
            <input type="range" className="w-full" />
            <select className="w-full rounded-lg border border-stone-300 p-2">
              <option>Metal Type</option>
            </select>
            <select className="w-full rounded-lg border border-stone-300 p-2">
              <option>Gemstone</option>
            </select>
            <select className="w-full rounded-lg border border-stone-300 p-2">
              <option>Category</option>
            </select>
          </div>
        </aside>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-stone-600">{products.length} products</p>
            <select className="rounded-lg border border-stone-300 p-2 text-sm">
              <option>Sort: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
          <ProductGrid products={products} />
        </div>
      </section>
    </div>
  );
}
