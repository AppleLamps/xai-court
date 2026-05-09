"use client";

import { DragEvent, useCallback, useId, useRef, useState } from "react";

type UploadPanelProps = {
  previewUrl: string | null;
  preparing: boolean;
  onFile: (file: File | null) => void | Promise<void>;
};

export function UploadPanel({ previewUrl, preparing, onFile }: UploadPanelProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const open = useCallback(() => {
    if (preparing) return;
    inputRef.current?.click();
  }, [preparing]);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (preparing) return;
      const file = e.dataTransfer.files?.[0] ?? null;
      void onFile(file);
    },
    [onFile, preparing],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const hasImage = Boolean(previewUrl);

  return (
    <article
      className="relative flex min-w-0 flex-col rounded-2xl border border-margin/45 bg-white/65 p-4 shadow-dossier paper-grain"
      aria-labelledby={`${inputId}-label`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3
          id={`${inputId}-label`}
          className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-dossier"
        >
          Exhibit A
        </h3>
        <span className="rounded-md bg-paper px-2 py-0.5 font-mono text-[10px] text-washblue">
          {hasImage ? "ORIGINAL" : "AWAITING UPLOAD"}
        </span>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label={hasImage ? "Replace photograph" : "Upload photograph"}
        onClick={open}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            open();
          }
        }}
        className={`group relative mt-3 flex aspect-[4/5] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-paper/45 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${
          isDragging
            ? "border-stamp/70 bg-stamp/5"
            : hasImage
              ? "border-margin/60 hover:border-washblue/55"
              : "border-margin/70 hover:border-washblue/60"
        } ${preparing ? "pointer-events-none" : ""}`}
      >
        {hasImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- user upload preview */}
            <img
              src={previewUrl ?? undefined}
              alt="Original uploaded photograph"
              className="h-full w-full object-contain"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center bg-gradient-to-t from-ink/65 via-ink/10 to-transparent px-3 pb-3 pt-10 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
              <span className="rounded-md bg-paper/95 px-3 py-1.5 font-sans text-xs font-semibold text-ink shadow-sm">
                Replace photograph
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 text-center">
            <span className="font-serif text-lg font-semibold text-ink">
              Drop a photograph here
            </span>
            <span className="font-sans text-xs text-dossier">
              or click to choose. JPEG or PNG, resized in your browser before upload.
            </span>
            <span className="mt-3 font-sans text-[10px] uppercase tracking-[0.2em] text-dossier/80">
              Bold lighting and clear poses survive best
            </span>
          </div>
        )}

        {preparing ? (
          <div
            className="absolute inset-0 flex items-center justify-center bg-paper/75 backdrop-blur-sm"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2 rounded-md bg-white/95 px-3 py-2 font-sans text-xs text-ink shadow-sm">
              <span
                className="inline-block size-3.5 animate-spin rounded-full border-2 border-ink/20 border-t-ink"
                aria-hidden
              />
              Optimizing image…
            </div>
          </div>
        ) : null}
      </div>

      <input
        ref={inputRef}
        id={inputId}
        name="file"
        type="file"
        accept="image/jpeg,image/png"
        disabled={preparing}
        className="sr-only"
        onChange={(e) => {
          void onFile(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
    </article>
  );
}
