import { NextResponse } from "next/server";
import { COURTROOM_SKETCH_PROMPT } from "@/lib/prompt";
import { fetchImageAsBase64, requestGrokImageEdit } from "@/lib/xai-edits";
import { validateImageFile } from "@/lib/validate-image";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const apiKey = process.env.XAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server missing XAI_API_KEY. Add it to environment variables." },
      { status: 500 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Request body was too large or not multipart form data." },
      { status: 413 },
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Attach a single image as `file`." }, { status: 400 });
  }

  const validation = validateImageFile(file);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.message }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const imageDataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  const edit = await requestGrokImageEdit({
    apiKey,
    prompt: COURTROOM_SKETCH_PROMPT,
    imageDataUri,
  });

  if (!edit.ok) {
    const status =
      edit.status && edit.status >= 400 && edit.status < 600 ? edit.status : 502;
    return NextResponse.json({ error: edit.message, code: edit.code }, { status });
  }

  try {
    const { base64, mimeType } = await fetchImageAsBase64(edit.imageUrlOrDataUri);
    return NextResponse.json({ imageBase64: base64, mimeType });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Download failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
