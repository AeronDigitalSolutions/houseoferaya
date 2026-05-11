import { promises as fs } from "node:fs";
import path from "node:path";

const PRODUCT_UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads", "products");

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif"
]);

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB per image

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

function getFileExtension(file: File, preferredName?: string) {
  const preferredExt = preferredName ? path.extname(preferredName).toLowerCase() : "";
  if (preferredExt) {
    return preferredExt;
  }

  const sourceExt = path.extname(file.name).toLowerCase();
  if (sourceExt) {
    return sourceExt;
  }

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

export async function ensureProductImageDirectory(productSlug: string) {
  const safeSlug = normalizeSegment(productSlug) || "unassigned";
  const absoluteDir = path.join(PRODUCT_UPLOADS_ROOT, safeSlug);
  await fs.mkdir(absoluteDir, { recursive: true });
  return { safeSlug, absoluteDir };
}

export async function saveProductImage({
  file,
  productSlug,
  preferredName
}: {
  file: File;
  productSlug: string;
  preferredName?: string;
}) {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("Unsupported file type. Allowed: jpg, png, webp, avif.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image too large. Max size is 10MB.");
  }

  const { safeSlug, absoluteDir } = await ensureProductImageDirectory(productSlug);
  const extension = getFileExtension(file, preferredName);

  const rawBase =
    normalizeSegment(preferredName || "") ||
    normalizeSegment(file.name) ||
    `product-image-${Date.now()}`;

  const fileName = await getUniqueFileName(absoluteDir, rawBase, extension);
  const absolutePath = path.join(absoluteDir, fileName);

  const bytes = await file.arrayBuffer();
  await fs.writeFile(absolutePath, Buffer.from(bytes));

  const relativePath = path.posix.join("uploads", "products", safeSlug, fileName);
  return {
    fileName,
    safeSlug,
    relativePath,
    publicUrl: `/${relativePath}`
  };
}

export async function listProductImages(productSlug: string) {
  const { safeSlug, absoluteDir } = await ensureProductImageDirectory(productSlug);
  const entries = await fs.readdir(absoluteDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => ({
      fileName: entry.name,
      publicUrl: `/uploads/products/${safeSlug}/${entry.name}`
    }))
    .sort((a, b) => a.fileName.localeCompare(b.fileName));
}

export async function deleteProductImage(productSlug: string, fileName: string) {
  const safeFileName = path.basename(fileName);
  const { absoluteDir } = await ensureProductImageDirectory(productSlug);
  const filePath = path.join(absoluteDir, safeFileName);
  await fs.unlink(filePath);
}

