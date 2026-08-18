import type { CompStatus, Listing, MarketComp, MarketReport } from '../data/listing'

function money(value: unknown): string {
  if (value == null || value === '') return ''
  if (typeof value === 'string' && value.trim().startsWith('$')) return value.trim()
  const n = Number(String(value).replace(/[^\d.]/g, ''))
  if (!Number.isFinite(n) || n <= 0) return ''
  return `$${Math.round(n).toLocaleString()}`
}

function asString(value: unknown, fallback = ''): string {
  if (value == null) return fallback
  return String(value).trim()
}

function num(value: unknown): number | null {
  if (value == null || value === '') return null
  const n = Number(String(value).replace(/[^\d.]/g, ''))
  return Number.isFinite(n) && n > 0 ? n : null
}

function priceNum(value: string): number | null {
  return num(value)
}

export function emptyMarketReport(area = ''): MarketReport {
  return {
    area,
    sourceLabel: '',
    summary: 'Nearby sold and listed comps appear after import when a RapidAPI key can search this ZIP.',
    medianSold: '—',
    medianList: '—',
    avgPpsf: '—',
    soldCount: 0,
    listedCount: 0,
    comps: [],
  }
}

function detectStatus(raw: Record<string, unknown>, fallback?: CompStatus): CompStatus {
  const blob = [
    raw.status,
    raw.homeStatus,
    raw.listingStatus,
    raw.mlsStatus,
    raw.home_status,
    raw.soldDate,
    raw.dateSold,
    raw.dateSoldString,
  ]
    .map((v) => asString(v).toLowerCase())
    .join(' ')
  if (/pending|contingent|under contract/.test(blob)) return 'pending'
  if (/recently.?sold|recently_sold/.test(blob)) return 'sold'
  if (/sold|sale closed|closed/.test(blob) || raw.soldDate || raw.dateSold || raw.dateSoldString) {
    if (!/for sale|listed|active|for_sale/.test(blob)) return 'sold'
  }
  if (/for.?sale|for_sale|listed|active|coming soon|new listing/.test(blob)) return 'listed'
  return fallback || 'listed'
}

function dateLabel(raw: Record<string, unknown>, status: CompStatus): string {
  const sold = asString(raw.dateSoldString || raw.dateSold || raw.soldDate || raw.soldOn || raw.closeDate)
  const listed = asString(raw.listDate || raw.listedDate || raw.onMarketDate || raw.listingDate)
  const days = num(raw.daysOnZillow || raw.daysOnMarket || raw.dom)
  if (status === 'sold' && sold) return formatDate(sold)
  if (listed) return formatDate(listed)
  if (days != null) return `${Math.round(days)} days on market`
  return status === 'sold' ? 'Recently sold' : 'On the market'
}

function formatDate(value: string): string {
  const ms = Date.parse(value)
  if (!Number.isFinite(ms)) {
    if (/^\d{5,}$/.test(value)) {
      const fromEpoch = Number(value) > 1e12 ? Number(value) : Number(value) * 1000
      const d = new Date(fromEpoch)
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      }
    }
    return value
  }
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function addressOf(raw: Record<string, unknown>): string {
  if (typeof raw.address === 'string' && raw.address.trim()) return raw.address.trim()
  const nested = raw.address && typeof raw.address === 'object' ? (raw.address as Record<string, unknown>) : null
  return (
    asString(
      raw.streetAddress ||
        raw.street_address ||
        raw.addressStreet ||
        raw.streetLine ||
        nested?.streetAddress ||
        nested?.street ||
        raw.name,
    ) || 'Address on request'
  )
}

function cityOf(raw: Record<string, unknown>): string {
  const nested = raw.address && typeof raw.address === 'object' ? (raw.address as Record<string, unknown>) : null
  return asString(raw.city || raw.addressCity || nested?.city || nested?.addressLocality)
}

export function normalizeComp(raw: Record<string, unknown>, fallbackStatus?: CompStatus): MarketComp | null {
  const address = addressOf(raw)
  const price = money(
    raw.price ||
      raw.unformattedPrice ||
      raw.extracted_price ||
      raw.listPrice ||
      raw.soldPrice ||
      raw.lastSoldPrice ||
      raw.priceInfo,
  )
  if ((!address || address === 'Address on request') && !price) return null
  const status = detectStatus(raw, fallbackStatus)
  const sqftN = num(
    raw.livingArea ||
      raw.sqft ||
      raw.sqFt ||
      raw.squareFeet ||
      raw.livingAreaValue ||
      raw.area,
  )
  const priceN = priceNum(price)
  const ppsf = sqftN && priceN ? `$${Math.round(priceN / sqftN).toLocaleString()}` : ''
  const beds = num(raw.bedrooms || raw.beds || raw.bed)
  const baths = num(raw.bathrooms || raw.baths || raw.bath)
  const photoRaw =
    raw.imgSrc ||
    raw.image ||
    raw.photo ||
    raw.primaryPhoto ||
    raw.thumbnail ||
    (Array.isArray(raw.photos) ? raw.photos[0] : '') ||
    (Array.isArray(raw.images) ? raw.images[0] : '')
  const photo = asString(photoRaw)
  const url = asString(raw.detailUrl || raw.url || raw.hdpUrl || raw.link || raw.listingUrl || raw.href)

  return {
    address: address && address !== 'Address on request' ? address : 'Address on request',
    city: cityOf(raw),
    status,
    price: price || 'Price on request',
    beds: beds != null ? String(beds) : '—',
    baths: baths != null ? String(baths) : '—',
    sqft: sqftN != null ? `${Math.round(sqftN).toLocaleString()} SF` : '—',
    dateLabel: dateLabel(raw, status),
    pricePerSqft: ppsf ? `${ppsf}/SF` : '—',
    photo: photo.startsWith('http') ? photo : '',
    url,
  }
}

const ARRAY_KEYS = [
  'props',
  'comps',
  'homes',
  'listings',
  'properties',
  'results',
  'similarHomes',
  'similarProperties',
  'similarListings',
  'nearbyHomes',
  'nearbySales',
  'comparables',
  'solds',
  'forSale',
  'recentlySold',
  'data',
  'searchResults',
  'recommendedHomes',
  'relatedProperties',
]

function looksLikeProperty(raw: Record<string, unknown>): boolean {
  const hasPrice = Boolean(
    raw.price || raw.unformattedPrice || raw.extracted_price || raw.listPrice || raw.soldPrice,
  )
  const addr = addressOf(raw)
  const hasAddr = addr && addr !== 'Address on request'
  return hasPrice && (hasAddr || raw.zpid != null)
}

function deepCollectRecords(payload: unknown, into: Record<string, unknown>[], depth = 0) {
  if (!payload || depth > 7) return
  if (Array.isArray(payload)) {
    for (const item of payload) {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        const rec = item as Record<string, unknown>
        if (looksLikeProperty(rec)) into.push(rec)
        else deepCollectRecords(rec, into, depth + 1)
      }
    }
    return
  }
  if (typeof payload !== 'object') return
  const obj = payload as Record<string, unknown>
  for (const key of ARRAY_KEYS) {
    if (obj[key] != null) collectRecords(obj[key], into, depth + 1)
  }
  for (const value of Object.values(obj)) {
    if (value && typeof value === 'object') deepCollectRecords(value, into, depth + 1)
  }
}

function collectRecords(payload: unknown, into: Record<string, unknown>[], depth = 0) {
  if (!payload || depth > 5) return
  if (Array.isArray(payload)) {
    for (const item of payload) {
      if (item && typeof item === 'object' && !Array.isArray(item)) into.push(item as Record<string, unknown>)
    }
    return
  }
  if (typeof payload !== 'object') return
  const obj = payload as Record<string, unknown>
  for (const key of ARRAY_KEYS) {
    if (obj[key] != null) collectRecords(obj[key], into, depth + 1)
  }
}

export function compsFromPayload(payload: unknown, fallbackStatus?: CompStatus): MarketComp[] {
  const records: Record<string, unknown>[] = []
  collectRecords(payload, records)
  deepCollectRecords(payload, records)
  const seen = new Set<string>()
  const comps: MarketComp[] = []
  for (const rec of records) {
    const comp = normalizeComp(rec, fallbackStatus)
    if (!comp) continue
    const key = `${comp.address}|${comp.status}|${comp.price}`.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    comps.push(comp)
  }
  return comps
}

function median(values: number[]): number | null {
  const sorted = values.filter((n) => n > 0).sort((a, b) => a - b)
  if (!sorted.length) return null
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function sameHome(comp: MarketComp, listing: Pick<Listing, 'address'>): boolean {
  const a = listing.address.toLowerCase().replace(/[^a-z0-9]/g, '')
  const b = comp.address.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (!a || a.length < 6) return false
  return b.includes(a) || a.includes(b)
}

export function buildMarketReport(
  listing: Pick<Listing, 'address' | 'city' | 'neighborhood' | 'zip'>,
  comps: MarketComp[],
  sources: string[],
): MarketReport {
  const area = [listing.neighborhood, listing.city, listing.zip].filter(Boolean).join(' · ') || 'This area'
  const nearby = comps.filter((c) => !sameHome(c, listing))
  const sold = nearby.filter((c) => c.status === 'sold')
  const listed = nearby.filter((c) => c.status === 'listed' || c.status === 'pending')
  const soldPrices = sold.map((c) => priceNum(c.price)).filter((n): n is number => n != null)
  const listPrices = listed.map((c) => priceNum(c.price)).filter((n): n is number => n != null)
  const ppsfValues = nearby
    .map((c) => {
      const fromLabel = num(c.pricePerSqft)
      if (fromLabel) return fromLabel
      const p = priceNum(c.price)
      const sq = num(c.sqft)
      return p && sq ? p / sq : null
    })
    .filter((n): n is number => n != null)

  const medSold = median(soldPrices)
  const medList = median(listPrices)
  const avgPpsf = ppsfValues.length ? Math.round(ppsfValues.reduce((a, b) => a + b, 0) / ppsfValues.length) : null

  const picked = [
    ...sold.slice(0, 6),
    ...listed.filter((c) => c.status === 'listed').slice(0, 5),
    ...listed.filter((c) => c.status === 'pending').slice(0, 2),
  ].slice(0, 12)

  const sourceLabel = sources.filter(Boolean).join(' · ')
  const summary = picked.length
    ? `${sold.length} recent sale${sold.length === 1 ? '' : 's'} and ${listed.length} active/pending listing${listed.length === 1 ? '' : 's'} near ${listing.neighborhood || listing.city || 'this home'}.`
    : emptyMarketReport(area).summary

  return {
    area,
    sourceLabel,
    summary,
    medianSold: medSold ? `$${Math.round(medSold).toLocaleString()}` : '—',
    medianList: medList ? `$${Math.round(medList).toLocaleString()}` : '—',
    avgPpsf: avgPpsf ? `$${avgPpsf.toLocaleString()}/SF` : '—',
    soldCount: sold.length,
    listedCount: listed.length,
    comps: picked,
  }
}
