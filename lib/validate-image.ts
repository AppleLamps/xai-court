import { XAI_MAX_IMAGE_BYTES } from "@/lib/upload-limits";

export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export function isAllowedMimeType(m: string): m is AllowedMimeType {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(m);
}

export function validateImageFile(file: File): { ok: true } | { ok: false; message: string } {
  if (!isAllowedMimeType(file.type)) {
    return { ok: false, message: "Use a JPEG or PNG photo." };
  }
  if (file.size > XAI_MAX_IMAGE_BYTES) {
    return {
      ok: false,
      message: `After optimization the file must stay under ${Math.round(XAI_MAX_IMAGE_BYTES / (1024 * 1024))} MiB (xAI limit).`,
    };
  }
  if (file.size === 0) {
    return { ok: false, message: "That file is empty." };
  }
  return { ok: true };
}
