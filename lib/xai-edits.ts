const XAI_EDITS_URL = "https://api.x.ai/v1/images/edits";

type XaiErrorBody = {
  error?: { message?: string; code?: string };
};

function extractErrorMessage(json: unknown): string | undefined {
  if (!json || typeof json !== "object") return;
  const err = (json as XaiErrorBody).error;
  if (err && typeof err.message === "string" && err.message.length > 0) {
    return err.message;
  }
  return;
}

function extractImageUrlOrData(json: unknown): string | undefined {
  if (!json || typeof json !== "object") return;
  const data = (json as { data?: unknown }).data;
  if (!Array.isArray(data) || data.length === 0) return;
  const first = data[0];
  if (!first || typeof first !== "object") return;
  const row = first as { url?: unknown; b64_json?: unknown };
  if (typeof row.url === "string" && row.url.length > 0) return row.url;
  if (typeof row.b64_json === "string" && row.b64_json.length > 0) {
    return `data:image/png;base64,${row.b64_json}`;
  }
  return;
}

export type GrokEditResult =
  | { ok: true; imageUrlOrDataUri: string }
  | { ok: false; message: string; status?: number; code?: string };

export async function requestGrokImageEdit(input: {
  apiKey: string;
  prompt: string;
  imageDataUris: string[];
}): Promise<GrokEditResult> {
  const res = await fetch(XAI_EDITS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${input.apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-imagine-image-quality",
      prompt: input.prompt,
      ...(input.imageDataUris.length === 1
        ? { image: { url: input.imageDataUris[0], type: "image_url" } }
        : { images: input.imageDataUris.map((url) => ({ url, type: "image_url" })) }),
    }),
  });

  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return {
      ok: false,
      message: "Could not parse response from xAI.",
      status: res.status,
    };
  }

  if (!res.ok) {
    return {
      ok: false,
      message: extractErrorMessage(json) ?? `Request failed (${res.status})`,
      status: res.status,
      code:
        json && typeof json === "object"
          ? (json as XaiErrorBody).error?.code
          : undefined,
    };
  }

  const imageUrlOrDataUri = extractImageUrlOrData(json);
  if (!imageUrlOrDataUri) {
    return {
      ok: false,
      message: "No image was returned. Try another photo or try again.",
      status: res.status,
    };
  }

  return { ok: true, imageUrlOrDataUri };
}

export async function fetchImageAsBase64(imageUrlOrDataUri: string): Promise<{
  base64: string;
  mimeType: string;
}> {
  if (imageUrlOrDataUri.startsWith("data:")) {
    const match = /^data:([^;]+);base64,(.+)$/i.exec(imageUrlOrDataUri);
    if (!match) {
      throw new Error("Invalid data URI from image response.");
    }
    return { mimeType: match[1], base64: match[2] };
  }

  const imgRes = await fetch(imageUrlOrDataUri);
  if (!imgRes.ok) {
    throw new Error("Could not download the generated image.");
  }
  const mimeType = imgRes.headers.get("content-type") ?? "image/png";
  const buf = Buffer.from(await imgRes.arrayBuffer());
  return { base64: buf.toString("base64"), mimeType: mimeType.split(";")[0] };
}
