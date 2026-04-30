import { notFound } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import { getProductBySlug } from "@/lib/mock-data";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="aspect-square overflow-hidden rounded-2xl bg-stone-100">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((imageIndex) => (
            <div key={imageIndex} className="aspect-square rounded-xl border border-stone-200 bg-white p-2">
              <img src={product.image} alt={`${product.name} view ${imageIndex}`} className="h-full w-full rounded-lg object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Product Details</p>
        <h1 className="font-heading text-3xl sm:text-4xl text-stone-900">{product.name}</h1>
        <p className="text-2xl font-semibold text-stone-900">{formatCurrency(product.price)}</p>
        <p className="text-sm leading-6 text-stone-600">{product.description}</p>

        <div className="card grid gap-3 p-4 text-sm text-stone-700 sm:grid-cols-2">
          <p>Material: {product.metalType}</p>
          <p>Weight: {product.weight}</p>
          <p>Gemstone: {product.gemstone}</p>
          <p>Certification: {product.certification}</p>
          <p>SKU: {product.sku}</p>
          <p>In Stock: {product.stock}</p>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="qty" className="text-sm text-stone-600">
            Quantity
          </label>
          <select id="qty" className="rounded-lg border border-stone-300 p-2 text-sm">
            {[1, 2, 3, 4].map((qty) => (
              <option key={qty} value={qty}>
                {qty}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white">Add to Cart</button>
          <button className="rounded-full border border-stone-300 px-6 py-3 text-sm font-medium text-stone-800">Wishlist</button>
        </div>
      </div>
    </div>
  );
}
