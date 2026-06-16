"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, Eye, EyeOff, ImageUp, Save, Trash2 } from "lucide-react";

export type HomepageBannerRecord = {
  id: string;
  deviceType: "DESKTOP" | "MOBILE";
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

type BannerCardProps = {
  banner: HomepageBannerRecord;
  isFirst: boolean;
  isLast: boolean;
  busy: boolean;
  titleDraft: string;
  replaceFile: File | null;
  onTitleDraftChange: (value: string) => void;
  onSaveTitle: () => void;
  onToggleActive: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onPickReplaceFile: (file: File | null) => void;
  onReplaceImage: () => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function BannerCard({
  banner,
  isFirst,
  isLast,
  busy,
  titleDraft,
  replaceFile,
  onTitleDraftChange,
  onSaveTitle,
  onToggleActive,
  onMoveUp,
  onMoveDown,
  onDelete,
  onPickReplaceFile,
  onReplaceImage
}: BannerCardProps) {
  const visibilityTone = banner.isActive
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-stone-300 bg-stone-100 text-stone-600";

  return (
    <article className="card p-4 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[260px_1fr] xl:grid-cols-[320px_1fr]">
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
          <div className={`relative w-full ${banner.deviceType === "DESKTOP" ? "aspect-[16/9]" : "aspect-[9/16]"}`}>
            <Image
              src={banner.publicUrl}
              alt={banner.title || banner.fileName}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 320px"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-stone-500">{banner.deviceType === "DESKTOP" ? "Desktop Banner" : "Mobile Banner"}</p>
              <p className="mt-1 text-sm text-stone-700">{banner.fileName}</p>
              <p className="mt-1 text-xs text-stone-500">
                {banner.width} x {banner.height}px • Updated {formatDate(banner.updatedAt)}
              </p>
            </div>
            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${visibilityTone}`}>
              {banner.isActive ? "Active" : "Hidden"}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              value={titleDraft}
              onChange={(event) => onTitleDraftChange(event.target.value)}
              placeholder="Banner title (optional)"
              className="rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none transition focus:border-stone-500"
            />
            <button
              type="button"
              onClick={onSaveTitle}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-800 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={15} />
              Save Title
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <button
              type="button"
              onClick={onToggleActive}
              disabled={busy}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                banner.isActive
                  ? "border border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
                  : "border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              }`}
            >
              {banner.isActive ? <EyeOff size={15} /> : <Eye size={15} />}
              {banner.isActive ? "Hide Banner" : "Show Banner"}
            </button>

            <button
              type="button"
              onClick={onMoveUp}
              disabled={busy || isFirst}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowUp size={15} />
              Move Up
            </button>

            <button
              type="button"
              onClick={onMoveDown}
              disabled={busy || isLast}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowDown size={15} />
              Move Down
            </button>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-stone-500">Replace Image</p>
            <p className="mt-1 text-xs text-stone-500">Use exact size to pass validation and keep slider quality intact.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
              <label className="inline-flex cursor-pointer items-center rounded-xl border border-dashed border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-700 transition hover:border-stone-400">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  className="sr-only"
                  onChange={(event) => onPickReplaceFile(event.target.files?.[0] || null)}
                />
                <ImageUp size={15} className="mr-2" />
                {replaceFile ? replaceFile.name : "Select new image"}
              </label>
              <button
                type="button"
                onClick={onReplaceImage}
                disabled={busy || !replaceFile}
                className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                Replace
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onDelete}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 size={15} />
              Delete Banner
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
