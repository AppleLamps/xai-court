type ExhibitChromeProps = {
  children: React.ReactNode;
};

export function ExhibitChrome({ children }: ExhibitChromeProps) {
  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-margin to-transparent opacity-80"
        aria-hidden
      />
      <div className="relative mx-auto flex min-h-dvh max-w-6xl min-w-0 flex-col px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <div className="flex flex-wrap items-end justify-between gap-3 border-l-[3px] border-stamp/90 pl-4">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h1 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                Exhibit F
              </h1>
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-dossier">
                In the court of public memes
              </p>
            </div>
            <p className="font-sans text-xs text-dossier">
              One upload. One sketch. No refunds on dignity.
            </p>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="mt-10 border-t border-margin/50 pt-6 font-sans text-[11px] text-dossier">
          <p>
            Exhibit F uses Grok Imagine (quality mode) on the server. Your key stays on the server. We do not
            store uploads or results.
          </p>
        </footer>
      </div>
    </div>
  );
}
