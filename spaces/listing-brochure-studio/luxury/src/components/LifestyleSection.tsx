import type { Listing } from '../data/listing'
import { BROCHURE_SECTIONS } from '../lib/sectionNav'
import { FadeIn } from './ui/FadeIn'

export function LifestyleSection({ listing }: { listing: Listing }) {
  return (
    <section
      id={BROCHURE_SECTIONS[6].id}
      className="brochure-page brochure-section surface-light px-6 py-16 md:px-12 md:py-20 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <p className="eyebrow">Lifestyle</p>
          <h2 className="editorial-display prose-ink mt-3 text-4xl md:text-6xl">How the days feel here</h2>
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
              <div
                className={`relative overflow-hidden rounded-[2rem] bg-warm dark:bg-white/5 ${i % 2 === 1 ? 'md:order-2' : ''}`}
              >
                {moment.image ? (
                  <img
                    src={moment.image}
                    alt={moment.caption}
                    className="aspect-[16/11] w-full object-cover transition duration-700 hover:scale-[1.03]"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex aspect-[16/11] w-full items-center justify-center text-sm text-stone dark:text-stone-light/70">
                    Add photos in Edit brochure
                  </div>
                )}
              </div>
              <div className={i % 2 === 1 ? 'md:order-1' : ''}>
                <p className="font-serif text-3xl leading-snug text-ink italic md:text-4xl md:leading-snug dark:text-[#f7f3ec]">
                  “{moment.quote}”
                </p>
                <p className="mt-6 text-[11px] uppercase tracking-[0.24em] text-stone dark:text-stone-light/70">
                  {moment.caption}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
