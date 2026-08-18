import { Moon, Printer, Sun, ArrowLeft, LogIn } from 'lucide-react'

export function PreviewToolbar({
  dark,
  onToggleTheme,
  onSignIn,
  onHome,
}: {
  dark: boolean
  onToggleTheme: () => void
  onSignIn: () => void
  onHome: () => void
}) {
  return (
    <div className="no-print fixed bottom-5 left-1/2 z-50 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-full border border-stone-light/50 bg-paper/95 px-2 py-2 text-ink shadow-[0_20px_60px_-24px_rgba(11,31,51,0.55)] backdrop-blur-md transition-colors dark:border-white/15 dark:bg-[#0c1f33]/95 dark:text-[#f7f3ec] sm:gap-2 sm:px-3">
      <button
        type="button"
        onClick={onHome}
        className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm whitespace-nowrap transition hover:bg-warm dark:hover:bg-white/10"
      >
        <ArrowLeft className="h-4 w-4" />
        Home
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white whitespace-nowrap transition hover:bg-ink-soft dark:bg-gold dark:text-ink dark:hover:bg-gold-soft"
      >
        <Printer className="h-4 w-4" />
        Print / PDF
      </button>
      <button
        type="button"
        onClick={onToggleTheme}
        className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm whitespace-nowrap transition hover:bg-warm dark:hover:bg-white/10"
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {dark ? <Sun className="h-4 w-4 text-gold-soft" /> : <Moon className="h-4 w-4" />}
        {dark ? 'Light' : 'Dark'}
      </button>
      <button
        type="button"
        onClick={onSignIn}
        className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent whitespace-nowrap transition hover:bg-accent hover:text-white dark:border-accent/40 dark:text-gold-soft dark:hover:bg-accent dark:hover:text-white"
      >
        <LogIn className="h-4 w-4" />
        Sign in to customize
      </button>
    </div>
  )
}
