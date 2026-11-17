import path from "path";
import { fileURLToPath } from "url";

// Determine the server directory
const configDirectory = path.dirname(
  fileURLToPath(import.meta.url)
);

// Configure upload storage
export const uploadDirectory = path.resolve(
  configDirectory,
  "../../uploads"
);

export const uploadUrl = "/api/uploads";

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp"
]);