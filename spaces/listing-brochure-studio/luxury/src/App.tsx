import { useEffect, useMemo, useState } from 'react'
import { demoListing, type Listing } from './data/listing'
import type { ListingSource } from './lib/listingImport'
import { sourceLabel } from './lib/listingImport'
import {
  applyAgentToListing,
  loadSession,
  signOut,
  toAgent,
  type AgentAccount,
} from './lib/agentAuth'
import { ImportPanel } from './components/ImportPanel'
import { HeroSection } from './components/HeroSection'
import { PropertyStats } from './components/PropertyStats'
import { ImageGallery } from './components/ImageGallery'
import { NeighborhoodSection } from './components/NeighborhoodSection'
import { MarketTrendsSection } from './components/MarketTrendsSection'
import { FeatureGrid } from './components/FeatureGrid'
import { LifestyleSection } from './components/LifestyleSection'
import { AgentSection } from './components/AgentSection'
import { Footer } from './components/Footer'
import { Toolbar } from './components/Toolbar'
import { PrintBrochure } from './components/PrintBrochure'
import { EditFactsPanel } from './components/EditFactsPanel'
import { AuthScreen } from './components/AuthScreen'
import { SectionNav } from './components/SectionNav'
import { AgentProfilePanel } from './components/AgentProfilePanel'

function hasMissingStats(listing: Listing) {
  return listing.stats.some(
    (s) => s.label !== 'Walk Score' && (!s.value || s.value === '—'),
  )
}

function needsEditAttention(listing: Listing, usedExamplePhotos: boolean) {
  return hasMissingStats(listing) || listing.images.length === 0 || usedExamplePhotos
}

export default function App() {
  const [account, setAccount] = useState<AgentAccount | null>(() => loadSession())
  const [profileOpen, setProfileOpen] = useState(false)
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('brochure_theme') === 'dark'
  })
  const [listing, setListing] = useState<Listing | null>(null)
  const [source, setSource] = useState<ListingSource | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [usedExamplePhotos, setUsedExamplePhotos] = useState(false)
  const [importNotice, setImportNotice] = useState('')

  const agent = account ? toAgent(account) : null
  const missing = useMemo(
    () => (listing ? needsEditAttention(listing, usedExamplePhotos) : false),
    [listing, usedExamplePhotos],
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    document.body.style.background = dark ? '#071421' : '#fcfaf6'
    window.localStorage.setItem('brochure_theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    if (!listing || !agent) return
    const prev = document.title
    document.title = `${listing.address} · ${agent.name}`
    return () => {
      document.title = prev
    }
  }, [listing, agent])

  function handleSignedIn(next: AgentAccount) {
    setAccount(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleProfileSaved(next: AgentAccount) {
    setAccount(next)
    setListing((current) => (current ? applyAgentToListing(current, toAgent(next)) : current))
  }

  function handleSignOut() {
    signOut()
    setAccount(null)
    setListing(null)
    setSource(null)
    setEditOpen(false)
    setProfileOpen(false)
    setUsedExamplePhotos(false)
    setImportNotice('')
  }

  if (!account || !agent) {
    return <AuthScreen onSignedIn={handleSignedIn} />
  }

  if (!listing) {
    return (
      <>
        <ImportPanel
          agent={agent}
          onEditProfile={() => setProfileOpen(true)}
          onSignOut={handleSignOut}
          onImported={(next, detected, meta) => {
            setListing(applyAgentToListing(next, agent))
            setSource(detected)
            setUsedExamplePhotos(Boolean(meta?.usedExamplePhotos))
            setImportNotice(meta?.notice || '')
            setEditOpen(needsEditAttention(next, Boolean(meta?.usedExamplePhotos)))
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          onDemo={() => {
            setListing(applyAgentToListing(demoListing, agent))
            setSource('unknown')
            setUsedExamplePhotos(false)
            setImportNotice('')
            setEditOpen(false)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        />
        <AgentProfilePanel
          account={account}
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          onSaved={handleProfileSaved}
        />
      </>
    )
  }

  return (
    <div className={dark ? 'bg-[#071421] text-[#f7f3ec]' : 'bg-paper text-ink'}>
      <Toolbar
        dark={dark}
        agent={agent}
        onToggleTheme={() => setDark((v) => !v)}
        onNewListing={() => {
          setListing(null)
          setSource(null)
          setEditOpen(false)
          setUsedExamplePhotos(false)
          setImportNotice('')
        }}
        onEditFacts={() => setEditOpen(true)}
        onEditProfile={() => setProfileOpen(true)}
        onSignOut={handleSignOut}
      />

      <div className="no-print sticky top-0 z-40 space-y-0">
        <div className="border-b border-stone-light/40 bg-warm/95 px-4 py-2 text-center text-xs uppercase tracking-[0.18em] text-stone backdrop-blur transition-colors dark:border-white/10 dark:bg-[#0c1f33]/95 dark:text-stone-light/75">
          {source && source !== 'unknown'
            ? `Generated from ${sourceLabel(source)} RapidAPI · ${agent.name} · ${agent.brokerage}${
                missing ? ' · Review photos/stats in Edit brochure' : ''
              }`
            : `Demo brochure · ${agent.name} · ${agent.brokerage}`}
        </div>
        <div className="border-b border-amber-200/40 bg-amber-50 px-4 py-2 text-center text-xs leading-relaxed text-ink/80 transition-colors dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-50/90">
          Import supports Compass, Zillow, and Redfin via separate RapidAPI keys.
          {usedExamplePhotos
            ? ' Example listing photos are showing because the API returned no photo URLs — replace them in Edit brochure.'
            : ''}
          {importNotice && !usedExamplePhotos ? ` ${importNotice}` : ''}
        </div>
        <SectionNav />
      </div>

      <div className="screen-only">
        <main>
          <HeroSection listing={listing} />
          <PropertyStats listing={listing} />
          <ImageGallery listing={listing} />
          <NeighborhoodSection listing={listing} />
          <MarketTrendsSection listing={listing} />
          <FeatureGrid listing={listing} />
          <LifestyleSection listing={listing} />
          <AgentSection listing={listing} />
        </main>
        <Footer listing={listing} />
      </div>

      <PrintBrochure listing={listing} />

      <EditFactsPanel
        listing={listing}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={(next) => {
          setListing(applyAgentToListing(next, agent))
          const stillExample = next.images.some((img) => /example listing photo/i.test(img.alt))
          setUsedExamplePhotos(stillExample)
        }}
      />

      <AgentProfilePanel
        account={account}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onSaved={handleProfileSaved}
      />
    </div>
  )
}
