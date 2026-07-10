import { NextResponse } from "next/server";
import { COURTROOM_SKETCH_PROMPT, MULTIPLE_DEFENDANTS_PROMPT } from "@/lib/prompt";
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

  const files = formData.getAll("files").filter((item): item is File => item instanceof File);
  if (files.length < 1 || files.length > 3) {
    return NextResponse.json({ error: "Attach between one and three images." }, { status: 400 });
  }

  for (const file of files) {
    const validation = validateImageFile(file);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }
  }

  const imageDataUris = await Promise.all(files.map(async (file) => {
    const buffer = Buffer.from(await file.arrayBuffer());
    return `data:${file.type};base64,${buffer.toString("base64")}`;
  }));

  const edit = await requestGrokImageEdit({
    apiKey,
    prompt: files.length > 1 ? MULTIPLE_DEFENDANTS_PROMPT : COURTROOM_SKETCH_PROMPT,
    imageDataUris,
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
