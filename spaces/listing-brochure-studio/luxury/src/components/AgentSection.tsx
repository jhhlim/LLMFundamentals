import { QRCodeSVG } from 'qrcode.react'
import { Globe, Mail, Phone } from 'lucide-react'
import type { Listing } from '../data/listing'
import { displayWebsite } from '../lib/agentAuth'
import { FadeIn } from './ui/FadeIn'

export function AgentSection({ listing }: { listing: Listing }) {
  const { agent } = listing

  return (
    <section className="brochure-page surface-ink relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={listing.images[0]?.src}
          alt=""
          className="h-full w-full object-cover opacity-25"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/92 to-ink/70 dark:from-[#040b14] dark:via-[#040b14]/95 dark:to-[#040b14]/75" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 md:px-12 lg:px-16">
        <FadeIn>
          <p className="eyebrow text-gold-soft">Private showing</p>
          <h2 className="editorial-display mt-4 max-w-3xl text-5xl md:text-7xl">
            Experience the residence in person
          </h2>
        </FadeIn>

        <div className="mt-14 grid items-end gap-10 lg:grid-cols-[1fr_auto_1fr]">
          <FadeIn className="flex items-center gap-6">
            <img
              src={agent.photo}
              alt={agent.name}
              className="h-36 w-36 rounded-[2rem] object-cover ring-1 ring-white/20 md:h-44 md:w-44"
            />
            <div>
              <p className="font-serif text-4xl">{agent.name}</p>
              <p className="mt-2 text-white/70">{agent.title}</p>
              <p className="text-gold-soft">{agent.brokerage}</p>
              <p className="mt-3 text-sm text-white/50">{agent.dre}</p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1} className="justify-self-center rounded-[1.5rem] bg-white p-5 text-ink shadow-2xl">
            <QRCodeSVG value={listing.listingUrl} size={160} level="M" />
            <p className="mt-3 text-center text-[10px] uppercase tracking-[0.2em] text-stone">
              Scan to view listing
            </p>
          </FadeIn>

          <FadeIn delay={0.15} className="space-y-4 lg:justify-self-end">
            {agent.phone ? (
              <a href={`tel:${agent.phone}`} className="flex items-center gap-3 text-lg hover:text-gold-soft">
                <Phone className="h-5 w-5 text-gold-soft" /> {agent.phone}
              </a>
            ) : null}
            {agent.email ? (
              <a href={`mailto:${agent.email}`} className="flex items-center gap-3 text-lg hover:text-gold-soft">
                <Mail className="h-5 w-5 text-gold-soft" /> {agent.email}
              </a>
            ) : null}
            {agent.website ? (
              <a
                href={agent.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-lg hover:text-gold-soft"
              >
                <Globe className="h-5 w-5 text-gold-soft" /> {displayWebsite(agent.website) || agent.website}
              </a>
            ) : null}
          </FadeIn>
        </div>

        <FadeIn delay={0.2} className="mt-16 border-t border-white/15 pt-6 text-sm text-white/45">
          {[agent.brokerage, agent.dre].filter(Boolean).join(' · ')}
          {agent.brokerage || agent.dre ? ' · ' : ''}
          All information deemed reliable but not guaranteed.
        </FadeIn>
      </div>
    </section>
  )
}
