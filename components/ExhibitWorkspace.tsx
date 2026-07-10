"use client";

import { useCallback, useEffect, useState } from "react";
import { ExhibitChrome } from "@/components/ExhibitChrome";
import { ResultComparison, type ViewMode } from "@/components/ResultComparison";
import { ResultPanel } from "@/components/ResultPanel";
import { UploadPanel } from "@/components/UploadPanel";
import { prepareImageForUpload } from "@/lib/prepare-image-client";
import { getMaxUploadPayloadBytes } from "@/lib/upload-limits";
import { isAllowedMimeType, validateImageFile } from "@/lib/validate-image";

function suggestDownloadName(mimeType: string) {
  if (mimeType === "image/jpeg") return "exhibit-f-courtroom-sketch.jpg";
  if (mimeType === "image/png") return "exhibit-f-courtroom-sketch.png";
  return "exhibit-f-courtroom-sketch.bin";
}

export function ExhibitWorkspace() {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [multipleDefendants, setMultipleDefendants] = useState(false);
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState("exhibit-f-courtroom-sketch.png");
  const [loading, setLoading] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("slider");

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const handlePickFiles = useCallback(async (nextFiles: File[]) => {
    setLocalMessage(null);
    setError(null);
    setResultDataUrl(null);
    setDownloadFileName("exhibit-f-courtroom-sketch.png");

    if (nextFiles.length === 0) {
      setPreparing(false);
      setFiles([]);
      return;
    }

    if (nextFiles.some((file) => !isAllowedMimeType(file.type))) {
      setFiles([]);
      setLocalMessage("Use a JPEG or PNG photo.");
      return;
    }

    setPreparing(true);
    setFiles([]);

    try {
      const budget = Math.floor(getMaxUploadPayloadBytes() / nextFiles.length);
      const prepared = await Promise.all(nextFiles.map((file) => prepareImageForUpload(file, budget)));
      const invalid = prepared.map(validateImageFile).find((v) => !v.ok);
      if (invalid && !invalid.ok) { setLocalMessage(invalid.message); return; }
      setFiles(prepared);
    } catch (e) {
      setFiles([]);
      const message = e instanceof Error ? e.message : "Could not prepare that image.";
      setLocalMessage(message);
    } finally {
      setPreparing(false);
    }
  }, []);

  const generate = useCallback(async () => {
    if (files.length === 0 || preparing) return;
    if (multipleDefendants && files.length < 2) {
      setLocalMessage("Upload at least 2 defendant photos in multiple defendants mode.");
      return;
    }
    setLoading(true);
    setError(null);
    setLocalMessage(null);
    setResultDataUrl(null);

    try {
      const fd = new FormData();
      files.forEach((file) => fd.append("files", file));

      const res = await fetch("/api/sketch", {
        method: "POST",
        body: fd,
      });

      const body = (await res.json()) as {
        error?: string;
        imageBase64?: string;
        mimeType?: string;
      };

      if (!res.ok || body.error || !body.imageBase64 || !body.mimeType) {
        setError(body.error ?? "Something went wrong generating the sketch.");
        return;
      }

      const dataUrl = `data:${body.mimeType};base64,${body.imageBase64}`;
      setResultDataUrl(dataUrl);
      setDownloadFileName(suggestDownloadName(body.mimeType));
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [files, multipleDefendants, preparing]);

  const combinedError = localMessage ?? error;
  const canGenerate = files.length >= (multipleDefendants ? 2 : 1) && !loading && !preparing;
  const showComparison = Boolean(resultDataUrl && previewUrls[0]);

  return (
    <ExhibitChrome>
      {showComparison ? (
        <ResultComparison
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          originalUrl={previewUrls[0] as string}
          resultUrl={resultDataUrl as string}
          downloadFileName={downloadFileName}
          onUploadFile={(file) => handlePickFiles(file ? [file] : [])}
          onRegenerate={generate}
          canRegenerate={canGenerate}
          loading={loading}
          preparing={preparing}
          error={combinedError}
        />
      ) : (
        <div className="grid min-w-0 gap-5 md:grid-cols-2 md:gap-6">
          <div className="space-y-3">
            <label className="flex items-center gap-3 rounded-xl border border-margin/70 bg-white/70 px-4 py-3 font-sans text-sm font-semibold text-ink">
              <input type="checkbox" checked={multipleDefendants} onChange={(e) => { setMultipleDefendants(e.target.checked); setFiles([]); setResultDataUrl(null); setLocalMessage(null); }} />
              Multiple defendants (upload 2–3 people)
            </label>
            <UploadPanel previewUrls={previewUrls} multiple={multipleDefendants} preparing={preparing} onFiles={handlePickFiles} />
          </div>
          <ResultPanel
            resultDataUrl={resultDataUrl}
            downloadFileName={downloadFileName}
            loading={loading}
            error={combinedError}
            onGenerate={generate}
            canGenerate={canGenerate}
            hasUpload={previewUrls.length > 0}
          />
        </div>
      )}
    </ExhibitChrome>
  );
}
