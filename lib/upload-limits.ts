/** Matches xAI image input documentation (JPEG/PNG, max ~20 MiB). */
export const XAI_MAX_IMAGE_BYTES = 20 * 1024 * 1024;

const VERCEL_HOBBY_SAFE_BYTES = Math.floor(4.5 * 1024 * 1024);

function clampToXaiCap(n: number): number {
  return Math.min(Math.floor(n), XAI_MAX_IMAGE_BYTES);
}

/** Client-side multipart payload target (compression runs in the browser to fit). */
export function getMaxUploadPayloadBytes(): number {
  const raw = process.env.NEXT_PUBLIC_MAX_UPLOAD_BYTES;
  if (raw !== undefined && String(raw).trim() !== "") {
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed > 0) {
      return clampToXaiCap(parsed);
    }
  }
  if (process.env.VERCEL === "1") {
    return Math.min(VERCEL_HOBBY_SAFE_BYTES, XAI_MAX_IMAGE_BYTES);
  }
  return XAI_MAX_IMAGE_BYTES;
}
