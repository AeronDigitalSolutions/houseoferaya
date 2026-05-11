"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { ImagePlus, PencilLine, Plus, Save, Trash2 } from "lucide-react";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  initialCategories: CategoryItem[];
  canEdit: boolean;
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function AdminCategoriesManager({ initialCategories, canEdit }: Props) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [createState, setCreateState] = useState({
    name: "",
    slug: "",
    description: "",
    imageFile: null as File | null
  });

  const selected = useMemo(
    () => categories.find((item) => item.id === selectedId) || null,
    [categories, selectedId]
  );

  const [editState, setEditState] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true,
    imageFile: null as File | null
  });

  const openEdit = (item: CategoryItem) => {
    setSelectedId(item.id);
    setEditState({
      name: item.name,
      slug: item.slug,
      description: item.description || "",
      isActive: item.isActive,
      imageFile: null
    });
    setMessage("");
    setError("");
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit) return;
    setError("");
    setMessage("");

    if (!createState.name.trim() || !createState.imageFile) {
      setError("Category title and image are required.");
      return;
    }

    const body = new FormData();
    body.set("name", createState.name.trim());
    body.set("slug", toSlug(createState.slug || createState.name));
    body.set("description", createState.description.trim());
    body.set("image", createState.imageFile);

    setIsBusy(true);
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        body
      });
      const payload = (await response.json()) as { success: boolean; message?: string; category?: CategoryItem };
      if (!response.ok || !payload.success || !payload.category) {
        setError(payload.message || "Failed to create category.");
        return;
      }
      setCategories((prev) => [payload.category!, ...prev]);
      setCreateState({ name: "", slug: "", description: "", imageFile: null });
      setIsCreateOpen(false);
      setMessage(payload.message || "Category created.");
    } catch {
      setError("Failed to create category.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEdit || !selected) return;
    setError("");
    setMessage("");

    const body = new FormData();
    body.set("name", editState.name.trim());
    body.set("slug", toSlug(editState.slug || editState.name));
    body.set("description", editState.description.trim());
    body.set("isActive", String(editState.isActive));
    if (editState.imageFile) body.set("image", editState.imageFile);

    setIsBusy(true);
    try {
      const response = await fetch(`/api/admin/categories/${selected.id}`, {
        method: "PATCH",
        body
      });
      const payload = (await response.json()) as { success: boolean; message?: string; category?: CategoryItem };
      if (!response.ok || !payload.success || !payload.category) {
        setError(payload.message || "Failed to update category.");
        return;
      }
      setCategories((prev) => prev.map((item) => (item.id === payload.category!.id ? payload.category! : item)));
      setSelectedId(payload.category.id);
      setMessage(payload.message || "Category updated.");
    } catch {
      setError("Failed to update category.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!canEdit || !selected) return;
    if (!window.confirm(`Delete category "${selected.name}"?`)) return;
    setError("");
    setMessage("");
    setIsBusy(true);
    try {
      const response = await fetch(`/api/admin/categories/${selected.id}`, {
        method: "DELETE"
      });
      const payload = (await response.json()) as { success: boolean; message?: string };
      if (!response.ok || !payload.success) {
        setError(payload.message || "Failed to delete category.");
        return;
      }
      setCategories((prev) => prev.filter((item) => item.id !== selected.id));
      setSelectedId(null);
      setMessage(payload.message || "Category deleted.");
    } catch {
      setError("Failed to delete category.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-3xl text-stone-900">Product Categories</h2>
          <p className="text-sm text-stone-600">
            Create and manage product categories. These categories appear in product listing and admin product form.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          disabled={!canEdit}
          className="inline-flex items-center gap-2 rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={16} />
          New Category
        </button>
      </div>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <button
            type="button"
            key={category.id}
            onClick={() => openEdit(category)}
            className="card group overflow-hidden text-left transition hover:border-stone-300"
          >
            <div className="aspect-square overflow-hidden rounded-t-2xl bg-stone-100">
              <img
                src={category.image}
                alt={category.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="space-y-1 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-heading text-lg text-stone-900">{category.name}</p>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] ${
                    category.isActive ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-600"
                  }`}
                >
                  {category.isActive ? "Active" : "Hidden"}
                </span>
              </div>
              <p className="text-xs uppercase tracking-[0.14em] text-stone-500">/{category.slug}</p>
              <p className="text-sm text-stone-600 line-clamp-2">{category.description || "No description"}</p>
              <p className="text-xs text-stone-500">{category.productCount} linked products</p>
            </div>
          </button>
        ))}
      </section>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 bg-black/45 p-4 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)}>
          <div
            className="mx-auto mt-4 w-full max-w-2xl rounded-[1.5rem] border border-stone-200 bg-[#f8f4ee] p-5 sm:mt-10 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="font-heading text-2xl text-stone-900">Create Category</h3>
            <p className="mt-1 text-sm text-stone-600">Add one category image and title for storefront and admin forms.</p>

            <form className="mt-5 space-y-4" onSubmit={handleCreate}>
              <label className="space-y-1.5">
                <span className="text-xs uppercase tracking-[0.18em] text-stone-500">Category Title</span>
                <input
                  value={createState.name}
                  onChange={(event) => setCreateState((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-xl border border-black/12 bg-white px-3 py-2.5 text-sm"
                  placeholder="Rings"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs uppercase tracking-[0.18em] text-stone-500">Slug (Optional)</span>
                <input
                  value={createState.slug}
                  onChange={(event) => setCreateState((prev) => ({ ...prev, slug: event.target.value }))}
                  className="w-full rounded-xl border border-black/12 bg-white px-3 py-2.5 text-sm"
                  placeholder="rings"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs uppercase tracking-[0.18em] text-stone-500">Description (Optional)</span>
                <textarea
                  value={createState.description}
                  onChange={(event) => setCreateState((prev) => ({ ...prev, description: event.target.value }))}
                  className="min-h-20 w-full rounded-xl border border-black/12 bg-white px-3 py-2.5 text-sm"
                  placeholder="Category description"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs uppercase tracking-[0.18em] text-stone-500">Category Image</span>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-black/20 bg-white px-3 py-3 text-sm text-stone-700">
                  <ImagePlus size={16} />
                  <span>{createState.imageFile ? createState.imageFile.name : "Choose image"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setCreateState((prev) => ({ ...prev, imageFile: event.target.files?.[0] || null }))
                    }
                  />
                </label>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-full border border-black/15 bg-white px-4 py-2 text-sm text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBusy}
                  className="rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white disabled:opacity-60"
                >
                  {isBusy ? "Saving..." : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {selected ? (
        <div className="fixed inset-0 z-50 bg-black/45 p-4 backdrop-blur-sm" onClick={() => setSelectedId(null)}>
          <div
            className="mx-auto mt-4 w-full max-w-3xl rounded-[1.5rem] border border-stone-200 bg-[#f8f4ee] p-5 sm:mt-10 sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-heading text-2xl text-stone-900">Edit Category</h3>
                <p className="text-sm text-stone-600">Update details and visibility for this category.</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="rounded-full border border-black/15 bg-white p-2 text-stone-700"
                aria-label="Close"
              >
                <PencilLine size={15} />
              </button>
            </div>

            <form className="grid gap-4 md:grid-cols-[220px_1fr]" onSubmit={handleUpdate}>
              <div className="space-y-3">
                <div className="aspect-square overflow-hidden rounded-2xl border border-black/10 bg-white">
                  <img src={selected.image} alt={selected.name} className="h-full w-full object-cover" />
                </div>
                <label className="block">
                  <span className="mb-1 block text-xs uppercase tracking-[0.18em] text-stone-500">Replace Image</span>
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-black/20 bg-white px-3 py-2 text-xs text-stone-700">
                    <ImagePlus size={14} />
                    <span>{editState.imageFile ? editState.imageFile.name : "Select image"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        setEditState((prev) => ({ ...prev, imageFile: event.target.files?.[0] || null }))
                      }
                    />
                  </label>
                </label>
              </div>

              <div className="space-y-3">
                <label className="space-y-1.5">
                  <span className="text-xs uppercase tracking-[0.18em] text-stone-500">Category Title</span>
                  <input
                    value={editState.name}
                    onChange={(event) => setEditState((prev) => ({ ...prev, name: event.target.value }))}
                    className="w-full rounded-xl border border-black/12 bg-white px-3 py-2.5 text-sm"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs uppercase tracking-[0.18em] text-stone-500">Slug</span>
                  <input
                    value={editState.slug}
                    onChange={(event) => setEditState((prev) => ({ ...prev, slug: event.target.value }))}
                    className="w-full rounded-xl border border-black/12 bg-white px-3 py-2.5 text-sm"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs uppercase tracking-[0.18em] text-stone-500">Description</span>
                  <textarea
                    value={editState.description}
                    onChange={(event) => setEditState((prev) => ({ ...prev, description: event.target.value }))}
                    className="min-h-24 w-full rounded-xl border border-black/12 bg-white px-3 py-2.5 text-sm"
                  />
                </label>
                <label className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-stone-700">
                  <input
                    type="checkbox"
                    checked={editState.isActive}
                    onChange={(event) => setEditState((prev) => ({ ...prev, isActive: event.target.checked }))}
                    className="h-4 w-4 accent-stone-900"
                  />
                  Show on storefront
                </label>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isBusy || selected.productCount > 0}
                    className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-4 py-2 text-sm text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                    title={selected.productCount > 0 ? "Category has linked products and cannot be deleted." : ""}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedId(null)}
                      className="rounded-full border border-black/15 bg-white px-4 py-2 text-sm text-stone-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isBusy}
                      className="inline-flex items-center gap-1.5 rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm text-white disabled:opacity-60"
                    >
                      <Save size={14} />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
