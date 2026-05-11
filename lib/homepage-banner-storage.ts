import { promises as fs } from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";

export type HomepageBannerDevice = "DESKTOP" | "MOBILE";

type ExpectedDimensions = {
  ratioWidth: number;
  ratioHeight: number;
  label: string;
  orientation: "landscape" | "portrait";
};

const BANNERS_ROOT = path.join(process.cwd(), "public", "uploads", "homepage-banners");

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;

export const expectedBannerDimensions: Record<HomepageBannerDevice, ExpectedDimensions> = {
  DESKTOP: { ratioWidth: 16, ratioHeight: 9, label: "16:9", orientation: "landscape" },
  MOBILE: { ratioWidth: 9, ratioHeight: 16, label: "9:16", orientation: "portrait" }
};

const RATIO_TOLERANCE = 0.01;

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

function getDeviceDirectoryName(deviceType: HomepageBannerDevice) {
  return deviceType === "DESKTOP" ? "desktop" : "mobile";
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

async function ensureBannerDirectory(deviceType: HomepageBannerDevice) {
  const deviceDir = getDeviceDirectoryName(deviceType);
  const absoluteDir = path.join(BANNERS_ROOT, deviceDir);
  await fs.mkdir(absoluteDir, { recursive: true });
  return { absoluteDir, deviceDir };
}

export async function saveHomepageBannerImage({
  file,
  deviceType,
  preferredName
}: {
  file: File;
  deviceType: HomepageBannerDevice;
  preferredName?: string;
}) {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("Unsupported file type. Allowed: jpg, png, webp, avif.");
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image too large. Max size is 12MB.");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const dimensions = imageSize(buffer);
  const width = dimensions.width ?? 0;
  const height = dimensions.height ?? 0;

  if (!width || !height) {
    throw new Error("Unable to read image dimensions. Please upload a valid image.");
  }

  const expected = expectedBannerDimensions[deviceType];
  const isOrientationValid =
    expected.orientation === "landscape" ? width > height : height > width;

  const uploadedRatio = width / height;
  const requiredRatio = expected.ratioWidth / expected.ratioHeight;
  const ratioDiff = Math.abs(uploadedRatio - requiredRatio);

  if (!isOrientationValid || ratioDiff > RATIO_TOLERANCE) {
    throw new Error(
      `Invalid image ratio. ${deviceType === "DESKTOP" ? "Desktop" : "Mobile"} banners must use ${expected.label} (${expected.orientation}).`
    );
  }

  const { absoluteDir, deviceDir } = await ensureBannerDirectory(deviceType);
  const extension = getFileExtension(file, preferredName);
  const baseName =
    normalizeSegment(preferredName || "") ||
    normalizeSegment(file.name) ||
    `${deviceDir}-banner-${Date.now()}`;

  const fileName = await getUniqueFileName(absoluteDir, baseName, extension);
  const absolutePath = path.join(absoluteDir, fileName);

  await fs.writeFile(absolutePath, buffer);

  const relativePath = path.posix.join("uploads", "homepage-banners", deviceDir, fileName);
  return {
    fileName,
    width,
    height,
    relativePath,
    publicUrl: `/${relativePath}`
  };
}

export async function deleteHomepageBannerImageByUrl(publicUrl: string) {
  const safePath = publicUrl.replace(/^\/+/, "");
  if (!safePath.startsWith("uploads/homepage-banners/")) return;
  const absolutePath = path.join(process.cwd(), "public", safePath);
  await fs.unlink(absolutePath);
}

export function getVersionedBannerUrl(publicUrl: string, updatedAt: Date | string) {
  const stamp = new Date(updatedAt).getTime();
  if (!Number.isFinite(stamp)) return publicUrl;
  const separator = publicUrl.includes("?") ? "&" : "?";
  return `${publicUrl}${separator}v=${stamp}`;
}
