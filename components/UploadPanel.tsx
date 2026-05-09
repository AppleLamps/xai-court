"use client";

import { useId, useRef } from "react";
import { XAI_MAX_IMAGE_BYTES, getMaxUploadPayloadBytes } from "@/lib/upload-limits";

type UploadPanelProps = {
  previewUrl: string | null;
  preparing: boolean;
  onFile: (file: File | null) => void | Promise<void>;
};

export function UploadPanel({ previewUrl, preparing, onFile }: UploadPanelProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const xaiMb = Math.round(XAI_MAX_IMAGE_BYTES / (1024 * 1024));
  const payloadMiB = (
    Math.round((getMaxUploadPayloadBytes() / (1024 * 1024)) * 10) / 10
  ).toString();

  return (
    <section
      className="relative rounded-2xl border border-margin/50 bg-white/75 shadow-dossier paper-grain"
      aria-labelledby={`${inputId}-label`}
    >
      <div className="absolute right-4 top-4 rotate-[-8deg] select-none border-2 border-stamp/60 px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-stamp opacity-80">
        Received
      </div>
      <div className="relative p-5 sm:p-7">
        {preparing ? (
          <div
            className="mx-auto mb-4 flex items-center gap-3 rounded-xl border border-washblue/25 bg-paper/60 px-4 py-3 font-sans text-sm text-ink"
            role="status"
            aria-live="polite"
          >
            <span
              className="inline-block size-4 animate-spin rounded-full border-2 border-ink/20 border-t-ink"
              aria-hidden
            />
            <span>Optimizing… resizing or compressing so the sketch request fits your deployment.</span>
          </div>
        ) : null}
        <div className="legal-rule rounded-lg border border-dashed border-margin/80 bg-paper/40 p-5 sm:p-6">
          <label id={`${inputId}-label`} className="block font-serif text-xl font-semibold text-ink">
            Source photograph
          </label>
          <p className="mt-2 font-sans text-sm text-dossier">
            JPEG or PNG. Server aligns with xAI at up to about {xaiMb} MiB. Typical upload target for this bundle is
            around {payloadMiB} MiB (Vercel defaults tighter; bump with{" "}
            <span className="font-mono text-xs">NEXT_PUBLIC_MAX_UPLOAD_BYTES</span>
            ). Large originals are resized and JPEG-compressed in your browser before they leave the tab.
          </p>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={preparing}
              className="inline-flex items-center justify-center rounded-lg border border-margin bg-white px-4 py-2.5 font-sans text-sm font-semibold text-ink shadow-sm transition hover:border-washblue/55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp disabled:cursor-not-allowed disabled:opacity-50"
            >
              Choose photo
            </button>
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
            <p className="font-sans text-xs text-dossier">
              Tip: bold lighting and clear poses survive the sketch pipeline best (or worst — in a good way).
            </p>
          </div>
        </div>

        {previewUrl ? (
          <div className="mt-6">
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-dossier">Preview</p>
            <div className="mt-3 overflow-hidden rounded-xl border border-margin/60 bg-paper/50">
              {/* eslint-disable-next-line @next/next/no-img-element -- user upload preview */}
              <img
                src={previewUrl}
                alt="Your upload preview"
                className="max-h-[420px] w-full object-contain"
              />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
