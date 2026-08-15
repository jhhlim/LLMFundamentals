import { motion } from 'framer-motion'
import type { Listing } from '../data/listing'
import { FadeIn } from './ui/FadeIn'
import { cn } from '../lib/utils'

export function ImageGallery({ listing }: { listing: Listing }) {
  const gallery = listing.images.length > 1 ? listing.images.slice(1) : listing.images

  return (
    <section className="brochure-page bg-paper px-6 py-16 md:px-12 md:py-20 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <FadeIn>
          <p className="eyebrow">Residences in frame</p>
          <h2 className="editorial-display mt-3 text-4xl md:text-6xl">A study in light & form</h2>
        </FadeIn>

        {!gallery.length && (
          <p className="mt-10 rounded-3xl border border-dashed border-stone-light/70 bg-warm/50 px-6 py-12 text-center text-stone">
            No listing photos yet — open <span className="font-semibold text-ink">Edit brochure</span> to upload
            Compass, Zillow, or Redfin photos.
          </p>
        )}

        <div className="mt-12 grid auto-rows-[180px] grid-cols-2 gap-3 md:auto-rows-[220px] md:grid-cols-6 md:gap-4">
          {gallery.map((image, index) => {
            const span =
              image.span === 'wide'
                ? 'md:col-span-4 md:row-span-2'
                : image.span === 'tall'
                  ? 'md:col-span-2 md:row-span-2'
                  : index === 0
                    ? 'col-span-2 md:col-span-3 md:row-span-2'
                    : 'md:col-span-2'

            return (
              <FadeIn key={image.src} delay={index * 0.05} className={cn('group relative overflow-hidden rounded-3xl', span)}>
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  src={image.src}
                  alt={image.alt}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                <p className="absolute bottom-4 left-4 text-xs uppercase tracking-[0.18em] text-white opacity-0 transition group-hover:opacity-100">
                  {image.alt}
                </p>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
