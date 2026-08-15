import { useEffect, useState } from 'react'
import type { Listing, ListingStat } from '../data/listing'

function updateStat(stats: ListingStat[], label: string, value: string): ListingStat[] {
  return stats.map((s) => (s.label === label ? { ...s, value: value.trim() || '—' } : s))
}

export function EditFactsPanel({
  listing,
  open,
  onClose,
  onSave,
}: {
  listing: Listing
  open: boolean
  onClose: () => void
  onSave: (next: Listing) => void
}) {
  const [draft, setDraft] = useState(listing)

  useEffect(() => {
    if (open) setDraft(listing)
  }, [open, listing])

  if (!open) return null

  const getStat = (label: string) => draft.stats.find((s) => s.label === label)?.value || ''
  const setStat = (label: string, value: string) => {
    setDraft((prev) => ({ ...prev, stats: updateStat(prev.stats, label, value) }))
  }

  return (
    <div className="no-print fixed inset-0 z-[60] flex items-end justify-center bg-ink/45 p-4 backdrop-blur-sm md:items-center">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[1.5rem] bg-paper p-5 shadow-2xl md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Edit listing facts</p>
            <h3 className="editorial-display mt-2 text-3xl text-ink">Fill in missing data</h3>
            <p className="mt-2 text-sm text-stone">
              Portal imports often return incomplete fields. Edit here so the brochure and PDF show full stats.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full px-3 py-1 text-sm text-stone hover:bg-warm">
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Address</span>
            <input
              className="w-full rounded-xl border border-stone-light/60 bg-white px-3 py-2"
              value={draft.address}
              onChange={(e) => setDraft({ ...draft, address: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Neighborhood</span>
            <input
              className="w-full rounded-xl border border-stone-light/60 bg-white px-3 py-2"
              value={draft.neighborhood}
              onChange={(e) => setDraft({ ...draft, neighborhood: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Price</span>
            <input
              className="w-full rounded-xl border border-stone-light/60 bg-white px-3 py-2"
              value={draft.price}
              onChange={(e) => setDraft({ ...draft, price: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Headline</span>
            <input
              className="w-full rounded-xl border border-stone-light/60 bg-white px-3 py-2"
              value={draft.headline}
              onChange={(e) => setDraft({ ...draft, headline: e.target.value })}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Bedrooms</span>
            <input
              className="w-full rounded-xl border border-stone-light/60 bg-white px-3 py-2"
              value={getStat('Bedrooms') === '—' ? '' : getStat('Bedrooms')}
              onChange={(e) => setStat('Bedrooms', e.target.value)}
              placeholder="e.g. 4"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Bathrooms</span>
            <input
              className="w-full rounded-xl border border-stone-light/60 bg-white px-3 py-2"
              value={getStat('Bathrooms') === '—' ? '' : getStat('Bathrooms')}
              onChange={(e) => setStat('Bathrooms', e.target.value)}
              placeholder="e.g. 3"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Living Area</span>
            <input
              className="w-full rounded-xl border border-stone-light/60 bg-white px-3 py-2"
              value={getStat('Living Area') === '—' ? '' : getStat('Living Area')}
              onChange={(e) => setStat('Living Area', e.target.value)}
              placeholder="e.g. 2,450 SF"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Lot Size</span>
            <input
              className="w-full rounded-xl border border-stone-light/60 bg-white px-3 py-2"
              value={getStat('Lot Size') === '—' ? '' : getStat('Lot Size')}
              onChange={(e) => setStat('Lot Size', e.target.value)}
              placeholder="e.g. 6,100 SF"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Garage</span>
            <input
              className="w-full rounded-xl border border-stone-light/60 bg-white px-3 py-2"
              value={getStat('Garage') === '—' ? '' : getStat('Garage')}
              onChange={(e) => setStat('Garage', e.target.value)}
              placeholder="e.g. 2 Car"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Year Built</span>
            <input
              className="w-full rounded-xl border border-stone-light/60 bg-white px-3 py-2"
              value={getStat('Year Built') === '—' ? '' : getStat('Year Built')}
              onChange={(e) => setStat('Year Built', e.target.value)}
              placeholder="e.g. 2019"
            />
          </label>
        </div>

        <label className="mt-3 block text-sm">
          <span className="mb-1 block font-semibold">About / description</span>
          <textarea
            className="min-h-28 w-full rounded-xl border border-stone-light/60 bg-white px-3 py-2"
            value={draft.about}
            onChange={(e) => setDraft({ ...draft, about: e.target.value })}
          />
        </label>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white"
            onClick={() => {
              onSave(draft)
              onClose()
            }}
          >
            Apply to brochure
          </button>
          <button type="button" className="rounded-full px-4 py-2.5 text-sm text-stone hover:bg-warm" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
