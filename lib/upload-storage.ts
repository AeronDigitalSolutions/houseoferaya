import { promises as fs } from "node:fs";
import path from "node:path";

const DEFAULT_UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

function normalizePublicUploadPath(publicPath: string) {
  const [pathname] = publicPath.split("?");
  const relative = pathname.replace(/^\/+/, "");
  if (!relative.startsWith("uploads/")) {
    return null;
  }

  const absolute = path.resolve(getUploadsRoot(), relative.replace(/^uploads\//, ""));
  const uploadsRoot = getUploadsRoot();
  if (!absolute.startsWith(`${uploadsRoot}${path.sep}`) && absolute !== uploadsRoot) {
    return null;
  }

  return absolute;
}

export function getUploadsRoot() {
  const configuredRoot = process.env.APP_UPLOADS_ROOT?.trim();
  return configuredRoot ? path.resolve(configuredRoot) : DEFAULT_UPLOADS_ROOT;
}

export function getUploadsSubdirectory(...segments: string[]) {
  return path.join(getUploadsRoot(), ...segments);
}

export async function publicUploadFileExists(publicPath: string) {
  const absolutePath = normalizePublicUploadPath(publicPath);
  if (!absolutePath) return false;

  try {
    const stats = await fs.stat(absolutePath);
    return stats.isFile();
  } catch {
    return false;
  }
}

export async function deletePublicUploadFile(publicPath: string) {
  const absolutePath = normalizePublicUploadPath(publicPath);
  if (!absolutePath) return;

  try {
    await fs.unlink(absolutePath);
  } catch {
    // Ignore missing files to keep cleanup safe.
  }
}
