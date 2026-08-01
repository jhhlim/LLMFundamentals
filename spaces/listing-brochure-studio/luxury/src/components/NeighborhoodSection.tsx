import { School, UtensilsCrossed, Trees, ShoppingBag, TrainFront, Building2, MapPinned } from 'lucide-react'
import type { Listing } from '../data/listing'
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
  return (
    <section className="brochure-page bg-ink text-white px-6 py-16 md:px-12 md:py-20 lg:px-16">
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
                <p className="mt-2 font-serif text-6xl text-gold-soft">{listing.walkScore}</p>
              </div>
              <p className="max-w-[14rem] text-sm leading-relaxed text-white/60">
                Very Walkable — most errands can be accomplished on foot in the village core.
              </p>
            </div>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold to-gold-soft"
                style={{ width: `${listing.walkScore}%` }}
              />
            </div>
          </FadeIn>

          <FadeIn delay={0.15} className="mt-6 overflow-hidden rounded-3xl border border-white/10">
            <div className="relative aspect-[16/10] bg-ink-soft">
              <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1600&q=80"
                alt="Neighborhood map atmosphere"
                className="h-full w-full object-cover opacity-70"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur">
                <MapPinned className="h-4 w-4 text-gold-soft" />
                {listing.address}, {listing.city}
              </div>
            </div>
          </FadeIn>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {listing.places.map((place, i) => {
            const Icon = icons[place.icon]
            return (
              <FadeIn key={place.name} delay={i * 0.05} className="soft-card border-white/10 bg-white/5 p-5 backdrop-blur transition hover:bg-white/10">
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
