"use client";

import { useId, useRef } from "react";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { ResultPanel } from "@/components/ResultPanel";
import { UploadPanel } from "@/components/UploadPanel";

export type ViewMode = "slider" | "sideBySide";

type ResultComparisonProps = {
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  originalUrl: string;
  resultUrl: string;
  downloadFileName: string;
  onUploadFile: (file: File | null) => void | Promise<void>;
  onRegenerate: () => void;
  canRegenerate: boolean;
  loading?: boolean;
  preparing: boolean;
  error?: string | null;
};

export function ResultComparison({
  viewMode,
  onChangeViewMode,
  originalUrl,
  resultUrl,
  downloadFileName,
  onUploadFile,
  onRegenerate,
  canRegenerate,
  loading,
  preparing,
  error,
}: ResultComparisonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const groupId = useId();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-sans text-xs text-dossier">
          Drag the divider to reveal the original. Or switch to a side-by-side view.
        </p>
        <ViewModeToggle name={groupId} mode={viewMode} onChange={onChangeViewMode} />
      </div>

      {viewMode === "slider" ? (
        <div className="space-y-4">
          <div className="mx-auto w-full max-w-xl">
            <BeforeAfterSlider
              beforeUrl={originalUrl}
              afterUrl={resultUrl}
              beforeLabel="Exhibit A"
              afterLabel="Exhibit F"
            />
          </div>
          <div className="mx-auto flex w-full max-w-xl flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={preparing || loading}
              className="inline-flex items-center justify-center rounded-lg border border-margin bg-white px-3 py-1.5 font-sans text-xs font-semibold text-ink shadow-sm transition hover:border-washblue/55 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Replace photograph
            </button>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onRegenerate}
                disabled={!canRegenerate}
                className="inline-flex items-center justify-center rounded-lg border border-margin/60 bg-paper px-3 py-1.5 font-sans text-xs font-semibold text-dossier transition hover:border-washblue/55 hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sketching…" : "Sketch again"}
              </button>
              <a
                href={resultUrl}
                download={downloadFileName}
                className="inline-flex items-center justify-center rounded-lg border border-margin bg-white px-3 py-1.5 font-sans text-xs font-semibold text-ink shadow-sm transition hover:border-washblue/55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp"
              >
                Download exhibit
              </a>
            </div>
          </div>
          {error ? (
            <div
              role="alert"
              className="mx-auto max-w-xl rounded-md border border-stamp/35 bg-stamp/5 px-3 py-2 font-sans text-xs text-ink"
            >
              <span className="font-semibold text-stamp">Clerk notes: </span>
              {error}
            </div>
          ) : null}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            disabled={preparing || loading}
            className="sr-only"
            onChange={(e) => {
              void onUploadFile(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
        </div>
      ) : (
        <div className="grid min-w-0 gap-5 md:grid-cols-2 md:gap-6">
          <UploadPanel previewUrl={originalUrl} preparing={preparing} onFile={onUploadFile} />
          <ResultPanel
            resultDataUrl={resultUrl}
            downloadFileName={downloadFileName}
            loading={loading}
            error={error}
            onGenerate={onRegenerate}
            canGenerate={canRegenerate}
            hasUpload
          />
        </div>
      )}
    </div>
  );
}

function ViewModeToggle({
  name,
  mode,
  onChange,
}: {
  name: string;
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  const options = [
    { value: "slider", label: "Slider" },
    { value: "sideBySide", label: "Side by side" },
  ] as const;

  return (
    <div
      role="radiogroup"
      aria-label="Comparison view"
      className="inline-flex items-center gap-1 rounded-lg border border-margin/60 bg-white/70 p-1 font-sans text-xs"
    >
      {options.map((opt) => {
        const active = mode === opt.value;
        return (
          <label
            key={opt.value}
            className={`cursor-pointer rounded-md px-3 py-1.5 font-semibold transition ${
              active
                ? "bg-ink text-paper shadow-sm"
                : "text-dossier hover:text-ink"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
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
