import { useMemo, useState } from 'react'
import { Link2, Loader2, Sparkles } from 'lucide-react'
import { detectSource, importListingFromUrl, sourceLabel, type ListingSource } from '../lib/listingImport'
import type { Listing } from '../data/listing'

const EXAMPLES = [
  { label: 'Compass', hint: 'compass.com/homedetails/...' },
  { label: 'Zillow', hint: 'zillow.com/homedetails/.../..._zpid/' },
  { label: 'Redfin', hint: 'redfin.com/.../home/...' },
]

export function ImportPanel({
  onImported,
  onDemo,
}: {
  onImported: (listing: Listing, source: ListingSource) => void
  onDemo: () => void
}) {
  const [url, setUrl] = useState('')
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem('rapidapi_key') || '')
  const [status, setStatus] = useState('Paste a Compass, Zillow, or Redfin listing URL to generate the brochure.')
  const [loading, setLoading] = useState(false)
  const source = useMemo(() => (url.trim() ? detectSource(url) : null), [url])

  async function handleImport() {
    setLoading(true)
    setStatus('Fetching listing details…')
    try {
      sessionStorage.setItem('rapidapi_key', apiKey.trim())
      const { listing, source: detected } = await importListingFromUrl(url, apiKey)
      setStatus(`Loaded from ${sourceLabel(detected)}. Generating brochure…`)
      onImported(listing, detected)
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
          Submit a listing link from Compass, Zillow, or Redfin. We’ll pull photos and facts, then compose an
          editorial brochure you can present to Silicon Valley sellers.
        </p>

        <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-md md:p-8">
          <label className="text-[11px] uppercase tracking-[0.22em] text-white/50">Listing URL</label>
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-ink">
            <Link2 className="h-5 w-5 shrink-0 text-stone" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.compass.com/homedetails/… or Zillow / Redfin"
              className="w-full bg-transparent text-sm outline-none placeholder:text-stone/70 md:text-base"
            />
          </div>

          {source && (
            <p className="mt-3 text-sm text-gold-soft">
              Detected source: <span className="font-semibold">{sourceLabel(source)}</span>
            </p>
          )}

          <details className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <summary className="cursor-pointer text-sm text-white/80">RapidAPI key (required for live import)</summary>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste RapidAPI key"
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm outline-none"
            />
            <p className="mt-2 text-xs leading-relaxed text-white/50">
              Stored in this browser session only. Compass uses your existing Compass RapidAPI subscription.
              Zillow/Redfin require those scraper APIs subscribed on the same RapidAPI account.
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

          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            {EXAMPLES.map((ex) => (
              <div key={ex.label} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">{ex.label}</p>
                <p className="mt-1 text-xs text-white/70">{ex.hint}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-xs text-white/40">
          MLS / Realtor.com links need an IDX feed or a dedicated scraper subscription. Third-party portal APIs are
          not official MLS feeds — use for marketing demos with care.
        </p>
      </div>
    </section>
  )
}
