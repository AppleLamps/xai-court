const MAX_DECODE_LONG_EDGE = 8192;
const MIN_ENCODE_LONG_EDGE = 320;
const QUALITY_STEPS = [0.92, 0.88, 0.82, 0.76, 0.7, 0.64, 0.58, 0.52, 0.46, 0.4, 0.35] as const;

function scaledDimensions(width: number, height: number, longEdgeCap: number) {
  const longEdge = Math.max(width, height);
  if (longEdge <= longEdgeCap) return { width: Math.round(width), height: Math.round(height) };
  const scale = longEdgeCap / longEdge;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

async function rasterToJpegBlob(
  bitmap: ImageBitmap,
  drawW: number,
  drawH: number,
  quality: number,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = drawW;
  canvas.height = drawH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create canvas context.");
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, drawW, drawH);
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), "image/jpeg", quality);
  });
  if (!blob) {
    throw new Error("JPEG encoding produced an empty blob.");
  }
  return blob;
}

function sanitizeBaseName(name: string) {
  const base = name.replace(/\.[^.]+$/, "").trim();
  const safe = base.replace(/[^\w\-]+/g, "-").slice(0, 80);
  return safe || "photo";
}

/**
 * Fits an image within the multipart payload budget via dimension cap + iterative JPEG quality/scale.
 */
export async function prepareImageForUpload(raw: File, maxPayloadBytes: number): Promise<File> {
  if (!/^image\/(jpeg|png)$/i.test(raw.type)) {
    throw new Error("Only JPEG or PNG images are supported.");
  }

  const bitmap = await createImageBitmap(raw);
  try {
    const dimsOk = Math.max(bitmap.width, bitmap.height) <= MAX_DECODE_LONG_EDGE;
    const sizeOk = raw.size <= maxPayloadBytes;
    if (dimsOk && sizeOk) {
      return raw;
    }

    let cap = MAX_DECODE_LONG_EDGE;

    while (cap >= MIN_ENCODE_LONG_EDGE) {
      const { width: dw, height: dh } = scaledDimensions(bitmap.width, bitmap.height, cap);
      for (const quality of QUALITY_STEPS) {
        const blob = await rasterToJpegBlob(bitmap, dw, dh, quality);
        if (blob.size <= maxPayloadBytes) {
          const outName = `${sanitizeBaseName(raw.name)}-exhibit.jpg`;
          return new File([blob], outName, { type: "image/jpeg", lastModified: Date.now() });
        }
      }
      cap = Math.floor(cap * 0.82);
    }

    throw new Error(
      "Could not shrink that photo enough to upload — try cropping or exporting a lighter JPEG.",
    );
  } finally {
    bitmap.close();
  }
}
