import { Moon, Printer, Sun, Plus, Pencil } from 'lucide-react'

export function Toolbar({
  dark,
  onToggleTheme,
  onNewListing,
  onEditFacts,
}: {
  dark: boolean
  onToggleTheme: () => void
  onNewListing?: () => void
  onEditFacts?: () => void
}) {
  return (
    <div className="no-print fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-stone-light/50 bg-paper/95 px-3 py-2 text-ink shadow-[0_20px_60px_-24px_rgba(11,31,51,0.55)] backdrop-blur-md transition-colors dark:border-white/15 dark:bg-[#0c1f33]/95 dark:text-[#f7f3ec] dark:shadow-[0_20px_60px_-24px_rgba(0,0,0,0.8)]">
      {onNewListing && (
        <button
          type="button"
          onClick={onNewListing}
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm transition hover:bg-warm dark:hover:bg-white/10"
        >
          <Plus className="h-4 w-4" />
          New URL
        </button>
      )}
      {onEditFacts && (
        <button
          type="button"
          onClick={onEditFacts}
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm transition hover:bg-warm dark:hover:bg-white/10"
        >
          <Pencil className="h-4 w-4" />
          Edit brochure
        </button>
      )}
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-soft dark:bg-gold dark:text-ink dark:hover:bg-gold-soft"
        title="In the print dialog, turn on Background graphics for best results"
      >
        <Printer className="h-4 w-4" />
        Print / PDF
      </button>
      <button
        type="button"
        onClick={onToggleTheme}
        className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm transition hover:bg-warm dark:hover:bg-white/10"
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-pressed={dark}
      >
        {dark ? <Sun className="h-4 w-4 text-gold-soft" /> : <Moon className="h-4 w-4" />}
        {dark ? 'Light' : 'Dark'}
      </button>
      <a
        href="https://www.jasonlimrealty.com"
        target="_blank"
        rel="noreferrer"
        className="hidden rounded-full px-3 py-2 text-sm text-stone transition hover:text-ink sm:inline dark:text-stone-light/70 dark:hover:text-white"
      >
        jasonlimrealty.com
      </a>
    </div>
  )
}
