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
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState("exhibit-f-courtroom-sketch.png");
  const [loading, setLoading] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("slider");

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handlePickFile = useCallback(async (next: File | null) => {
    setLocalMessage(null);
    setError(null);
    setResultDataUrl(null);
    setDownloadFileName("exhibit-f-courtroom-sketch.png");

    if (!next) {
      setPreparing(false);
      setFile(null);
      return;
    }

    if (!isAllowedMimeType(next.type)) {
      setFile(null);
      setLocalMessage("Use a JPEG or PNG photo.");
      return;
    }

    setPreparing(true);
    setFile(null);

    try {
      const budget = getMaxUploadPayloadBytes();
      const prepared = await prepareImageForUpload(next, budget);
      const v = validateImageFile(prepared);
      if (!v.ok) {
        setFile(null);
        setLocalMessage(v.message);
        return;
      }
      setFile(prepared);
    } catch (e) {
      setFile(null);
      const message = e instanceof Error ? e.message : "Could not prepare that image.";
      setLocalMessage(message);
    } finally {
      setPreparing(false);
    }
  }, []);

  const generate = useCallback(async () => {
    if (!file || preparing) return;
    const v = validateImageFile(file);
    if (!v.ok) {
      setLocalMessage(v.message);
      return;
    }
    setLoading(true);
    setError(null);
    setLocalMessage(null);
    setResultDataUrl(null);

    try {
      const fd = new FormData();
      fd.set("file", file);

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
  }, [file, preparing]);

  const combinedError = localMessage ?? error;
  const canGenerate = Boolean(file) && !loading && !preparing;
  const showComparison = Boolean(resultDataUrl && previewUrl);

  return (
    <ExhibitChrome>
      {showComparison ? (
        <ResultComparison
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          originalUrl={previewUrl as string}
          resultUrl={resultDataUrl as string}
          downloadFileName={downloadFileName}
          onUploadFile={handlePickFile}
          onRegenerate={generate}
          canRegenerate={canGenerate}
          loading={loading}
          preparing={preparing}
          error={combinedError}
        />
      ) : (
        <div className="grid min-w-0 gap-5 md:grid-cols-2 md:gap-6">
          <UploadPanel previewUrl={previewUrl} preparing={preparing} onFile={handlePickFile} />
          <ResultPanel
            resultDataUrl={resultDataUrl}
            downloadFileName={downloadFileName}
            loading={loading}
            error={combinedError}
            onGenerate={generate}
            canGenerate={canGenerate}
            hasUpload={Boolean(previewUrl)}
          />
        </div>
      )}
    </ExhibitChrome>
  );
}
