import { useEffect, useMemo, useState } from 'react'
import { demoListing, type Listing } from './data/listing'
import type { ListingSource } from './lib/listingImport'
import {
  applyAgentToListing,
  isAdminAccount,
  loadSession,
  signOut,
  toAgent,
  type AgentAccount,
} from './lib/agentAuth'
import { ImportPanel } from './components/ImportPanel'
import { Footer } from './components/Footer'
import { Toolbar } from './components/Toolbar'
import { PrintBrochure } from './components/PrintBrochure'
import { EditFactsPanel } from './components/EditFactsPanel'
import { AuthScreen } from './components/AuthScreen'
import { SectionNav } from './components/SectionNav'
import { AgentProfilePanel } from './components/AgentProfilePanel'
import { LandingPage } from './components/LandingPage'
import { PreviewToolbar } from './components/PreviewToolbar'
import { DebugBanners } from './components/DebugBanners'
import { BrochurePages } from './components/BrochurePages'

type GuestView = 'landing' | 'preview' | 'auth'

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
  const [guestView, setGuestView] = useState<GuestView>('landing')
  const [profileOpen, setProfileOpen] = useState(false)
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('brochure_theme') === 'dark'
  })
  const [listing, setListing] = useState<Listing | null>(null)
  const [source, setSource] = useState<ListingSource | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [usedExamplePhotos, setUsedExamplePhotos] = useState(false)

  const agent = account ? toAgent(account) : null
  const isAdmin = isAdminAccount(account)
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

  useEffect(() => {
    if (guestView === 'preview' && !account) {
      const prev = document.title
      document.title = `${demoListing.address} · Sample brochure`
      return () => {
        document.title = prev
      }
    }
  }, [guestView, account])

  function handleSignedIn(next: AgentAccount) {
    setAccount(next)
    setGuestView('landing')
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
    setGuestView('landing')
  }

  if (!account || !agent) {
    if (guestView === 'preview') {
      return (
        <div className={dark ? 'bg-[#071421] text-[#f7f3ec]' : 'bg-paper text-ink'}>
          <PreviewToolbar
            dark={dark}
            onToggleTheme={() => setDark((v) => !v)}
            onSignIn={() => setGuestView('auth')}
            onHome={() => setGuestView('landing')}
          />
          <div className="no-print border-b border-stone-light/30 bg-paper/90 px-4 py-2 text-center text-[11px] uppercase tracking-[0.2em] text-stone backdrop-blur dark:border-white/10 dark:bg-[#0c1f33]/90 dark:text-stone-light/70">
            Sample brochure · {demoListing.neighborhood}, {demoListing.city}
          </div>
          <SectionNav />
          <div className="screen-only pb-36">
            <BrochurePages listing={demoListing} />
            <Footer listing={demoListing} />
          </div>
          <PrintBrochure listing={demoListing} />
        </div>
      )
    }

    if (guestView === 'auth') {
      return (
        <AuthScreen
          onSignedIn={handleSignedIn}
          onPreview={() => setGuestView('preview')}
          onHome={() => setGuestView('landing')}
        />
      )
    }

    return (
      <LandingPage
        onPreview={() => {
          setGuestView('preview')
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        onSignIn={() => setGuestView('auth')}
      />
    )
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
            setEditOpen(needsEditAttention(next, Boolean(meta?.usedExamplePhotos)))
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          onDemo={() => {
            setListing(applyAgentToListing(demoListing, agent))
            setSource('unknown')
            setUsedExamplePhotos(false)
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
        }}
        onEditFacts={() => setEditOpen(true)}
        onEditProfile={() => setProfileOpen(true)}
        onSignOut={handleSignOut}
      />

      {isAdmin ? (
        <DebugBanners
          source={source}
          agent={agent}
          missing={missing}
          usedExamplePhotos={usedExamplePhotos}
        />
      ) : null}

      <SectionNav />

      <div className="screen-only pb-36">
        <BrochurePages listing={listing} />
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
