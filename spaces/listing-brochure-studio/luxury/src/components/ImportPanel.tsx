import { useMemo, useState } from 'react'
import { Link2, Loader2, Sparkles } from 'lucide-react'
import { detectSource, importListingFromUrl, sourceLabel, type ListingSource } from '../lib/listingImport'
import type { Listing } from '../data/listing'

export function ImportPanel({
  onImported,
  onDemo,
}: {
  onImported: (listing: Listing, source: ListingSource, meta?: { usedExamplePhotos: boolean; notice: string }) => void
  onDemo: () => void
}) {
  const [url, setUrl] = useState('')
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem('rapidapi_key') || '')
  const [status, setStatus] = useState('Paste a Compass listing URL to scrape photos and facts via RapidAPI.')
  const [loading, setLoading] = useState(false)
  const source = useMemo(() => (url.trim() ? detectSource(url) : null), [url])

  async function handleImport() {
    setLoading(true)
    setStatus('Fetching Compass listing + photos via RapidAPI…')
    try {
      sessionStorage.setItem('rapidapi_key', apiKey.trim())
      const result = await importListingFromUrl(url, apiKey)
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
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-soft">
          Jason Lim · Compass · DRE #02444964
        </p>
        <h1 className="editorial-display mt-4 text-5xl md:text-6xl">Create a luxury listing brochure</h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
          Paste a Compass listing link. We scrape photos and facts with the Compass RapidAPI, then compose an
          editorial brochure — refine anything in Edit brochure before Print / PDF.
        </p>

        <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-md md:p-8">
          <label className="text-[11px] uppercase tracking-[0.22em] text-white/50">Compass listing URL</label>
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-ink">
            <Link2 className="h-5 w-5 shrink-0 text-stone" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.compass.com/homedetails/…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-stone/70 md:text-base"
            />
          </div>

          {source && source !== 'unknown' && (
            <p className="mt-3 text-sm text-gold-soft">
              Detected source: <span className="font-semibold">{sourceLabel(source)}</span>
              {source !== 'compass' ? ' — not supported in this build (Compass only)' : ''}
            </p>
          )}

          <details className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-3" open>
            <summary className="cursor-pointer text-sm text-white/80">RapidAPI key (Compass Data API)</summary>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste RapidAPI key"
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm outline-none"
            />
            <p className="mt-2 text-xs leading-relaxed text-white/50">
              Stored in this browser session only. Subscribe to{' '}
              <span className="text-white/70">Compass.com Real Estate Data API</span> on RapidAPI, then paste your
              key. We call <code className="text-gold-soft">/compass/property</code> to scrape listing photos +
              facts.
            </p>
          </details>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={loading}
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

          <div className="mt-6 rounded-2xl border border-amber-200/25 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-50/90">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100/80">Notice</p>
            <p className="mt-2">
              This version uses the <strong className="font-semibold text-white">Compass.com RapidAPI</strong> only
              (PullAPI Compass Data API). It does <strong className="font-semibold text-white">not</strong> call
              Zillow or Redfin — those portals need their own separate RapidAPI products. If Compass returns no
              photos, example listing photos are filled in so you can still design the brochure, then swap them in{' '}
              <strong className="font-semibold text-white">Edit brochure</strong>.
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/45">Example</p>
            <p className="mt-1 text-xs text-white/70">compass.com/homedetails/…</p>
          </div>
        </div>

        <p className="mt-8 text-xs text-white/40">
          Tip: after import, open Edit brochure to reorder scraped Compass photos or upload your MLS gallery.
        </p>
      </div>
    </section>
  )
}
