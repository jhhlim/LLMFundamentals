import type { ListingSource } from '../lib/listingImport'
import { sourceLabel } from '../lib/listingImport'
import type { Agent } from '../data/listing'

export function DebugBanners({
  source,
  agent,
  missing,
  usedExamplePhotos,
  importNotice,
}: {
  source: ListingSource | null
  agent: Agent
  missing: boolean
  usedExamplePhotos: boolean
  importNotice: string
}) {
  return (
    <div className="no-print sticky top-0 z-40 space-y-0">
      <div className="border-b border-stone-light/40 bg-warm/95 px-4 py-2 text-center text-xs uppercase tracking-[0.18em] text-stone backdrop-blur transition-colors dark:border-white/10 dark:bg-[#0c1f33]/95 dark:text-stone-light/75">
        {source && source !== 'unknown'
          ? `Generated from ${sourceLabel(source)} RapidAPI · ${agent.name} · ${agent.brokerage}${
              missing ? ' · Review photos/stats in Edit brochure' : ''
            }`
          : `Demo brochure · ${agent.name} · ${agent.brokerage}`}
      </div>
      <div className="border-b border-amber-200/40 bg-amber-50 px-4 py-2 text-center text-xs leading-relaxed text-ink/80 transition-colors dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-50/90">
        Import supports Compass, Zillow, and Redfin via separate RapidAPI keys.
        {usedExamplePhotos
          ? ' Example listing photos are showing because the API returned no photo URLs — replace them in Edit brochure.'
          : ''}
        {importNotice && !usedExamplePhotos ? ` ${importNotice}` : ''}
      </div>
    </div>
  )
}
