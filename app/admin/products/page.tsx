import { products } from "@/lib/mock-data";

export default function AdminProductsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-3xl sm:text-4xl text-stone-900">Products</h2>
        <button className="rounded-full bg-stone-900 px-5 py-2 text-sm text-white">Add Product</button>
      </div>

      <div className="card overflow-x-auto">
        <table className="min-w-[720px] text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-100">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-stone-100">
                <td className="px-4 py-3">{product.name}</td>
                <td className="px-4 py-3">{product.sku}</td>
                <td className="px-4 py-3">{product.price}</td>
                <td className="px-4 py-3">{product.stock}</td>
                <td className="px-4 py-3">
                  <button className="mr-2 text-xs underline">Edit</button>
                  <button className="text-xs text-rose-700 underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
