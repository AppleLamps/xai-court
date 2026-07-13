"use client";

import { useCallback, useEffect, useId, useState } from "react";
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
  const defendantModeId = useId();
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
        <div className="space-y-4">
          <div className="fade-rise flex flex-wrap items-center justify-between gap-3 rounded-xl border border-margin/70 bg-white/60 px-3 py-2 shadow-sm">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-stamp">
                Case intake
              </p>
              <p className="mt-0.5 font-sans text-xs text-dossier">
                {multipleDefendants
                  ? "Multiple defendants — upload 2 to 3 photographs."
                  : "Single defendant — upload one photograph."}
              </p>
            </div>
            <DefendantModeToggle
              name={defendantModeId}
              multiple={multipleDefendants}
              disabled={loading}
              onChange={(value) => {
                setMultipleDefendants(value);
                setFiles([]);
                setResultDataUrl(null);
                setLocalMessage(null);
              }}
            />
          </div>

          <div className="fade-rise-delay relative grid min-w-0 gap-5 md:grid-cols-2 md:items-stretch md:gap-6">
            <UploadPanel
              previewUrls={previewUrls}
              multiple={multipleDefendants}
              preparing={preparing}
              locked={loading}
              onFiles={handlePickFiles}
            />
            <ResultPanel
              resultDataUrl={resultDataUrl}
              downloadFileName={downloadFileName}
              loading={loading}
              error={combinedError}
              onGenerate={generate}
              canGenerate={canGenerate}
              hasUpload={previewUrls.length > 0}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:flex"
            >
              <span className="flex size-9 items-center justify-center rounded-full border border-margin/70 bg-paper shadow-dossier">
                <svg viewBox="0 0 24 24" fill="none" className="size-4 text-stamp">
                  <path
                    d="M5 12h14m0 0-5-5m5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      )}
    </ExhibitChrome>
  );
}

function DefendantModeToggle({
  name,
  multiple,
  disabled,
  onChange,
}: {
  name: string;
  multiple: boolean;
  disabled?: boolean;
  onChange: (multiple: boolean) => void;
}) {
  const options = [
    { value: false, label: "Solo" },
    { value: true, label: "Multiple (2–3)" },
  ] as const;

  return (
    <div
      role="radiogroup"
      aria-label="Number of defendants"
      className={`inline-flex items-center gap-1 rounded-lg border border-margin/70 bg-white/80 p-1 font-sans text-xs shadow-sm ${disabled ? "opacity-60" : ""}`}
    >
      {options.map((opt) => {
        const active = multiple === opt.value;
        return (
          <label
            key={String(opt.value)}
            className={`rounded-md px-3 py-1.5 font-semibold transition focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-stamp ${
              disabled ? "cursor-not-allowed" : "cursor-pointer"
            } ${active ? "bg-ink text-paper shadow-sm" : "text-dossier hover:bg-paper/70 hover:text-ink"}`}
          >
            <input
              type="radio"
              name={name}
              disabled={disabled}
              checked={active}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}
