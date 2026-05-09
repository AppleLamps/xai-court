"use client";

import { KeyboardEvent, PointerEvent, useCallback, useRef, useState } from "react";

type Props = {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
};

export function BeforeAfterSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = "Original",
  afterLabel = "Sketch",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const draggingRef = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.max(0, Math.min(100, pct)));
  }, []);

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      draggingRef.current = true;
      updateFromClientX(e.clientX);
    },
    [updateFromClientX],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      updateFromClientX(e.clientX);
    },
    [updateFromClientX],
  );

  const onPointerUp = useCallback((e: PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      let next = position;
      if (e.key === "ArrowLeft") next = Math.max(0, position - 4);
      else if (e.key === "ArrowRight") next = Math.min(100, position + 4);
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = 100;
      else return;
      e.preventDefault();
      setPosition(next);
    },
    [position],
  );

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="relative aspect-[4/5] w-full select-none touch-none overflow-hidden rounded-2xl border border-margin/60 bg-paper/45 shadow-dossier"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={afterUrl}
        alt={afterLabel}
        draggable={false}
        className="absolute inset-0 h-full w-full object-contain"
      />
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeUrl}
          alt={beforeLabel}
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain"
        />
      </div>

      <span className="pointer-events-none absolute left-3 top-3 rounded-md bg-paper/95 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-washblue shadow-sm">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-md bg-paper/95 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-stamp shadow-sm">
        {afterLabel}
      </span>

      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 top-0 w-px bg-paper shadow-[0_0_0_1px_rgba(28,25,22,0.18)]"
        style={{ left: `${position}%` }}
      />
      <div
        role="slider"
        tabIndex={0}
        aria-label="Reveal original photograph"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        className="absolute top-1/2 z-10 flex size-10 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border border-margin bg-paper text-ink shadow-md transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp"
        style={{ left: `${position}%` }}
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M7 5L3 10L7 15"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13 5L17 10L13 15"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
