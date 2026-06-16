"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  ImagePlus,
  Monitor,
  Pencil,
  Save,
  Smartphone,
  Trash2,
  Upload,
  X
} from "lucide-react";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { HomepageSectionsManager } from "@/components/admin/homepage-media/HomepageSectionsManager";
import { useBrandDialog } from "@/components/providers/BrandDialogProvider";

type DeviceType = "DESKTOP" | "MOBILE";
type Message = { type: "success" | "error"; text: string } | null;

type HomepageBannerRecord = {
  id: string;
  deviceType: DeviceType;
  title: string | null;
  fileName: string;
  publicUrl: string;
  width: number;
  height: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const dimensionNote: Record<DeviceType, string> = {
  DESKTOP: "Desktop banners must follow a 16:9 ratio (landscape).",
  MOBILE: "Mobile banners must follow a 9:16 ratio (portrait)."
};
const PAGE_SIZE = 20;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
  maxWidth = "max-w-3xl"
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="fixed inset-0 z-[120] flex items-end bg-black/45 p-0 backdrop-blur-[2px] sm:items-center sm:justify-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full ${maxWidth} rounded-t-3xl border border-stone-200 bg-[#f8f5f0] p-5 shadow-2xl sm:rounded-3xl sm:p-6`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-heading text-2xl text-stone-900">{title}</h3>
            {subtitle ? <p className="mt-1 text-sm text-stone-600">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DevicePill({
  active,
  icon,
  label,
  onClick
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
        active
          ? "border-stone-900 bg-stone-900 text-white"
          : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export function HomepageMediaManager() {
  const { confirm } = useBrandDialog();
  const [banners, setBanners] = useState<HomepageBannerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>(null);

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadDeviceType, setUploadDeviceType] = useState<DeviceType>("DESKTOP");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const [selectedBannerId, setSelectedBannerId] = useState<string | null>(null);
  const [pages, setPages] = useState<Record<DeviceType, number>>({ DESKTOP: 1, MOBILE: 1 });
  const [titleDrafts, setTitleDrafts] = useState<Record<string, string>>({});
  const [replaceFiles, setReplaceFiles] = useState<Record<string, File | null>>({});

  const sortedBanners = useMemo(
    () => [...banners].sort((a, b) => a.sortOrder - b.sortOrder || a.updatedAt.localeCompare(b.updatedAt)),
    [banners]
  );

  const desktopBanners = useMemo(
    () => sortedBanners.filter((item) => item.deviceType === "DESKTOP"),
    [sortedBanners]
  );

  const mobileBanners = useMemo(
    () => sortedBanners.filter((item) => item.deviceType === "MOBILE"),
    [sortedBanners]
  );

  useEffect(() => {
    setPages((prev) => ({
      DESKTOP: Math.min(prev.DESKTOP, Math.max(1, Math.ceil(desktopBanners.length / PAGE_SIZE))),
      MOBILE: Math.min(prev.MOBILE, Math.max(1, Math.ceil(mobileBanners.length / PAGE_SIZE)))
    }));
  }, [desktopBanners.length, mobileBanners.length]);

  const selectedBanner = useMemo(
    () => sortedBanners.find((item) => item.id === selectedBannerId) || null,
    [sortedBanners, selectedBannerId]
  );

  const selectedGroup = selectedBanner
    ? selectedBanner.deviceType === "DESKTOP"
      ? desktopBanners
      : mobileBanners
    : [];

  const selectedIndex = selectedBanner
    ? selectedGroup.findIndex((item) => item.id === selectedBanner.id)
    : -1;

  const loadBanners = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/homepage-banners", { cache: "no-store" });
      const payload = (await response.json()) as {
        success: boolean;
        message?: string;
        banners?: HomepageBannerRecord[];
      };

      if (!response.ok || !payload.success) {
        setMessage({ type: "error", text: payload.message || "Unable to fetch homepage banners." });
        setBanners([]);
        return;
      }

      const list = payload.banners || [];
      setBanners(list);
      setTitleDrafts((prev) => {
        const next = { ...prev };
        for (const item of list) next[item.id] = prev[item.id] ?? item.title ?? "";
        return next;
      });
    } catch {
      setMessage({ type: "error", text: "Unable to fetch homepage banners." });
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBanners();
  }, []);

  const mutateBanner = async (
    bannerId: string,
    action: () => Promise<{ ok: boolean; message?: string }>
  ) => {
    setBusyId(bannerId);
    setMessage(null);
    try {
      const result = await action();
      if (!result.ok) {
        setMessage({ type: "error", text: result.message || "Unable to update banner." });
        return;
      }
      setMessage({ type: "success", text: result.message || "Banner updated successfully." });
      await loadBanners();
    } finally {
      setBusyId(null);
    }
  };

  const uploadBanner = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!uploadFile) {
      setMessage({ type: "error", text: "Please choose a banner image first." });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.set("deviceType", uploadDeviceType);
      formData.set("title", uploadTitle);
      formData.set("file", uploadFile);

      const response = await fetch("/api/admin/homepage-banners", { method: "POST", body: formData });
      const payload = (await response.json()) as { success: boolean; message?: string };

      if (!response.ok || !payload.success) {
        setMessage({ type: "error", text: payload.message || "Failed to upload banner." });
        return;
      }

      setMessage({ type: "success", text: "Banner uploaded successfully." });
      setUploadTitle("");
      setUploadFile(null);
      setUploadModalOpen(false);
      await loadBanners();
    } catch {
      setMessage({ type: "error", text: "Failed to upload banner." });
    } finally {
      setSaving(false);
    }
  };

  const openUploadFor = (device: DeviceType) => {
    setUploadDeviceType(device);
    setUploadTitle("");
    setUploadFile(null);
    setUploadModalOpen(true);
  };

  const renderBannerSection = ({
    label,
    device,
    list
  }: {
    label: string;
    device: DeviceType;
    list: HomepageBannerRecord[];
  }) => {
    const page = pages[device] || 1;
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    const pagedList = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
    <section className="card overflow-hidden p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-xl text-stone-900 sm:text-2xl">{label}</h3>
          <p className="mt-1 text-sm text-stone-600">{dimensionNote[device]}</p>
        </div>
        <div className="inline-flex items-center rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700">
          Active {list.filter((item) => item.isActive).length} / {list.length}
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 text-sm text-stone-600">Loading banners...</div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/60 p-8 text-center">
          <p className="text-sm text-stone-600">No banners uploaded yet.</p>
          <button
            type="button"
            onClick={() => openUploadFor(device)}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black"
          >
            <ImagePlus size={15} />
            Upload {device === "DESKTOP" ? "Desktop" : "Mobile"} Banner
          </button>
        </div>
      ) : (
        <div className={`grid gap-4 ${device === "DESKTOP" ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
          {pagedList.map((banner) => (
            <button
              key={banner.id}
              type="button"
              onClick={() => setSelectedBannerId(banner.id)}
              className="group overflow-hidden rounded-2xl border border-stone-200 bg-white text-left transition hover:border-stone-400 hover:shadow-md"
            >
              <div className={`relative w-full ${device === "DESKTOP" ? "aspect-[16/9]" : "aspect-[9/16]"}`}>
                <Image
                  src={banner.publicUrl}
                  alt={banner.title || banner.fileName}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-[1.02]"
                  sizes="(max-width: 1024px) 100vw, 420px"
                />
                <span
                  className={`absolute right-3 top-3 rounded-full border px-2 py-1 text-[11px] font-medium ${
                    banner.isActive
                      ? "border-emerald-200 bg-emerald-100/90 text-emerald-700"
                      : "border-stone-300 bg-white/90 text-stone-600"
                  }`}
                >
                  {banner.isActive ? "Active" : "Hidden"}
                </span>
              </div>
              <div className="p-3">
                <p className="line-clamp-1 text-sm font-medium text-stone-900">{banner.title || banner.fileName}</p>
                <p className="mt-1 text-xs text-stone-500">{banner.width} × {banner.height} • {formatDate(banner.updatedAt)}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="-mx-5 mt-5 sm:-mx-6">
        <AdminPagination
          page={page}
          totalPages={totalPages}
          totalItems={list.length}
          pageSize={PAGE_SIZE}
          currentCount={pagedList.length}
          onPageChange={(nextPage) => setPages((prev) => ({ ...prev, [device]: nextPage }))}
          itemLabel="banners"
        />
      </div>
    </section>
  );
  };

  return (
    <div className="space-y-5">
      <HomepageSectionsManager />

      <section className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl text-stone-900 sm:text-4xl">Homepage Banners & Slider Media</h2>
            <p className="mt-2 max-w-3xl text-sm text-stone-600">
              Manage desktop and mobile hero banners for the homepage slider. Homepage sections above control products,
              categories, signatures, and testimonials shown across the storefront.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openUploadFor("DESKTOP")}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-900 bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black"
          >
            <ImagePlus size={15} />
            Upload New Banner
          </button>
        </div>

        {message ? (
          <p className={`mt-4 text-sm ${message.type === "success" ? "text-emerald-700" : "text-rose-700"}`}>{message.text}</p>
        ) : null}
      </section>

      {renderBannerSection({ label: "Desktop Slider", device: "DESKTOP", list: desktopBanners })}
      {renderBannerSection({ label: "Mobile Slider", device: "MOBILE", list: mobileBanners })}

      {uploadModalOpen ? (
        <ModalShell
          title="Upload New Banner"
          subtitle="Choose banner type and upload image. Ratio rules are enforced automatically."
          onClose={() => {
            if (saving) return;
            setUploadModalOpen(false);
          }}
        >
          <form className="space-y-4" onSubmit={uploadBanner}>
            <div className="flex flex-wrap gap-2">
              <DevicePill
                active={uploadDeviceType === "DESKTOP"}
                icon={<Monitor size={15} />}
                label="Desktop"
                onClick={() => setUploadDeviceType("DESKTOP")}
              />
              <DevicePill
                active={uploadDeviceType === "MOBILE"}
                icon={<Smartphone size={15} />}
                label="Mobile"
                onClick={() => setUploadDeviceType("MOBILE")}
              />
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p className="font-medium">Upload rule</p>
              <p className="mt-1">{dimensionNote[uploadDeviceType]}</p>
            </div>

            <input
              value={uploadTitle}
              onChange={(event) => setUploadTitle(event.target.value)}
              placeholder="Banner title (optional)"
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-800 outline-none transition focus:border-stone-500"
            />

            <label className="inline-flex w-full cursor-pointer items-center rounded-xl border border-dashed border-stone-300 bg-white px-3 py-3 text-sm text-stone-700 transition hover:border-stone-400">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                className="sr-only"
                onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
              />
              <Upload size={15} className="mr-2" />
              {uploadFile ? uploadFile.name : "Choose image"}
            </label>

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                disabled={saving}
                className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-100 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-stone-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-black disabled:opacity-60"
              >
                {saving ? "Uploading..." : "Upload Banner"}
              </button>
            </div>
          </form>
        </ModalShell>
      ) : null}

      {selectedBanner ? (
        <ModalShell
          title={selectedBanner.deviceType === "DESKTOP" ? "Desktop Banner Details" : "Mobile Banner Details"}
          subtitle="Manage title, visibility, order, replacement, and deletion."
          onClose={() => {
            if (busyId) return;
            setSelectedBannerId(null);
          }}
          maxWidth="max-w-5xl"
        >
          <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
              <div className={`relative w-full ${selectedBanner.deviceType === "DESKTOP" ? "aspect-[16/9]" : "aspect-[9/16]"}`}>
                <Image
                  src={selectedBanner.publicUrl}
                  alt={selectedBanner.title || selectedBanner.fileName}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 620px"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-stone-500">Banner Info</p>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${
                      selectedBanner.isActive
                        ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                        : "border-stone-300 bg-stone-100 text-stone-600"
                    }`}
                  >
                    {selectedBanner.isActive ? "Active" : "Hidden"}
                  </span>
                </div>
                <p className="text-sm text-stone-700">{selectedBanner.fileName}</p>
                <p className="mt-1 text-xs text-stone-500">
                  {selectedBanner.width} × {selectedBanner.height} • Updated {formatDate(selectedBanner.updatedAt)}
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <p className="mb-2 text-xs uppercase tracking-[0.16em] text-stone-500">Title</p>
                <div className="flex gap-2">
                  <input
                    value={titleDrafts[selectedBanner.id] ?? selectedBanner.title ?? ""}
                    onChange={(event) => setTitleDrafts((prev) => ({ ...prev, [selectedBanner.id]: event.target.value }))}
                    placeholder="Banner title (optional)"
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none transition focus:border-stone-500"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      void mutateBanner(selectedBanner.id, async () => {
                        const response = await fetch("/api/admin/homepage-banners", {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            action: "update-title",
                            id: selectedBanner.id,
                            title: titleDrafts[selectedBanner.id] ?? ""
                          })
                        });
                        const payload = (await response.json()) as { success: boolean; message?: string };
                        return { ok: response.ok && payload.success, message: payload.message };
                      })
                    }
                    disabled={busyId === selectedBanner.id}
                    className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-700 transition hover:bg-stone-100 disabled:opacity-60"
                  >
                    <Save size={14} /> Save
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <p className="mb-2 text-xs uppercase tracking-[0.16em] text-stone-500">Replace Image</p>
                <label className="inline-flex w-full cursor-pointer items-center rounded-xl border border-dashed border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-700 transition hover:border-stone-400">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    className="sr-only"
                    onChange={(event) =>
                      setReplaceFiles((prev) => ({ ...prev, [selectedBanner.id]: event.target.files?.[0] || null }))
                    }
                  />
                  <Upload size={15} className="mr-2" />
                  {replaceFiles[selectedBanner.id]?.name || "Select new image"}
                </label>
                <button
                  type="button"
                  onClick={() =>
                    void mutateBanner(selectedBanner.id, async () => {
                      const file = replaceFiles[selectedBanner.id];
                      if (!file) return { ok: false, message: "Please choose a replacement file first." };

                      const formData = new FormData();
                      formData.set("id", selectedBanner.id);
                      formData.set("title", titleDrafts[selectedBanner.id] ?? selectedBanner.title ?? "");
                      formData.set("file", file);

                      const response = await fetch("/api/admin/homepage-banners", { method: "PUT", body: formData });
                      const payload = (await response.json()) as { success: boolean; message?: string };
                      if (response.ok && payload.success) {
                        setReplaceFiles((prev) => ({ ...prev, [selectedBanner.id]: null }));
                      }
                      return { ok: response.ok && payload.success, message: payload.message };
                    })
                  }
                  disabled={busyId === selectedBanner.id}
                  className="mt-2 rounded-full border border-stone-900 bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black disabled:opacity-60"
                >
                  Replace Banner
                </button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    void mutateBanner(selectedBanner.id, async () => {
                      const response = await fetch("/api/admin/homepage-banners", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          action: "toggle-active",
                          id: selectedBanner.id,
                          isActive: !selectedBanner.isActive
                        })
                      });
                      const payload = (await response.json()) as { success: boolean; message?: string };
                      return { ok: response.ok && payload.success, message: payload.message };
                    })
                  }
                  disabled={busyId === selectedBanner.id}
                  className={`inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${
                    selectedBanner.isActive
                      ? "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
                      : "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  {selectedBanner.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
                  {selectedBanner.isActive ? "Hide Banner" : "Show Banner"}
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const shouldDelete = await confirm({
                      title: "Delete Banner",
                      message: "Delete this banner? This cannot be undone.",
                      confirmLabel: "Delete Banner",
                      cancelLabel: "Keep Banner",
                      tone: "danger"
                    });
                    if (!shouldDelete) return;
                    void mutateBanner(selectedBanner.id, async () => {
                      const response = await fetch(`/api/admin/homepage-banners?id=${selectedBanner.id}`, { method: "DELETE" });
                      const payload = (await response.json()) as { success: boolean; message?: string };
                      if (response.ok && payload.success) setSelectedBannerId(null);
                      return { ok: response.ok && payload.success, message: payload.message };
                    });
                  }}
                  disabled={busyId === selectedBanner.id}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                >
                  <Trash2 size={15} /> Delete Banner
                </button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() =>
                    void mutateBanner(selectedBanner.id, async () => {
                      const response = await fetch("/api/admin/homepage-banners", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "reorder", id: selectedBanner.id, direction: "up" })
                      });
                      const payload = (await response.json()) as { success: boolean; message?: string };
                      return { ok: response.ok && payload.success, message: payload.message };
                    })
                  }
                  disabled={busyId === selectedBanner.id || selectedIndex <= 0}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:opacity-50"
                >
                  <ArrowUp size={15} /> Move Up
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void mutateBanner(selectedBanner.id, async () => {
                      const response = await fetch("/api/admin/homepage-banners", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "reorder", id: selectedBanner.id, direction: "down" })
                      });
                      const payload = (await response.json()) as { success: boolean; message?: string };
                      return { ok: response.ok && payload.success, message: payload.message };
                    })
                  }
                  disabled={busyId === selectedBanner.id || selectedIndex >= selectedGroup.length - 1}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:opacity-50"
                >
                  <ArrowDown size={15} /> Move Down
                </button>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedBannerId(null)}
                  className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </ModalShell>
      ) : null}
    </div>
  );
}
