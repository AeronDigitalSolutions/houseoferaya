"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ImagePlus, Monitor, Smartphone } from "lucide-react";
import { BannerCard, type HomepageBannerRecord } from "@/components/admin/homepage-media/BannerCard";

type DeviceType = "DESKTOP" | "MOBILE";
type Message = { type: "success" | "error"; text: string } | null;

const dimensionNote: Record<DeviceType, string> = {
  DESKTOP: "Desktop banners must follow a 16:9 ratio (landscape).",
  MOBILE: "Mobile banners must follow a 9:16 ratio (portrait)."
};

export function HomepageMediaManager() {
  const [deviceType, setDeviceType] = useState<DeviceType>("DESKTOP");
  const [banners, setBanners] = useState<HomepageBannerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [titleDrafts, setTitleDrafts] = useState<Record<string, string>>({});
  const [replaceFiles, setReplaceFiles] = useState<Record<string, File | null>>({});

  const visibleBanners = useMemo(
    () =>
      banners
        .filter((item) => item.deviceType === deviceType)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [banners, deviceType]
  );

  const activeCount = useMemo(() => visibleBanners.filter((item) => item.isActive).length, [visibleBanners]);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/homepage-banners?deviceType=${deviceType}`, { cache: "no-store" });
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
      setTitleDrafts(Object.fromEntries(list.map((item) => [item.id, item.title || ""])));
      setReplaceFiles({});
    } catch {
      setMessage({ type: "error", text: "Unable to fetch homepage banners." });
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBanners();
  }, [deviceType]);

  const uploadBanner = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newFile) {
      setMessage({ type: "error", text: "Please choose a banner image first." });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.set("deviceType", deviceType);
      formData.set("title", newTitle);
      formData.set("file", newFile);

      const response = await fetch("/api/admin/homepage-banners", { method: "POST", body: formData });
      const payload = (await response.json()) as { success: boolean; message?: string };

      if (!response.ok || !payload.success) {
        setMessage({ type: "error", text: payload.message || "Failed to upload banner." });
        return;
      }

      setMessage({ type: "success", text: "Banner uploaded successfully." });
      setNewTitle("");
      setNewFile(null);
      await loadBanners();
    } catch {
      setMessage({ type: "error", text: "Failed to upload banner." });
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="space-y-5">
      <section className="card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl text-stone-900 sm:text-4xl">Homepage Banners & Slider Media</h2>
            <p className="mt-2 max-w-3xl text-sm text-stone-600">
              Manage desktop and mobile hero banners for the homepage slider. Uploaded images are saved directly in
              <code className="ml-1 rounded bg-stone-100 px-1.5 py-0.5 text-[12px] text-stone-700">public/uploads/homepage-banners</code>.
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
            Active in this tab: <span className="font-semibold text-stone-900">{activeCount}</span> / {visibleBanners.length}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setDeviceType("DESKTOP")}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
              deviceType === "DESKTOP"
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
            }`}
          >
            <Monitor size={16} />
            Desktop Slider
          </button>
          <button
            type="button"
            onClick={() => setDeviceType("MOBILE")}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
              deviceType === "MOBILE"
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
            }`}
          >
            <Smartphone size={16} />
            Mobile Slider
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p className="font-medium">Upload rule</p>
          <p className="mt-1">{dimensionNote[deviceType]}</p>
        </div>
      </section>

      <section className="card p-5 sm:p-6">
        <h3 className="font-heading text-2xl text-stone-900">Upload New Banner</h3>
        <p className="mt-1 text-sm text-stone-600">Keep titles short for easy internal identification. Title is optional.</p>
        <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] lg:grid-cols-[1fr_1fr_auto]" onSubmit={uploadBanner}>
          <input
            value={newTitle}
            onChange={(event) => setNewTitle(event.target.value)}
            placeholder="Banner title (optional)"
            className="rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none transition focus:border-stone-500"
          />

          <label className="inline-flex cursor-pointer items-center rounded-xl border border-dashed border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-700 transition hover:border-stone-400">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              className="sr-only"
              onChange={(event) => setNewFile(event.target.files?.[0] || null)}
            />
            <ImagePlus size={15} className="mr-2" />
            {newFile ? newFile.name : "Choose image"}
          </label>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Uploading..." : "Upload Banner"}
          </button>
        </form>
      </section>

      {message ? (
        <p className={`text-sm ${message.type === "success" ? "text-emerald-700" : "text-rose-700"}`}>{message.text}</p>
      ) : null}

      <section className="space-y-3">
        {loading ? (
          <div className="card p-5 text-sm text-stone-600">Loading banners...</div>
        ) : visibleBanners.length === 0 ? (
          <div className="card p-6 text-sm text-stone-600">
            No banners added for this view yet. Upload the first {deviceType === "DESKTOP" ? "desktop" : "mobile"} banner.
          </div>
        ) : (
          visibleBanners.map((banner, index) => (
            <BannerCard
              key={banner.id}
              banner={banner}
              isFirst={index === 0}
              isLast={index === visibleBanners.length - 1}
              busy={busyId === banner.id}
              titleDraft={titleDrafts[banner.id] ?? ""}
              replaceFile={replaceFiles[banner.id] || null}
              onTitleDraftChange={(value) => {
                setTitleDrafts((prev) => ({ ...prev, [banner.id]: value }));
              }}
              onSaveTitle={() =>
                void mutateBanner(banner.id, async () => {
                  const response = await fetch("/api/admin/homepage-banners", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      action: "update-title",
                      id: banner.id,
                      title: titleDrafts[banner.id] ?? ""
                    })
                  });
                  const payload = (await response.json()) as { success: boolean; message?: string };
                  return { ok: response.ok && payload.success, message: payload.message };
                })
              }
              onToggleActive={() =>
                void mutateBanner(banner.id, async () => {
                  const response = await fetch("/api/admin/homepage-banners", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      action: "toggle-active",
                      id: banner.id,
                      isActive: !banner.isActive
                    })
                  });
                  const payload = (await response.json()) as { success: boolean; message?: string };
                  return { ok: response.ok && payload.success, message: payload.message };
                })
              }
              onMoveUp={() =>
                void mutateBanner(banner.id, async () => {
                  const response = await fetch("/api/admin/homepage-banners", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      action: "reorder",
                      id: banner.id,
                      direction: "up"
                    })
                  });
                  const payload = (await response.json()) as { success: boolean; message?: string };
                  return { ok: response.ok && payload.success, message: payload.message };
                })
              }
              onMoveDown={() =>
                void mutateBanner(banner.id, async () => {
                  const response = await fetch("/api/admin/homepage-banners", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      action: "reorder",
                      id: banner.id,
                      direction: "down"
                    })
                  });
                  const payload = (await response.json()) as { success: boolean; message?: string };
                  return { ok: response.ok && payload.success, message: payload.message };
                })
              }
              onDelete={() => {
                if (!window.confirm("Delete this banner? This cannot be undone.")) return;
                void mutateBanner(banner.id, async () => {
                  const response = await fetch(`/api/admin/homepage-banners?id=${banner.id}`, {
                    method: "DELETE"
                  });
                  const payload = (await response.json()) as { success: boolean; message?: string };
                  return { ok: response.ok && payload.success, message: payload.message };
                });
              }}
              onPickReplaceFile={(file) => {
                setReplaceFiles((prev) => ({ ...prev, [banner.id]: file }));
              }}
              onReplaceImage={() =>
                void mutateBanner(banner.id, async () => {
                  const file = replaceFiles[banner.id];
                  if (!file) return { ok: false, message: "Please choose a replacement file first." };

                  const formData = new FormData();
                  formData.set("id", banner.id);
                  formData.set("title", titleDrafts[banner.id] ?? "");
                  formData.set("file", file);

                  const response = await fetch("/api/admin/homepage-banners", {
                    method: "PUT",
                    body: formData
                  });
                  const payload = (await response.json()) as { success: boolean; message?: string };
                  if (response.ok && payload.success) {
                    setReplaceFiles((prev) => ({ ...prev, [banner.id]: null }));
                  }
                  return { ok: response.ok && payload.success, message: payload.message };
                })
              }
            />
          ))
        )}
      </section>
    </div>
  );
}
