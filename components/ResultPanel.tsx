"use client";

import { useEffect, useState } from "react";
import { StampButton } from "@/components/StampButton";

type ResultPanelProps = {
  resultDataUrl: string | null;
  downloadFileName: string;
  loading?: boolean;
  error?: string | null;
  onGenerate: () => void;
  canGenerate: boolean;
  hasUpload: boolean;
};

const LOADING_STEPS = ["FILED", "ASSIGNED", "SMUDGING", "ENTERED"];

export function ResultPanel({
  resultDataUrl,
  downloadFileName,
  loading,
  error,
  onGenerate,
  canGenerate,
  hasUpload,
}: ResultPanelProps) {
  const showResult = Boolean(resultDataUrl);
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    if (!loading) {
      setLoadingStep(0);
      return;
    }
    const interval = window.setInterval(() => {
      setLoadingStep((step) => (step + 1) % LOADING_STEPS.length);
    }, 1300);
    return () => window.clearInterval(interval);
  }, [loading]);

  return (
    <article
      className="relative flex min-w-0 flex-col rounded-2xl border border-margin/70 bg-white/72 p-4 shadow-dossier paper-grain"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-dossier">
          Exhibit F
        </h3>
        <span className="rounded-md bg-paper px-2 py-0.5 font-mono text-[10px] text-stamp">
          {showResult ? "SKETCH" : loading ? LOADING_STEPS[loadingStep] : "PENDING"}
        </span>
      </div>

      <div className="relative mt-3 flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-xl border border-margin/70 bg-paper/50">
        {showResult ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={resultDataUrl ?? undefined}
            alt="Generated courtroom sketch"
            className="h-full w-full object-contain"
          />
        ) : loading ? (
          <div className="flex flex-col items-center gap-3 px-6 text-center">
            <span
              className="inline-block size-9 animate-spin rounded-full border-[3px] border-ink/15 border-t-stamp"
              aria-hidden
            />
            <span className="rounded-md border border-stamp/30 bg-stamp/10 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-stamp">
              {LOADING_STEPS[loadingStep]}
            </span>
            <p className="font-sans text-xs text-dossier">
              The artist is rushing, smudging, and making questionable choices…
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 px-6 text-center">
            <p className="font-sans text-xs text-dossier">
              {hasUpload
                ? "Ready when you are."
                : "Upload a photograph in Exhibit A to begin."}
            </p>
            <StampButton
              loading={false}
              disabled={!canGenerate}
              onClick={onGenerate}
            >
              Generate Courtroom Sketch
            </StampButton>
          </div>
        )}
      </div>

      {showResult ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <a
            href={resultDataUrl ?? undefined}
            download={downloadFileName}
            className="inline-flex items-center justify-center rounded-lg border border-ink bg-ink px-3.5 py-1.5 font-sans text-xs font-semibold text-paper shadow-sm transition hover:border-stamp hover:bg-stamp focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp"
          >
            Download exhibit
          </a>
          <button
            type="button"
            onClick={onGenerate}
            disabled={!canGenerate}
            className="inline-flex items-center justify-center rounded-lg border border-margin/70 bg-paper px-3 py-1.5 font-sans text-xs font-semibold text-dossier transition hover:border-washblue hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp disabled:cursor-not-allowed disabled:opacity-60"
          >
            Sketch again
          </button>
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          className="mt-3 rounded-md border border-stamp/35 bg-stamp/5 px-3 py-2 font-sans text-xs text-ink"
        >
          <span className="font-semibold text-stamp">Clerk notes: </span>
          {error}
        </div>
      ) : null}
    </article>
  );
}
