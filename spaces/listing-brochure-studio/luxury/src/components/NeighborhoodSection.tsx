import { School, UtensilsCrossed, Trees, ShoppingBag, TrainFront, Building2, MapPinned } from 'lucide-react'
import type { Listing } from '../data/listing'
import { fullAddress, googleMapsEmbedUrl } from '../lib/listingImport'
import { FadeIn } from './ui/FadeIn'

const icons = {
  school: School,
  dining: UtensilsCrossed,
  park: Trees,
  shop: ShoppingBag,
  transit: TrainFront,
  tech: Building2,
}

export function NeighborhoodSection({ listing }: { listing: Listing }) {
  const address = fullAddress(listing)
  const mapSrc = googleMapsEmbedUrl(address)
  const walkLabel =
    listing.walkScore >= 70
      ? 'Very Walkable — most errands can be accomplished on foot.'
      : listing.walkScore >= 50
        ? 'Somewhat Walkable — some errands can be accomplished on foot.'
        : listing.walkScore > 0
          ? 'Car-dependent — most errands require a vehicle.'
          : 'Set Walk Score in Edit brochure, or leave blank for print.'

  return (
    <section className="brochure-page surface-ink px-6 py-16 md:px-12 md:py-20 lg:px-16">
      <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <FadeIn>
            <p className="eyebrow text-gold-soft">Neighborhood</p>
            <h2 className="editorial-display mt-4 text-4xl md:text-6xl">{listing.neighborhood}</h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
              {listing.neighborhoodIntro}
            </p>
          </FadeIn>

          <FadeIn delay={0.1} className="mt-10 soft-card bg-white/5 border-white/10 p-6 backdrop-blur">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/50">Walk Score</p>
                <p className="mt-2 font-serif text-6xl text-gold-soft">
                  {listing.walkScore > 0 ? listing.walkScore : '—'}
                </p>
              </div>
              <p className="max-w-[14rem] text-sm leading-relaxed text-white/60">{walkLabel}</p>
            </div>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold to-gold-soft"
                style={{ width: `${Math.min(100, Math.max(0, listing.walkScore))}%` }}
              />
            </div>
          </FadeIn>

          <FadeIn delay={0.15} className="mt-6 overflow-hidden rounded-3xl border border-white/10">
            <div className="relative aspect-[16/10] bg-ink-soft">
              <iframe
                title={`Google Map — ${address}`}
                src={mapSrc}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <div className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-ink/70 px-4 py-2 text-sm backdrop-blur">
                <MapPinned className="h-4 w-4 text-gold-soft" />
                {listing.address}
                {listing.city ? `, ${listing.city}` : ''}
              </div>
            </div>
          </FadeIn>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {listing.places.map((place, i) => {
            const Icon = icons[place.icon]
            return (
              <FadeIn
                key={`${place.category}-${place.name}`}
                delay={i * 0.05}
                className="soft-card border-white/10 bg-white/5 p-5 backdrop-blur transition hover:bg-white/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold-soft">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <p className="mt-5 text-[10px] uppercase tracking-[0.22em] text-white/45">{place.category}</p>
                <p className="mt-2 font-medium text-white">{place.name}</p>
                <p className="mt-1 text-sm text-white/55">{place.detail}</p>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
