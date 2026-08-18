import { Moon, Printer, Sun, Plus, Pencil, LogOut } from 'lucide-react'
import type { Agent } from '../data/listing'
import { displayWebsite, websiteHref } from '../lib/agentAuth'

export function Toolbar({
  dark,
  agent,
  onToggleTheme,
  onNewListing,
  onEditFacts,
  onEditProfile,
  onSignOut,
}: {
  dark: boolean
  agent: Agent
  onToggleTheme: () => void
  onNewListing?: () => void
  onEditFacts?: () => void
  onEditProfile?: () => void
  onSignOut?: () => void
}) {
  const site = displayWebsite(agent.website)

  return (
    <div className="no-print fixed bottom-5 left-1/2 z-50 flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-full border border-stone-light/50 bg-paper/95 px-2 py-2 text-ink shadow-[0_20px_60px_-24px_rgba(11,31,51,0.55)] backdrop-blur-md transition-colors dark:border-white/15 dark:bg-[#0c1f33]/95 dark:text-[#f7f3ec] dark:shadow-[0_20px_60px_-24px_rgba(0,0,0,0.8)] sm:gap-2 sm:px-3">
      {onNewListing && (
        <button
          type="button"
          onClick={onNewListing}
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm whitespace-nowrap transition hover:bg-warm dark:hover:bg-white/10"
        >
          <Plus className="h-4 w-4" />
          New URL
        </button>
      )}
      {onEditFacts && (
        <button
          type="button"
          onClick={onEditFacts}
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm whitespace-nowrap transition hover:bg-warm dark:hover:bg-white/10"
        >
          <Pencil className="h-4 w-4" />
          Edit brochure
        </button>
      )}
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white whitespace-nowrap transition hover:bg-ink-soft dark:bg-gold dark:text-ink dark:hover:bg-gold-soft"
        title="In the print dialog, turn on Background graphics for best results"
      >
        <Printer className="h-4 w-4" />
        Print / PDF
      </button>
      <button
        type="button"
        onClick={onToggleTheme}
        className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm whitespace-nowrap transition hover:bg-warm dark:hover:bg-white/10"
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-pressed={dark}
      >
        {dark ? <Sun className="h-4 w-4 text-gold-soft" /> : <Moon className="h-4 w-4" />}
        {dark ? 'Light' : 'Dark'}
      </button>
      {onEditProfile && (
        <button
          type="button"
          onClick={onEditProfile}
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm whitespace-nowrap transition hover:bg-warm dark:hover:bg-white/10"
          title="Edit agent profile"
        >
          <img src={agent.photo} alt="" className="h-6 w-6 rounded-full object-cover" />
          <span className="hidden lg:inline">{agent.name.split(' ')[0]}</span>
        </button>
      )}
      {onSignOut && (
        <button
          type="button"
          onClick={onSignOut}
          className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm whitespace-nowrap transition hover:bg-warm dark:hover:bg-white/10"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      )}
      {site && (
        <a
          href={websiteHref(agent.website)}
          target="_blank"
          rel="noreferrer"
          className="hidden rounded-full px-3 py-2 text-sm text-stone transition hover:text-ink xl:inline dark:text-stone-light/70 dark:hover:text-white"
        >
          {site}
        </a>
      )}
    </div>
  )
}
