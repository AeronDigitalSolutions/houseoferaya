import { promises as fs } from "node:fs";
import path from "node:path";
import { deletePublicUploadFile, getUploadsSubdirectory } from "@/lib/upload-storage";

const CATEGORY_UPLOADS_ROOT = getUploadsSubdirectory("categories");

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function normalizeSegment(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\.[^./\\]+$/, "")
    .replace(/[^a-z0-9-_\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");
}

function getFileExtension(file: File) {
  const sourceExt = path.extname(file.name).toLowerCase();
  if (sourceExt) return sourceExt;
  if (file.type === "image/png") return ".png";
  if (file.type === "image/webp") return ".webp";
  if (file.type === "image/avif") return ".avif";
  return ".jpg";
}

async function getUniqueFileName(targetDir: string, baseName: string, extension: string) {
  let counter = 0;
  while (true) {
    const suffix = counter === 0 ? "" : `-${counter}`;
    const candidate = `${baseName}${suffix}${extension}`;
    const candidatePath = path.join(targetDir, candidate);
    try {
      await fs.access(candidatePath);
      counter += 1;
    } catch {
      return candidate;
    }
  }
}

export async function saveCategoryImage({
  file,
  preferredName
}: {
  file: File;
  preferredName: string;
}) {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("Unsupported file type. Allowed: jpg, png, webp, avif.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image too large. Max size is 8MB.");
  }

  await fs.mkdir(CATEGORY_UPLOADS_ROOT, { recursive: true });
  const extension = getFileExtension(file);
  const baseName = normalizeSegment(preferredName) || `category-${Date.now()}`;
  const fileName = await getUniqueFileName(CATEGORY_UPLOADS_ROOT, baseName, extension);
  const absolutePath = path.join(CATEGORY_UPLOADS_ROOT, fileName);

  const bytes = await file.arrayBuffer();
  await fs.writeFile(absolutePath, Buffer.from(bytes));

  const relativePath = path.posix.join("uploads", "categories", fileName);
  return {
    fileName,
    relativePath,
    publicUrl: `/${relativePath}`
  };
}

export async function deleteCategoryImageByUrl(publicUrl: string | null | undefined) {
  if (!publicUrl || !publicUrl.startsWith("/uploads/categories/")) return;
  await deletePublicUploadFile(publicUrl);
}
