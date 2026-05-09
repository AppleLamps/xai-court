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
      <div className="relative mx-auto flex min-h-dvh max-w-6xl min-w-0 flex-col px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <header className="mb-10">
          <div className="relative overflow-hidden rounded-2xl border border-margin/40 bg-white/70 shadow-dossier paper-grain">
            <div className="relative border-l-4 border-stamp/90 px-5 py-6 sm:px-8 sm:py-7">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.22em] text-dossier">
                    In the court of public memes
                  </p>
                  <h1 className="mt-2 font-serif text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                    Exhibit F
                  </h1>
                </div>
                <div className="font-sans text-right text-sm leading-snug text-dossier">
                  <p className="font-semibold text-ink">Evidence locker</p>
                  <p className="mt-1 max-w-[14rem]">
                    One upload. One sketch. No refunds on dignity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="mt-14 border-t border-margin/50 pt-8 font-sans text-xs text-dossier">
          <p>
            Exhibit F uses Grok Imagine (quality mode) on the server. Your key stays on the server. We do not
            store uploads or results.
          </p>
        </footer>
      </div>
    </div>
  );
}
