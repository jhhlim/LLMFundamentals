import type { CompStatus, Listing, MarketComp } from '../data/listing'
import { FadeIn } from './ui/FadeIn'

const STATUS: Record<CompStatus, { label: string; className: string }> = {
  sold: { label: 'Sold', className: 'bg-ink text-white' },
  listed: { label: 'Listed', className: 'bg-accent text-white' },
  pending: { label: 'Pending', className: 'bg-gold text-ink' },
}

function CompRow({ comp }: { comp: MarketComp }) {
  const status = STATUS[comp.status]
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-ink dark:text-[#f7f3ec]">{comp.address}</p>
          <p className="mt-1 text-xs text-stone dark:text-stone-light/70">
            {comp.city}
            {comp.city ? ' · ' : ''}
            {comp.beds} bd · {comp.baths} ba · {comp.sqft}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${status.className}`}>
          {status.label}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-2">
        <p className="font-serif text-2xl text-ink dark:text-gold-soft">{comp.price}</p>
        <p className="text-xs text-stone dark:text-stone-light/70">
          {comp.pricePerSqft}
          {comp.pricePerSqft !== '—' && comp.dateLabel ? ' · ' : ''}
          {comp.dateLabel}
        </p>
      </div>
    </>
  )

  if (comp.url) {
    return (
      <a href={comp.url} target="_blank" rel="noreferrer" className="soft-card block p-5 transition hover:border-gold/40">
        {inner}
      </a>
    )
  }
  return <div className="soft-card p-5">{inner}</div>
}

export function MarketTrendsSection({ listing }: { listing: Listing }) {
  const { market } = listing
  const sold = market.comps.filter((c) => c.status === 'sold')
  const listed = market.comps.filter((c) => c.status !== 'sold')

  return (
    <section className="brochure-page surface-warm px-6 py-16 md:px-12 md:py-20 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <p className="eyebrow">Market trends</p>
          <h2 className="editorial-display prose-ink mt-3 text-4xl md:text-6xl">Similar homes nearby</h2>
          <p className="prose-muted mt-5 max-w-2xl">{market.summary}</p>
          {market.area ? <p className="mt-2 text-sm text-stone dark:text-stone-light/70">{market.area}</p> : null}
        </FadeIn>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Median sold', value: market.medianSold },
            { label: 'Median list', value: market.medianList },
            { label: 'Avg. $/SF', value: market.avgPpsf },
            { label: 'Comps in view', value: String(market.comps.length || '—') },
          ].map((stat) => (
            <FadeIn key={stat.label} className="rounded-2xl border border-accent/20 bg-[#e8f2f3] p-5 text-ink">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{stat.label}</p>
              <p className="mt-2 font-serif text-3xl">{stat.value}</p>
            </FadeIn>
          ))}
        </div>

        {market.comps.length ? (
          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone">Recently sold</p>
              <div className="mt-4 grid gap-3">
                {sold.length ? sold.map((comp) => <CompRow key={`${comp.address}-${comp.price}`} comp={comp} />) : (
                  <p className="text-sm text-stone">No recent sales returned for this ZIP.</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone">Listed / pending</p>
              <div className="mt-4 grid gap-3">
                {listed.length ? listed.map((comp) => <CompRow key={`${comp.address}-${comp.price}`} comp={comp} />) : (
                  <p className="text-sm text-stone">No active listings returned for this ZIP.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-10 max-w-xl text-sm leading-relaxed text-stone dark:text-stone-light/70">
            Import a listing with a Zillow RapidAPI key subscribed to zillow-com1 to fill this page from recently sold
            and for-sale search in the same ZIP. Redfin similar homes are used when a Redfin property ID is available.
          </p>
        )}

        <p className="mt-10 text-xs leading-relaxed text-stone/80 dark:text-stone-light/50">
          Comparable homes are similar nearby listings from public portal data
          {market.sourceLabel ? ` (${market.sourceLabel})` : ''}. Not an appraisal. Verify with MLS before advising
          clients.
        </p>
      </div>
    </section>
  )
}
