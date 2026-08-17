import type { Listing } from '../data/listing'
import { FadeIn } from './ui/FadeIn'

export function FeatureGrid({ listing }: { listing: Listing }) {
  return (
    <section className="brochure-page surface-warm-deep px-6 py-16 md:px-12 md:py-20 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <p className="eyebrow">Craft & systems</p>
          <h2 className="editorial-display prose-ink mt-3 text-4xl md:text-6xl">Features, quietly considered</h2>
          <p className="prose-muted mt-5 max-w-2xl">
            The details that make daily life feel effortless — presented without the noise of a checklist.
          </p>
        </FadeIn>

        <div className="mt-12 columns-1 gap-4 md:columns-2 lg:columns-3">
          {listing.features.map((feature, i) => (
            <FadeIn key={feature.title} delay={i * 0.04} className="soft-card mb-4 break-inside-avoid p-6">
              <p className="font-serif text-2xl text-ink dark:text-[#f7f3ec]">{feature.title}</p>
              <div className="gold-rule my-4" />
              <p className="text-sm leading-relaxed text-ink-soft/90 dark:text-white/70">{feature.body}</p>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
