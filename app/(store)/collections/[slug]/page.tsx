import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/ProductGrid";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { getCollectionBySlug, getProductsByCollectionSlug } from "@/lib/mock-data";

export default async function CollectionBySlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) {
    notFound();
  }

  const collectionProducts = getProductsByCollectionSlug(slug);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl sm:text-4xl text-stone-900">{collection.name}</h1>
        <p className="text-sm text-stone-600">{collection.description}</p>
      </header>

      <section className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <aside className="card h-fit space-y-4 p-5">
          <h2 className="font-heading text-xl text-stone-900">Filters</h2>
          <div className="space-y-2 text-sm text-stone-700">
            <label className="block">Price Range</label>
            <input type="range" className="w-full" />
            <CustomSelect
              options={[{ value: "metal", label: "Metal Type" }]}
              defaultValue="metal"
              buttonClassName="w-full rounded-lg border border-stone-300 p-2"
              menuClassName="w-full"
            />
            <CustomSelect
              options={[{ value: "gemstone", label: "Gemstone" }]}
              defaultValue="gemstone"
              buttonClassName="w-full rounded-lg border border-stone-300 p-2"
              menuClassName="w-full"
            />
          </div>
        </aside>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-stone-600">{collectionProducts.length} products</p>
            <CustomSelect
              options={[
                { value: "featured", label: "Sort: Featured" },
                { value: "newest", label: "Newest" }
              ]}
              defaultValue="featured"
              buttonClassName="rounded-lg border border-stone-300 p-2 text-sm"
              menuClassName="w-[180px]"
              align="right"
            />
          </div>
          <ProductGrid products={collectionProducts} />
        </div>
      </section>
    </div>
  );
}
