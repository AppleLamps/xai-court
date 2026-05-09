"use client";

import { StampButton } from "@/components/StampButton";

type ResultPanelProps = {
  originalPreviewUrl: string | null;
  resultDataUrl: string | null;
  downloadFileName: string;
  loading?: boolean;
  error?: string | null;
  onGenerate: () => void;
  canGenerate: boolean;
};

export function ResultPanel({
  originalPreviewUrl,
  resultDataUrl,
  downloadFileName,
  loading,
  error,
  onGenerate,
  canGenerate,
}: ResultPanelProps) {
  return (
    <section className="mt-8 min-w-0 space-y-6" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-ink">Exhibits A &amp; F</h2>
          <p className="mt-1 font-sans text-sm text-dossier">Original · Government exhibit energy</p>
        </div>
        <StampButton
          loading={loading}
          disabled={!canGenerate}
          onClick={onGenerate}
        >
          Generate Courtroom Sketch
        </StampButton>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-stamp/35 bg-stamp/5 px-4 py-3 font-sans text-sm text-ink"
        >
          <p className="font-semibold text-stamp">Clerk notes</p>
          <p className="mt-1 text-ink/90">{error}</p>
        </div>
      ) : null}

      <div className="grid min-w-0 gap-6 md:grid-cols-2">
        <article className="min-h-0 min-w-0 rounded-2xl border border-margin/45 bg-white/65 p-4 shadow-dossier paper-grain">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-dossier">Exhibit A</h3>
            <span className="rounded-md bg-paper px-2 py-0.5 font-mono text-[10px] text-washblue">ORIGINAL</span>
          </div>
          {originalPreviewUrl ? (
            <div className="mt-4 min-h-0 min-w-0 max-h-[min(30rem,65dvh)] overflow-auto rounded-xl border border-margin/50 bg-paper/45">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={originalPreviewUrl}
                alt="Original uploaded image"
                className="mx-auto aspect-auto h-auto max-h-[min(30rem,65dvh)] w-full max-w-full min-h-0 min-w-0 object-contain"
              />
            </div>
          ) : (
            <p className="mt-6 font-sans text-sm text-dossier">Upload a photo to populate this panel.</p>
          )}
        </article>

        <article className="min-h-0 min-w-0 rounded-2xl border border-margin/45 bg-white/65 p-4 shadow-dossier paper-grain">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-dossier">Exhibit F</h3>
            <span className="rounded-md bg-paper px-2 py-0.5 font-mono text-[10px] text-stamp">SKETCH</span>
          </div>
          {resultDataUrl ? (
            <div className="mt-4 space-y-3">
              <div className="min-h-0 min-w-0 max-h-[min(30rem,65dvh)] overflow-auto rounded-xl border border-margin/50 bg-paper/45">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resultDataUrl}
                  alt="Generated courtroom sketch"
                  className="mx-auto aspect-auto h-auto max-h-[min(30rem,65dvh)] w-full max-w-full min-h-0 min-w-0 object-contain"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href={resultDataUrl}
                  download={downloadFileName}
                  className="inline-flex items-center justify-center rounded-lg border border-margin bg-white px-4 py-2 font-sans text-sm font-semibold text-ink shadow-sm transition hover:border-washblue/55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp"
                >
                  Download exhibit
                </a>
              </div>
            </div>
          ) : (
            <p className="mt-6 font-sans text-sm text-dossier">
              {loading
                ? "Hold tight — the artist is rushing, smudging, and making questionable choices…"
                : "Your masterpiece of procedural chaos will appear here."}
            </p>
          )}
        </article>
      </div>
    </section>
  );
}
