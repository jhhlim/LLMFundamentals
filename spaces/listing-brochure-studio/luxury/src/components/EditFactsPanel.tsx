import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, ImagePlus, Star, Trash2, Upload } from 'lucide-react'
import type { Listing, ListingImage, ListingStat } from '../data/listing'
import { syncLifestyleFromImages } from '../lib/listingImport'

function updateStat(stats: ListingStat[], label: string, value: string): ListingStat[] {
  return stats.map((s) => (s.label === label ? { ...s, value: value.trim() || '—' } : s))
}

const SPANS: ListingImage['span'][] = ['hero', 'wide', 'tall', 'square', 'wide', 'square', 'tall', 'square']

function withSpans(images: ListingImage[]): ListingImage[] {
  return images.map((img, i) => ({
    ...img,
    span: i === 0 ? 'hero' : SPANS[i] || 'square',
    alt: img.alt || `Listing photo ${i + 1}`,
  }))
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
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
  const [photoUrl, setPhotoUrl] = useState('')
  const [tab, setTab] = useState<'photos' | 'facts'>('photos')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setDraft(listing)
      setPhotoUrl('')
      setTab(listing.images.length ? 'photos' : 'photos')
    }
  }, [open, listing])

  if (!open) return null

  const getStat = (label: string) => draft.stats.find((s) => s.label === label)?.value || ''
  const setStat = (label: string, value: string) => {
    setDraft((prev) => ({ ...prev, stats: updateStat(prev.stats, label, value) }))
  }

  const setImages = (images: ListingImage[]) => {
    setDraft((prev) => syncLifestyleFromImages({ ...prev, images: withSpans(images) }))
  }

  const moveImage = (index: number, dir: -1 | 1) => {
    const next = [...draft.images]
    const j = index + dir
    if (j < 0 || j >= next.length) return
    ;[next[index], next[j]] = [next[j], next[index]]
    setImages(next)
  }

  const removeImage = (index: number) => {
    setImages(draft.images.filter((_, i) => i !== index))
  }

  const setAsCover = (index: number) => {
    if (index === 0) return
    const next = [...draft.images]
    const [picked] = next.splice(index, 1)
    next.unshift(picked)
    setImages(next)
  }

  const addUrl = () => {
    const url = photoUrl.trim()
    if (!url) return
    setImages([...draft.images, { src: url, alt: `Listing photo ${draft.images.length + 1}`, span: 'square' }])
    setPhotoUrl('')
  }

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return
    const added: ListingImage[] = []
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      try {
        const src = await readFileAsDataUrl(file)
        added.push({
          src,
          alt: file.name.replace(/\.[^.]+$/, '') || `Upload ${draft.images.length + added.length + 1}`,
          span: 'square',
        })
      } catch {
        // skip unreadable
      }
    }
    if (added.length) setImages([...draft.images, ...added])
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="no-print fixed inset-0 z-[60] flex items-end justify-center bg-ink/45 p-4 backdrop-blur-sm md:items-center">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[1.5rem] bg-paper p-5 shadow-2xl md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Edit brochure</p>
            <h3 className="editorial-display mt-2 text-3xl text-ink">Photos & facts</h3>
            <p className="mt-2 text-sm text-stone">
              Use RapidAPI photos when available — or upload / paste URLs here. If you see example
              stand-in photos, replace them with the real listing gallery before Print / PDF.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full px-3 py-1 text-sm text-stone hover:bg-warm">
            Close
          </button>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => setTab('photos')}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              tab === 'photos' ? 'bg-ink text-white' : 'bg-warm text-ink hover:bg-stone-light/40'
            }`}
          >
            Listing photos ({draft.images.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('facts')}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              tab === 'facts' ? 'bg-ink text-white' : 'bg-warm text-ink hover:bg-stone-light/40'
            }`}
          >
            Facts & copy
          </button>
        </div>

        {tab === 'photos' && (
          <div className="mt-6">
            {!draft.images.length && (
              <p className="rounded-2xl border border-dashed border-stone-light/70 bg-warm/60 px-4 py-6 text-center text-sm text-stone">
                No listing photos yet. Upload from your MLS download, or paste image URLs from the portal.
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              {draft.images.map((img, index) => (
                <div
                  key={`${img.src.slice(0, 48)}-${index}`}
                  className="overflow-hidden rounded-2xl border border-stone-light/50 bg-white"
                >
                  <div className="relative aspect-[4/3] bg-warm">
                    <img src={img.src} alt={img.alt} className="h-full w-full object-cover" />
                    {index === 0 && (
                      <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2.5 py-1 text-[10px] uppercase tracking-wider text-gold-soft">
                        Cover
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1 p-2">
                    <button
                      type="button"
                      title="Move up"
                      className="rounded-lg p-2 text-stone hover:bg-warm disabled:opacity-30"
                      disabled={index === 0}
                      onClick={() => moveImage(index, -1)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Move down"
                      className="rounded-lg p-2 text-stone hover:bg-warm disabled:opacity-30"
                      disabled={index === draft.images.length - 1}
                      onClick={() => moveImage(index, 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Set as cover"
                      className="rounded-lg p-2 text-stone hover:bg-warm disabled:opacity-30"
                      disabled={index === 0}
                      onClick={() => setAsCover(index)}
                    >
                      <Star className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Remove"
                      className="ml-auto rounded-lg p-2 text-stone hover:bg-red-50 hover:text-red-700"
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <label className="block border-t border-stone-light/40 px-3 py-2 text-xs">
                    <span className="mb-1 block font-semibold text-stone">Caption</span>
                    <input
                      className="w-full rounded-lg border border-stone-light/50 bg-paper px-2 py-1.5 text-sm"
                      value={img.alt}
                      onChange={(e) => {
                        const next = draft.images.map((row, i) =>
                          i === index ? { ...row, alt: e.target.value } : row,
                        )
                        setImages(next)
                      }}
                    />
                  </label>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 rounded-2xl border border-stone-light/50 bg-white p-4">
              <p className="text-sm font-semibold text-ink">Add photos</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Upload from computer
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => void addFiles(e.target.files)}
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  className="flex-1 rounded-xl border border-stone-light/60 bg-paper px-3 py-2 text-sm"
                  placeholder="Paste image URL (Compass CDN or MLS photo link)"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addUrl()
                    }
                  }}
                />
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 px-4 py-2.5 text-sm font-medium text-ink hover:bg-warm"
                  onClick={addUrl}
                >
                  <ImagePlus className="h-4 w-4" />
                  Add URL
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'facts' && (
          <>
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
                <span className="mb-1 block font-semibold">City</span>
                <input
                  className="w-full rounded-xl border border-stone-light/60 bg-white px-3 py-2"
                  value={draft.city}
                  onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-semibold">State / ZIP</span>
                <div className="flex gap-2">
                  <input
                    className="w-20 rounded-xl border border-stone-light/60 bg-white px-3 py-2"
                    value={draft.state}
                    onChange={(e) => setDraft({ ...draft, state: e.target.value })}
                    placeholder="CA"
                  />
                  <input
                    className="flex-1 rounded-xl border border-stone-light/60 bg-white px-3 py-2"
                    value={draft.zip}
                    onChange={(e) => setDraft({ ...draft, zip: e.target.value })}
                    placeholder="95125"
                  />
                </div>
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
              <label className="text-sm">
                <span className="mb-1 block font-semibold">Walk Score</span>
                <input
                  className="w-full rounded-xl border border-stone-light/60 bg-white px-3 py-2"
                  type="number"
                  min={0}
                  max={100}
                  value={draft.walkScore || ''}
                  onChange={(e) => {
                    const n = Math.min(100, Math.max(0, Number(e.target.value) || 0))
                    setDraft({
                      ...draft,
                      walkScore: n,
                      stats: updateStat(draft.stats, 'Walk Score', n > 0 ? String(n) : '—'),
                    })
                  }}
                  placeholder="e.g. 78"
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
          </>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white"
            onClick={() => {
              onSave(syncLifestyleFromImages(draft))
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
