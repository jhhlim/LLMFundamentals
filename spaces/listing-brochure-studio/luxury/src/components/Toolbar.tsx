import { Moon, Printer, Sun, Plus } from 'lucide-react'

export function Toolbar({
  dark,
  onToggleTheme,
  onNewListing,
}: {
  dark: boolean
  onToggleTheme: () => void
  onNewListing?: () => void
}) {
  return (
    <div className="no-print fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-stone-light/50 bg-paper/90 px-3 py-2 shadow-[0_20px_60px_-24px_rgba(11,31,51,0.55)] backdrop-blur-md">
      {onNewListing && (
        <button
          type="button"
          onClick={onNewListing}
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-ink transition hover:bg-warm"
        >
          <Plus className="h-4 w-4" />
          New URL
        </button>
      )}
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-soft"
      >
        <Printer className="h-4 w-4" />
        Print / PDF
      </button>
      <button
        type="button"
        onClick={onToggleTheme}
        className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-ink transition hover:bg-warm"
        aria-label="Toggle theme"
      >
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        {dark ? 'Light' : 'Dark'}
      </button>
      <a
        href="https://www.jasonlimrealty.com"
        target="_blank"
        rel="noreferrer"
        className="hidden rounded-full px-3 py-2 text-sm text-stone transition hover:text-ink sm:inline"
      >
        jasonlimrealty.com
      </a>
    </div>
  )
}
