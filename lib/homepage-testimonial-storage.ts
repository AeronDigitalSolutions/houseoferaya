import { promises as fs } from "node:fs";
import path from "node:path";
import { getUploadsSubdirectory, deletePublicUploadFile } from "@/lib/upload-storage";

const TESTIMONIAL_UPLOADS_ROOT = getUploadsSubdirectory("homepage-testimonials");
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

function getFileExtension(file: File, preferredName?: string) {
  const preferredExt = preferredName ? path.extname(preferredName).toLowerCase() : "";
  if (preferredExt) return preferredExt;

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

export async function saveHomepageTestimonialImage({
  file,
  preferredName
}: {
  file: File;
  preferredName?: string;
}) {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("Unsupported file type. Allowed: jpg, png, webp, avif.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image too large. Max size is 8MB.");
  }

  await fs.mkdir(TESTIMONIAL_UPLOADS_ROOT, { recursive: true });
  const extension = getFileExtension(file, preferredName);
  const baseName =
    normalizeSegment(preferredName || "") ||
    normalizeSegment(file.name) ||
    `testimonial-${Date.now()}`;
  const fileName = await getUniqueFileName(TESTIMONIAL_UPLOADS_ROOT, baseName, extension);
  const absolutePath = path.join(TESTIMONIAL_UPLOADS_ROOT, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(absolutePath, buffer);

  const relativePath = path.posix.join("uploads", "homepage-testimonials", fileName);
  return {
    fileName,
    relativePath,
    publicUrl: `/${relativePath}`
  };
}

export async function deleteHomepageTestimonialImageByUrl(publicUrl: string | null | undefined) {
  if (!publicUrl) return;
  await deletePublicUploadFile(publicUrl);
}
