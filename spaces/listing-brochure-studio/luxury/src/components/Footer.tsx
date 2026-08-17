import type { Listing } from '../data/listing'
import { displayWebsite, websiteHref } from '../lib/agentAuth'

export function Footer({ listing }: { listing: Listing }) {
  const { agent } = listing
  const site = displayWebsite(agent.website)
  const bits = [agent.name, agent.brokerage, agent.dre].filter(Boolean)

  return (
    <footer className="no-print border-t border-stone-light/40 bg-warm px-6 py-8 text-center text-sm text-stone transition-colors dark:border-white/10 dark:bg-[#0c1f33] dark:text-stone-light/70">
      {bits.join(' · ')}
      {site ? (
        <>
          {' · '}
          <a
            className="text-ink underline-offset-4 hover:underline dark:text-gold-soft"
            href={websiteHref(agent.website)}
          >
            {site}
          </a>
        </>
      ) : null}
    </footer>
  )
}
