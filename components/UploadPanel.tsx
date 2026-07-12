"use client";

import { DragEvent, useCallback, useId, useRef, useState } from "react";

type UploadPanelProps = {
  previewUrls: string[];
  multiple: boolean;
  preparing: boolean;
  /** True while a sketch is being generated elsewhere; blocks swapping the photo without showing the "optimizing" state. */
  locked?: boolean;
  onFiles: (files: File[]) => void | Promise<void>;
};

export function UploadPanel({ previewUrls, multiple, preparing, locked = false, onFiles }: UploadPanelProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const interactionDisabled = preparing || locked;

  const open = useCallback(() => {
    if (interactionDisabled) return;
    inputRef.current?.click();
  }, [interactionDisabled]);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (interactionDisabled) return;
      const files = Array.from(e.dataTransfer.files ?? []).slice(0, multiple ? 3 : 1);
      void onFiles(files);
    },
    [multiple, onFiles, interactionDisabled],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const hasImage = previewUrls.length > 0;

  return (
    <article
      className="relative flex min-w-0 flex-col rounded-2xl border border-margin/70 bg-white/72 p-4 shadow-dossier paper-grain"
      aria-labelledby={`${inputId}-label`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3
          id={`${inputId}-label`}
          className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-dossier"
        >
          Exhibit A
        </h3>
        <span className="rounded-md bg-paper px-2 py-0.5 font-mono text-[10px] text-dossier">
          {hasImage ? "ORIGINAL" : "AWAITING UPLOAD"}
        </span>
      </div>

      <div
        role="button"
        tabIndex={interactionDisabled ? -1 : 0}
        aria-disabled={interactionDisabled}
        aria-label={
          locked && !preparing
            ? "Photo locked while sketch generates"
            : hasImage
              ? "Replace photographs"
              : "Upload photographs"
        }
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
        className={`group relative mt-3 flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-paper/50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stamp focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${
          interactionDisabled
            ? "cursor-not-allowed"
            : isDragging
              ? "cursor-pointer border-stamp/70 bg-stamp/5"
              : hasImage
                ? "cursor-pointer border-margin/60 hover:border-washblue/55"
                : "cursor-pointer border-margin/70 hover:border-washblue/60"
        } ${locked && !preparing ? "opacity-70" : ""}`}
      >
        {hasImage ? (
          <>
            <div className={`grid h-full w-full gap-1 ${previewUrls.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
              {previewUrls.map((url, index) => (
                // eslint-disable-next-line @next/next/no-img-element -- local user preview
                <img key={url} src={url} alt={`Uploaded defendant ${index + 1}`} className="h-full min-h-0 w-full object-contain" />
              ))}
            </div>
            <div
              className={`pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center bg-gradient-to-t from-ink/65 via-ink/10 to-transparent px-3 pb-3 pt-10 opacity-0 transition ${
                interactionDisabled ? "" : "group-hover:opacity-100 group-focus-visible:opacity-100"
              }`}
            >
              <span className="rounded-md bg-paper/95 px-3 py-1.5 font-sans text-xs font-semibold text-ink shadow-sm">
                Replace photograph
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 text-center">
            <span className="font-serif text-lg font-semibold text-ink">
              {multiple ? "Drop 2 or 3 photographs here" : "Drop a photograph here"}
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
        ) : locked ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center px-3 pb-3 pt-10">
            <span className="rounded-md bg-white/95 px-3 py-1.5 font-sans text-xs font-semibold text-dossier shadow-sm">
              Locked while sketching…
            </span>
          </div>
        ) : null}
      </div>

      <input
        ref={inputRef}
        id={inputId}
        name="file"
        type="file"
        multiple={multiple}
        accept="image/jpeg,image/png"
        disabled={interactionDisabled}
        className="sr-only"
        onChange={(e) => {
          void onFiles(Array.from(e.target.files ?? []).slice(0, multiple ? 3 : 1));
          e.target.value = "";
        }}
      />
    </article>
  );
}
