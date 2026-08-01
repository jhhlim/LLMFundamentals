import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type { Listing } from '../data/listing'

export function HeroSection({ listing }: { listing: Listing }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const scale = useTransform(scrollYProgress, [0, 1], [1.08, 1])

  return (
    <section ref={ref} className="brochure-page relative text-white">
      <div className="absolute inset-0 overflow-hidden">
        <motion.img
          style={{ y, scale }}
          src={listing.images[0]?.src}
          alt={listing.images[0]?.alt || listing.address}
          className="h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(176,141,87,0.18),transparent_55%)]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col justify-between px-6 py-8 md:px-12 md:py-10 lg:px-16">
        <header className="flex items-start justify-between gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-soft">
              {listing.agent.brokerage}
            </p>
            <p className="mt-2 text-sm text-white/75">{listing.agent.dre}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">{listing.status}</p>
            <p className="mt-2 font-serif text-3xl font-medium tracking-tight md:text-4xl">{listing.price}</p>
          </div>
        </header>

        <div className="max-w-4xl pb-4 pt-24 md:pt-16">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="eyebrow text-gold-soft"
          >
            {listing.neighborhood} · {listing.city}, {listing.state}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.9 }}
            className="editorial-display mt-4 text-5xl text-white md:text-7xl lg:text-8xl"
          >
            {listing.address}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.8 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-white/80 md:text-lg"
          >
            {listing.subhead}
          </motion.p>
        </div>

        <div className="grid gap-6 border-t border-white/15 pt-6 md:grid-cols-[1.2fr_1fr_auto] md:items-end">
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {listing.stats.slice(0, 5).map((stat) => (
              <div key={stat.label}>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/50">{stat.label}</p>
                <p className="mt-1 font-serif text-2xl text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <img
              src={listing.agent.photo}
              alt={listing.agent.name}
              className="h-16 w-16 rounded-full object-cover ring-1 ring-white/30"
              loading="lazy"
            />
            <div>
              <p className="font-medium">{listing.agent.name}</p>
              <p className="text-sm text-white/65">{listing.agent.title}</p>
              <p className="text-sm text-gold-soft">{listing.agent.phone}</p>
            </div>
          </div>

          <div className="justify-self-start rounded-2xl bg-white p-3 text-ink shadow-2xl md:justify-self-end">
            <QRCodeSVG value={listing.listingUrl} size={88} level="M" includeMargin={false} />
            <p className="mt-2 text-center text-[9px] uppercase tracking-[0.18em] text-stone">View listing</p>
          </div>
        </div>
      </div>
    </section>
  )
}
