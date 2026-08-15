import { useEffect, useMemo, useState } from 'react'
import { demoListing, type Listing } from './data/listing'
import type { ListingSource } from './lib/listingImport'
import { ImportPanel } from './components/ImportPanel'
import { HeroSection } from './components/HeroSection'
import { PropertyStats } from './components/PropertyStats'
import { ImageGallery } from './components/ImageGallery'
import { NeighborhoodSection } from './components/NeighborhoodSection'
import { FeatureGrid } from './components/FeatureGrid'
import { LifestyleSection } from './components/LifestyleSection'
import { AgentSection } from './components/AgentSection'
import { Footer } from './components/Footer'
import { Toolbar } from './components/Toolbar'
import { PrintBrochure } from './components/PrintBrochure'
import { EditFactsPanel } from './components/EditFactsPanel'

function hasMissingStats(listing: Listing) {
  return listing.stats.some((s) => !s.value || s.value === '—')
}

function needsEditAttention(listing: Listing) {
  return hasMissingStats(listing) || listing.images.length === 0
}

export default function App() {
  const [dark, setDark] = useState(false)
  const [listing, setListing] = useState<Listing | null>(null)
  const [source, setSource] = useState<ListingSource | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const missing = useMemo(() => (listing ? needsEditAttention(listing) : false), [listing])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    document.body.style.background = dark ? '#0b1f33' : '#fcfaf6'
  }, [dark])

  useEffect(() => {
    if (!listing) return
    const prev = document.title
    document.title = `${listing.address} · Jason Lim Compass Brochure`
    return () => {
      document.title = prev
    }
  }, [listing])

  if (!listing) {
    return (
      <ImportPanel
        onImported={(next, detected) => {
          setListing(next)
          setSource(detected)
          setEditOpen(needsEditAttention(next))
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        onDemo={() => {
          setListing(demoListing)
          setSource('unknown')
          setEditOpen(false)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      />
    )
  }

  return (
    <div className={dark ? 'bg-ink text-white' : 'bg-paper text-ink'}>
      <Toolbar
        dark={dark}
        onToggleTheme={() => setDark((v) => !v)}
        onNewListing={() => {
          setListing(null)
          setSource(null)
          setEditOpen(false)
        }}
        onEditFacts={() => setEditOpen(true)}
      />

      {source && source !== 'unknown' && (
        <div className="no-print sticky top-0 z-40 border-b border-stone-light/40 bg-warm/95 px-4 py-2 text-center text-xs uppercase tracking-[0.18em] text-stone backdrop-blur">
          Generated from {source} · Jason Lim Compass branding applied
          {missing ? ' · Photos or stats incomplete — use Edit brochure' : ''}
        </div>
      )}

      <div className="screen-only">
        <main>
          <HeroSection listing={listing} />
          <PropertyStats listing={listing} />
          <ImageGallery listing={listing} />
          <NeighborhoodSection listing={listing} />
          <FeatureGrid listing={listing} />
          <LifestyleSection listing={listing} />
          <AgentSection listing={listing} />
        </main>
        <Footer />
      </div>

      <PrintBrochure listing={listing} />

      <EditFactsPanel
        listing={listing}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={setListing}
      />
    </div>
  )
}
