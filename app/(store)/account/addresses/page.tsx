"use client";

import { useMemo, useState, useEffect, type FormEvent } from "react";
import { Plus, Pencil, Trash2, X, MapPin } from "lucide-react";

type SavedAddress = {
  id: string;
  nickname: string | null;
  label: string | null;
  type: "HOME" | "WORK" | "OTHER";
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
};

type AddressFormState = Omit<SavedAddress, "id">;

const emptyAddress: AddressFormState = {
  nickname: "",
  label: "",
  type: "HOME",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  isDefault: false
};

export default function AddressManagementPage() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressFormState>(emptyAddress);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const modalTitle = useMemo(
    () => (editingAddressId ? "Edit Address" : "Add New Address"),
    [editingAddressId]
  );

  const loadAddresses = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/account/addresses", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data?.message || "Unable to load addresses.");
        return;
      }
      setAddresses(data.addresses || []);
    } catch {
      setErrorMessage("Unable to load addresses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAddresses();
  }, []);

  const openCreateModal = () => {
    setEditingAddressId(null);
    setForm(emptyAddress);
    setIsModalOpen(true);
    setStatusMessage("");
    setErrorMessage("");
  };

  const openEditModal = (address: SavedAddress) => {
    setEditingAddressId(address.id);
    setForm({
      nickname: address.nickname || address.label || "",
      label: address.label || "",
      type: address.type,
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country,
      isDefault: address.isDefault
    });
    setIsModalOpen(true);
    setStatusMessage("");
    setErrorMessage("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAddressId(null);
    setForm(emptyAddress);
  };

  const onChangeField = (field: keyof AddressFormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setStatusMessage("");
    setErrorMessage("");

    const url = editingAddressId ? `/api/account/addresses/${editingAddressId}` : "/api/account/addresses";
    const method = editingAddressId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data?.message || "Unable to save address.");
        return;
      }
      setStatusMessage(data?.message || "Address saved.");
      closeModal();
      await loadAddresses();
    } catch {
      setErrorMessage("Unable to save address.");
    } finally {
      setSaving(false);
    }
  };

  const deleteAddress = async (id: string) => {
    setErrorMessage("");
    setStatusMessage("");
    try {
      const res = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data?.message || "Unable to remove address.");
        return;
      }
      setStatusMessage(data?.message || "Address removed.");
      await loadAddresses();
    } catch {
      setErrorMessage("Unable to remove address.");
    }
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl text-royal-800 sm:text-4xl">Address Management</h1>
          <p className="mt-1 text-sm text-royal-700/70">Manage your delivery addresses for faster checkout.</p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-[#9c7346]/55 bg-[#f6ece0] px-5 py-2.5 text-sm font-medium tracking-[0.08em] text-royal-800 transition hover:bg-[#f1e4d2]"
        >
          <Plus size={16} />
          Add New Address
        </button>
      </header>

      <section className="card space-y-3 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-royal-700/70" />
          <h2 className="font-heading text-2xl text-royal-800">Saved Addresses</h2>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-dashed border-black/15 bg-white/70 p-6 text-center">
            <p className="text-sm text-royal-700/75">Loading addresses...</p>
          </div>
        ) : addresses.length ? (
          <div className="grid gap-3">
            {addresses.map((address) => (
              <article
                key={address.id}
                className="rounded-2xl border border-black/10 bg-gradient-to-b from-white to-[#fbf8f3] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-medium text-royal-800">{address.fullName}</p>
                      {address.nickname || address.label ? (
                        <span className="rounded-full border border-[#9c7346]/40 bg-[#f7ecdc] px-2.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[#7f6039]">
                          {address.nickname || address.label}
                        </span>
                      ) : null}
                      {address.isDefault ? (
                        <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.12em] text-emerald-700">
                          Default
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-royal-700/70">{address.phone}</p>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-royal-700/85">
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} - {address.pincode}, {address.country}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(address)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-white px-3 py-1.5 text-xs font-medium text-royal-700 transition hover:bg-stone-100"
                  >
                    <Pencil size={13} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => void deleteAddress(address.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-black/15 bg-white/70 p-6 text-center">
            <p className="text-sm text-royal-700/75">No saved addresses yet. Add your first address to continue.</p>
          </div>
        )}
      </section>

      {statusMessage ? <p className="text-sm text-emerald-700">{statusMessage}</p> : null}
      {errorMessage ? <p className="text-sm text-rose-700">{errorMessage}</p> : null}

      {isModalOpen ? (
        <div className="fixed inset-0 z-[85] flex items-end bg-black/35 p-0 backdrop-blur-[2px] sm:items-center sm:justify-center sm:p-6">
          <button
            type="button"
            aria-label="Close modal backdrop"
            className="absolute inset-0"
            onClick={closeModal}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label={modalTitle}
            className="relative z-10 w-full rounded-t-3xl border border-black/10 bg-[#f8f4ee] p-4 shadow-2xl sm:max-w-2xl sm:rounded-3xl sm:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-heading text-2xl text-royal-800">{modalTitle}</h3>
                <p className="mt-1 text-sm text-royal-700/70">Fill in details and save this address.</p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/15 bg-white text-royal-700 transition hover:bg-stone-100"
              >
                <X size={15} />
              </button>
            </div>

            <form className="space-y-3" onSubmit={saveAddress}>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={String(form.nickname || "")}
                  onChange={(event) => onChangeField("nickname", event.target.value)}
                  className="rounded-xl border border-black/15 bg-white px-3 py-3 text-sm text-royal-800 outline-none placeholder:text-royal-700/40 focus:border-[#9c7346]/55 sm:col-span-2"
                  placeholder="Address Nickname (Mom's Home, Office 2, etc)"
                />

                <input
                  value={String(form.label || "")}
                  onChange={(event) => onChangeField("label", event.target.value)}
                  className="rounded-xl border border-black/15 bg-white px-3 py-3 text-sm text-royal-800 outline-none placeholder:text-royal-700/40 focus:border-[#9c7346]/55 sm:col-span-2"
                  placeholder="Address Label (Home, Office, etc) (Optional)"
                />

                <input
                  required
                  value={form.fullName}
                  onChange={(event) => onChangeField("fullName", event.target.value)}
                  className="rounded-xl border border-black/15 bg-white px-3 py-3 text-sm text-royal-800 outline-none placeholder:text-royal-700/40 focus:border-[#9c7346]/55"
                  placeholder="Full Name"
                />

                <input
                  required
                  value={form.phone}
                  onChange={(event) => onChangeField("phone", event.target.value)}
                  className="rounded-xl border border-black/15 bg-white px-3 py-3 text-sm text-royal-800 outline-none placeholder:text-royal-700/40 focus:border-[#9c7346]/55"
                  placeholder="Phone"
                />

                <input
                  required
                  value={form.line1}
                  onChange={(event) => onChangeField("line1", event.target.value)}
                  className="rounded-xl border border-black/15 bg-white px-3 py-3 text-sm text-royal-800 outline-none placeholder:text-royal-700/40 focus:border-[#9c7346]/55 sm:col-span-2"
                  placeholder="Address Line 1"
                />

                <input
                  value={String(form.line2 || "")}
                  onChange={(event) => onChangeField("line2", event.target.value)}
                  className="rounded-xl border border-black/15 bg-white px-3 py-3 text-sm text-royal-800 outline-none placeholder:text-royal-700/40 focus:border-[#9c7346]/55 sm:col-span-2"
                  placeholder="Address Line 2 (Optional)"
                />

                <input
                  required
                  value={form.city}
                  onChange={(event) => onChangeField("city", event.target.value)}
                  className="rounded-xl border border-black/15 bg-white px-3 py-3 text-sm text-royal-800 outline-none placeholder:text-royal-700/40 focus:border-[#9c7346]/55"
                  placeholder="City"
                />

                <input
                  required
                  value={form.state}
                  onChange={(event) => onChangeField("state", event.target.value)}
                  className="rounded-xl border border-black/15 bg-white px-3 py-3 text-sm text-royal-800 outline-none placeholder:text-royal-700/40 focus:border-[#9c7346]/55"
                  placeholder="State"
                />

                <input
                  required
                  value={form.pincode}
                  onChange={(event) => onChangeField("pincode", event.target.value)}
                  className="rounded-xl border border-black/15 bg-white px-3 py-3 text-sm text-royal-800 outline-none placeholder:text-royal-700/40 focus:border-[#9c7346]/55"
                  placeholder="Pincode"
                />

                <input
                  required
                  value={form.country}
                  onChange={(event) => onChangeField("country", event.target.value)}
                  className="rounded-xl border border-black/15 bg-white px-3 py-3 text-sm text-royal-800 outline-none placeholder:text-royal-700/40 focus:border-[#9c7346]/55"
                  placeholder="Country"
                />

                <label className="sm:col-span-2 inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-royal-700">
                  <input
                    checked={form.isDefault}
                    onChange={(event) => onChangeField("isDefault", event.target.checked)}
                    type="checkbox"
                    className="h-4 w-4 rounded border-black/20"
                  />
                  Mark as default address
                </label>
              </div>

              <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-black/15 bg-white px-5 py-2.5 text-sm text-royal-700 transition hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-royal-800 px-5 py-2.5 text-sm font-medium tracking-[0.08em] text-white disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
