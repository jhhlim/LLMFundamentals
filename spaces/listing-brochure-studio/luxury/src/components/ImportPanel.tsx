import { useMemo, useState } from 'react'
import { Link2, Loader2, Sparkles } from 'lucide-react'
import {
  detectSource,
  importListingFromUrl,
  loadPortalApiKeys,
  savePortalApiKeys,
  sourceLabel,
  type ListingSource,
  type PortalApiKeys,
} from '../lib/listingImport'
import type { Agent, Listing } from '../data/listing'
import { displayWebsite } from '../lib/agentAuth'

function KeyField({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string
  hint: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/15 px-3 py-3">
      <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Paste RapidAPI key'}
        className="mt-2 w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm outline-none"
      />
      <p className="mt-2 text-xs leading-relaxed text-white/45">{hint}</p>
    </div>
  )
}

export function ImportPanel({
  agent,
  onImported,
  onDemo,
  onEditProfile,
  onSignOut,
}: {
  agent: Agent
  onImported: (listing: Listing, source: ListingSource, meta?: { usedExamplePhotos: boolean; notice: string }) => void
  onDemo: () => void
  onEditProfile?: () => void
  onSignOut?: () => void
}) {
  const [url, setUrl] = useState('')
  const [keys, setKeys] = useState<PortalApiKeys>(() => loadPortalApiKeys())
  const [sharedKey, setSharedKey] = useState('')
  const [status, setStatus] = useState(
    'Paste a Compass, Zillow, or Redfin listing URL — add the matching RapidAPI key below.',
  )
  const [loading, setLoading] = useState(false)
  const source = useMemo(() => (url.trim() ? detectSource(url) : null), [url])

  const supported = source === 'compass' || source === 'zillow' || source === 'redfin'

  async function handleImport() {
    setLoading(true)
    setStatus(`Fetching ${source ? sourceLabel(source) : 'listing'} details + photos via RapidAPI…`)
    try {
      savePortalApiKeys(keys)
      const result = await importListingFromUrl(url, keys, agent)
      setStatus(result.notice)
      onImported(result.listing, result.source, {
        usedExamplePhotos: result.usedExamplePhotos,
        notice: result.notice,
      })
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Import failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-ink text-white">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80"
          alt=""
          className="h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/85 to-ink" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-soft">
            {[agent.name, agent.brokerage, agent.dre].filter(Boolean).join(' · ')}
          </p>
          <div className="flex flex-wrap gap-2">
            {onEditProfile && (
              <button
                type="button"
                onClick={onEditProfile}
                className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
              >
                Edit profile
              </button>
            )}
            {onSignOut && (
              <button
                type="button"
                onClick={onSignOut}
                className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <img src={agent.photo} alt={agent.name} className="h-14 w-14 rounded-2xl object-cover ring-1 ring-white/20" />
          <div>
            <p className="font-serif text-xl">{agent.name}</p>
            <p className="text-sm text-white/60">
              {agent.title}
              {displayWebsite(agent.website) ? ` · ${displayWebsite(agent.website)}` : ''}
            </p>
          </div>
        </div>
        <h1 className="editorial-display mt-6 text-5xl md:text-6xl">Create a luxury listing brochure</h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
          Paste a listing link from Compass, Zillow, or Redfin. We scrape photos, beds/baths, living area, lot size,
          garage, year built, and walk score — then compose an editorial brochure branded with your profile.
        </p>

        <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-md md:p-8">
          <label className="text-[11px] uppercase tracking-[0.22em] text-white/50">Listing URL</label>
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-ink">
            <Link2 className="h-5 w-5 shrink-0 text-stone" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="compass.com, zillow.com/homedetails/…, or redfin.com/…/home/…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-stone/70 md:text-base"
            />
          </div>

          {source && (
            <p className="mt-3 text-sm text-gold-soft">
              Detected source: <span className="font-semibold">{sourceLabel(source)}</span>
              {!supported ? ' — paste a Compass, Zillow, or Redfin listing URL' : ''}
            </p>
          )}

          <details className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-3" open>
            <summary className="cursor-pointer text-sm text-white/80">RapidAPI keys (one per portal)</summary>
            <p className="mt-2 text-xs leading-relaxed text-white/50">
              RapidAPI gives you <strong className="text-white/70">one account key</strong> — paste the same key in
              each field below if you are subscribed to that portal&apos;s API product on RapidAPI. Only fill the
              portals you use (e.g. Compass only if you only paste Compass URLs).
            </p>

            <div className="mt-4 rounded-xl border border-gold/20 bg-gold/5 px-3 py-3">
              <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-soft">
                Quick fill — same key for all
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                <input
                  type="password"
                  value={sharedKey}
                  onChange={(e) => setSharedKey(e.target.value)}
                  placeholder="Paste your RapidAPI key once"
                  className="min-w-[12rem] flex-1 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const k = sharedKey.trim()
                    if (!k) return
                    setKeys({ compass: k, zillow: k, redfin: k })
                  }}
                  className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gold-soft"
                >
                  Apply to all
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <KeyField
                label="Compass"
                hint="Compass.com Real Estate Data API · GET /compass/property?url=…"
                value={keys.compass || ''}
                onChange={(compass) => setKeys((k) => ({ ...k, compass }))}
              />
              <KeyField
                label="Zillow"
                hint="Subscribe to a Zillow product on RapidAPI first (a key alone is not enough). Recommended: Zillow by apimaker — rapidapi.com/apimaker/api/zillow-com1 — then paste the same account key here."
                value={keys.zillow || ''}
                onChange={(zillow) => setKeys((k) => ({ ...k, zillow }))}
              />
              <KeyField
                label="Redfin"
                hint="Subscribe to Redfin.com Data API and/or Real-Time Redfin Data on RapidAPI — not Real-Time Real Estate Data v2 unless you use that product."
                value={keys.redfin || ''}
                onChange={(redfin) => setKeys((k) => ({ ...k, redfin }))}
              />
            </div>
          </details>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={loading || !supported}
              onClick={handleImport}
              className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-gold-soft disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate brochure
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onDemo}
              className="rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Load Willow Glen demo
            </button>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-white/65">{status}</p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-relaxed text-white/70">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">Examples</p>
            <p className="mt-2 text-xs">compass.com/homedetails/…</p>
            <p className="text-xs">zillow.com/homedetails/…/12345678_zpid/</p>
            <p className="text-xs">redfin.com/CA/City/123-Main-St-90210/home/12345678</p>
          </div>
        </div>

        <p className="mt-8 text-xs text-white/40">
          Tip: after import, open Edit brochure to reorder photos or fill any stats the scraper missed.
        </p>
      </div>
    </section>
  )
}
