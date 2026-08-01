import type { Listing } from '../data/listing'
import { FadeIn } from './ui/FadeIn'

export function LifestyleSection({ listing }: { listing: Listing }) {
  return (
    <section className="brochure-page bg-paper px-6 py-16 md:px-12 md:py-20 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <p className="eyebrow">Lifestyle</p>
          <h2 className="editorial-display mt-3 text-4xl md:text-6xl">How the days feel here</h2>
        </FadeIn>

        <div className="mt-12 space-y-8">
          {listing.lifestyle.map((moment, i) => (
            <FadeIn
              key={moment.caption}
              delay={i * 0.08}
              className={`grid items-center gap-6 md:gap-10 ${
                i % 2 === 1 ? 'md:grid-cols-[0.9fr_1.1fr]' : 'md:grid-cols-[1.1fr_0.9fr]'
              }`}
            >
              <div className={`relative overflow-hidden rounded-[2rem] ${i % 2 === 1 ? 'md:order-2' : ''}`}>
                <img
                  src={moment.image}
                  alt={moment.caption}
                  className="aspect-[16/11] w-full object-cover transition duration-700 hover:scale-[1.03]"
                  loading="lazy"
                />
              </div>
              <div className={i % 2 === 1 ? 'md:order-1' : ''}>
                <p className="font-serif text-3xl leading-snug text-ink md:text-4xl md:leading-snug italic">
                  “{moment.quote}”
                </p>
                <p className="mt-6 text-[11px] uppercase tracking-[0.24em] text-stone">{moment.caption}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
