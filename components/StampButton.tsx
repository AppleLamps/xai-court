type StampButtonProps = {
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
};

export function StampButton({ children, disabled, loading, onClick }: StampButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-ink px-6 py-3.5 font-sans text-sm font-semibold text-paper shadow-dossier transition hover:-translate-y-0.5 hover:bg-ink/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
    >
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
        aria-hidden
        style={{
          background:
            "repeating-linear-gradient(-12deg, rgba(244,239,230,0.06) 0 2px, rgba(244,239,230,0) 2px 10px)",
        }}
      />
      <span className="relative inline-flex items-center gap-2">
        {loading ? (
          <>
            <span
              className="inline-block size-4 animate-spin rounded-full border-2 border-paper/30 border-t-paper"
              aria-hidden
            />
            <span>Sketching…</span>
          </>
        ) : (
          children
        )}
      </span>
    </button>
  );
}
