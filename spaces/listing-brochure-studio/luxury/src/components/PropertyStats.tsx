import { BedDouble, Bath, Ruler, Trees, Car, CalendarDays } from 'lucide-react'
import type { Listing, ListingStat } from '../data/listing'
import { FadeIn } from './ui/FadeIn'

const iconMap = {
  bed: BedDouble,
  bath: Bath,
  area: Ruler,
  lot: Trees,
  garage: Car,
  built: CalendarDays,
}

function StatCard({ stat, index }: { stat: ListingStat; index: number }) {
  const Icon = iconMap[stat.icon]
  return (
    <FadeIn delay={index * 0.06} className="soft-card group p-6 transition duration-500 hover:-translate-y-1">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-gold-soft dark:bg-gold/20 dark:text-gold-soft">
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      </div>
      <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-stone dark:text-stone-light/70">{stat.label}</p>
      <p className="mt-2 font-serif text-3xl text-ink md:text-4xl dark:text-[#f7f3ec]">{stat.value}</p>
    </FadeIn>
  )
}

export function PropertyStats({ listing }: { listing: Listing }) {
  return (
    <section className="brochure-page surface-warm px-6 py-16 md:px-12 md:py-20 lg:px-16">
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl flex-col justify-center">
        <FadeIn>
          <p className="eyebrow">About the home</p>
          <h2 className="editorial-display prose-ink mt-4 max-w-3xl text-4xl md:text-6xl">
            {listing.headline}
          </h2>
          <div className="gold-rule mt-6" />
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="mt-10 max-w-3xl font-serif text-xl leading-[1.7] text-ink-soft md:text-2xl md:leading-[1.75] dark:text-white/75">
            {listing.about}
          </p>
        </FadeIn>

        <div className="mt-14">
          <p className="eyebrow mb-6">Property highlights</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listing.stats.map((stat, i) => (
              <StatCard key={stat.label} stat={stat} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
