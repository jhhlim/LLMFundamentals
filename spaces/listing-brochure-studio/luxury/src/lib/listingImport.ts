import { demoListing, type FeatureCard, type Listing, type ListingImage, type NeighborhoodPlace } from '../data/listing'

export type ListingSource = 'compass' | 'zillow' | 'redfin' | 'realtor' | 'mls' | 'unknown'

const BRAND_AGENT = demoListing.agent

const HOSTS = {
  compass: 'compass-com-real-estate-data-api.p.rapidapi.com',
  zillow: 'zillow-scraper-api.p.rapidapi.com',
  zillowAlt: 'real-time-real-estate-data.p.rapidapi.com',
  zillow56: 'zillow56.p.rapidapi.com',
  redfin: 'redfin-com-data-api.p.rapidapi.com',
  redfinAlt: 'real-time-redfin-data.p.rapidapi.com',
} as const

/** Human-readable RapidAPI product names for subscribe hints. */
const RAPIDAPI_PRODUCT: Record<string, string> = {
  [HOSTS.compass]: 'Compass.com Real Estate Data API',
  [HOSTS.zillow]: 'Zillow Scraper API',
  [HOSTS.zillowAlt]: 'Real-Time Real-Estate Data',
  [HOSTS.zillow56]: 'Zillow56',
  [HOSTS.redfin]: 'Redfin.com Data API',
  [HOSTS.redfinAlt]: 'Real-Time Redfin Data',
}

class PortalFetchError extends Error {
  skippable: boolean

  constructor(message: string, skippable: boolean) {
    super(message)
    this.name = 'PortalFetchError'
    this.skippable = skippable
  }
}

export type PortalApiKeys = {
  compass?: string
  zillow?: string
  redfin?: string
}

const STORAGE_KEYS = {
  compass: 'rapidapi_key_compass',
  zillow: 'rapidapi_key_zillow',
  redfin: 'rapidapi_key_redfin',
  legacy: 'rapidapi_key',
} as const

export function loadPortalApiKeys(): PortalApiKeys {
  if (typeof sessionStorage === 'undefined') return {}
  return {
    compass: sessionStorage.getItem(STORAGE_KEYS.compass) || sessionStorage.getItem(STORAGE_KEYS.legacy) || '',
    zillow: sessionStorage.getItem(STORAGE_KEYS.zillow) || '',
    redfin: sessionStorage.getItem(STORAGE_KEYS.redfin) || '',
  }
}

export function savePortalApiKeys(keys: PortalApiKeys) {
  if (typeof sessionStorage === 'undefined') return
  if (keys.compass?.trim()) sessionStorage.setItem(STORAGE_KEYS.compass, keys.compass.trim())
  if (keys.zillow?.trim()) sessionStorage.setItem(STORAGE_KEYS.zillow, keys.zillow.trim())
  if (keys.redfin?.trim()) sessionStorage.setItem(STORAGE_KEYS.redfin, keys.redfin.trim())
}

const IMAGE_URL_RE = /^https?:\/\/.+\.(jpe?g|png|webp|gif)(\?|$)/i
const CDN_HINT_RE =
  /(photos\.compass\.com|photos\.zillowstatic\.com|ssl\.cdn-redfin\.com|redfin\.com\/.*photo)/i

/** Stand-in gallery when a portal API returns no photo URLs — replace in Edit brochure. */
export const EXAMPLE_LISTING_PHOTOS: ListingImage[] = demoListing.images.map((img, i) => ({
  ...img,
  alt: `Example listing photo ${i + 1} — replace with scraped photos in Edit brochure`,
}))

export function detectSource(url: string): ListingSource {
  const u = url.toLowerCase()
  if (u.includes('compass.com')) return 'compass'
  if (u.includes('zillow.com')) return 'zillow'
  if (u.includes('redfin.com') || u.includes('redfin.ca')) return 'redfin'
  if (u.includes('realtor.com')) return 'realtor'
  if (u.includes('mls') || u.includes('idx') || u.includes('listingbook') || u.includes('brightmls')) return 'mls'
  return 'unknown'
}

export function sourceLabel(source: ListingSource): string {
  switch (source) {
    case 'compass':
      return 'Compass'
    case 'zillow':
      return 'Zillow'
    case 'redfin':
      return 'Redfin'
    case 'realtor':
      return 'Realtor.com'
    case 'mls':
      return 'MLS / IDX'
    default:
      return 'Listing link'
  }
}

function money(value: unknown): string {
  if (value == null || value === '') return ''
  if (typeof value === 'string' && value.trim().startsWith('$')) return value.trim()
  const n = Number(String(value).replace(/[^\d.]/g, ''))
  if (!Number.isFinite(n) || n <= 0) return String(value)
  return `$${Math.round(n).toLocaleString()}`
}

function asString(value: unknown, fallback = ''): string {
  if (value == null) return fallback
  return String(value)
}

function asList(value: unknown): string[] {
  if (!value) return []
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return item
        if (item && typeof item === 'object') {
          const obj = item as Record<string, unknown>
          return asString(
            obj.url ||
              obj.href ||
              obj.src ||
              obj.originalUrl ||
              obj.original ||
              obj.highResUrl ||
              obj.highRes ||
              obj.mixedSources ||
              obj.name ||
              obj.title ||
              obj.text ||
              obj.value ||
              obj.label,
          )
        }
        return ''
      })
      .filter(Boolean)
  }
  if (typeof value === 'string') return value.split(/[\n|;]/).map((s) => s.trim()).filter(Boolean)
  return [String(value)]
}

function dig(data: Record<string, unknown>, paths: string[]): unknown {
  for (const path of paths) {
    let cur: unknown = data
    let ok = true
    for (const part of path.split('.')) {
      if (cur && typeof cur === 'object' && part in (cur as Record<string, unknown>)) {
        cur = (cur as Record<string, unknown>)[part]
      } else {
        ok = false
        break
      }
    }
    if (ok && cur != null && cur !== '') return cur
  }
  return null
}

function toNumber(value: unknown): number | null {
  if (value == null || value === '') return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const cleaned = String(value).replace(/,/g, '').match(/(\d+(\.\d+)?)/)
  if (!cleaned) return null
  const n = Number(cleaned[1])
  return Number.isFinite(n) ? n : null
}

function pickNumber(data: Record<string, unknown>, paths: string[]): number | null {
  for (const path of paths) {
    const n = toNumber(dig(data, [path]))
    if (n != null && n > 0) return n
  }
  return null
}

/** Merge nested Compass payload shapes into one lookup object (PullAPI + alternate scrapers). */
function unwrapCompassPayload(payload: Record<string, unknown>): Record<string, unknown> {
  let data: Record<string, unknown> = payload
  if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
    data = data.data as Record<string, unknown>
  }
  if (data.property && typeof data.property === 'object' && !Array.isArray(data.property)) {
    const nested = data.property as Record<string, unknown>
    data = { ...data, ...nested }
  }
  if (data.listing && typeof data.listing === 'object' && !Array.isArray(data.listing)) {
    const nested = data.listing as Record<string, unknown>
    data = { ...data, ...nested }
  }
  if (data.details && typeof data.details === 'object' && !Array.isArray(data.details)) {
    const nested = data.details as Record<string, unknown>
    data = { ...data, ...nested }
  }
  if (data.building && typeof data.building === 'object' && !Array.isArray(data.building)) {
    const building = data.building as Record<string, unknown>
    data = { ...data, ...building, building }
  }
  if (data.size && typeof data.size === 'object' && !Array.isArray(data.size)) {
    const size = data.size as Record<string, unknown>
    data = { ...data, ...size, size }
  }
  return data
}

const BED_KEYS = new Set(['beds', 'bedrooms', 'beds_total', 'numbedrooms', 'bedroomstotal', 'bedroomcount'])
const BATH_KEYS = new Set(['baths', 'bathrooms', 'baths_total', 'numbathrooms', 'bathroomstotal', 'bathroomcount'])
const SQFT_KEYS = new Set([
  'sqft',
  'living_area_sqft',
  'living_area',
  'square_feet',
  'livingarea',
  'building_size',
  'squarefootage',
  'interior_sqft',
])
const LOT_KEYS = new Set([
  'lot_size_sqft',
  'lot_size',
  'lotsqft',
  'lotsize',
  'lot_sqft',
  'lotsquarefeet',
  'land_area',
  'land_area_sqft',
  'parcel_size',
])
const LOT_ACRE_KEYS = new Set(['lot_acres', 'lotacres', 'acres', 'lotsizeacres', 'land_area_acres'])
const GARAGE_KEYS = new Set([
  'garage',
  'garagespaces',
  'garage_spaces',
  'numgaragespaces',
  'garagespace',
  'parking_spaces',
  'parkingspaces',
  'car_spaces',
  'covered_parking',
  'attached_garage',
])
const WALK_KEYS = new Set(['walk_score', 'walkscore'])
const YEAR_KEYS = new Set(['year_built', 'yearbuilt', 'built_year', 'construction_year'])

function isPlausibleYear(n: number): boolean {
  return n >= 1800 && n <= 2035
}

function pickYear(data: Record<string, unknown>, paths: string[]): number | null {
  for (const path of paths) {
    const n = toNumber(dig(data, [path]))
    if (n != null && isPlausibleYear(Math.round(n))) return Math.round(n)
  }
  return null
}

function findYearByKeys(obj: unknown, depth = 0): number | null {
  if (depth > 8 || obj == null) return null
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findYearByKeys(item, depth + 1)
      if (found != null) return found
    }
    return null
  }
  if (typeof obj !== 'object') return null

  const record = obj as Record<string, unknown>
  for (const [key, value] of Object.entries(record)) {
    if (YEAR_KEYS.has(key.toLowerCase())) {
      const n = toNumber(value)
      if (n != null && isPlausibleYear(Math.round(n))) return Math.round(n)
    }
  }
  for (const value of Object.values(record)) {
    if (value && typeof value === 'object') {
      const found = findYearByKeys(value, depth + 1)
      if (found != null) return found
    }
  }
  return null
}

function pickWalkScore(data: Record<string, unknown>, paths: string[]): number | null {
  for (const path of paths) {
    const n = toNumber(dig(data, [path]))
    if (n != null && n >= 0 && n <= 100) return Math.round(n)
  }
  return null
}

function findWalkScoreByKeys(obj: unknown, depth = 0): number | null {
  if (depth > 8 || obj == null) return null
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findWalkScoreByKeys(item, depth + 1)
      if (found != null) return found
    }
    return null
  }
  if (typeof obj !== 'object') return null

  const record = obj as Record<string, unknown>
  for (const [key, value] of Object.entries(record)) {
    const lower = key.toLowerCase()
    if (WALK_KEYS.has(lower) || lower === 'walkscore') {
      const n = toNumber(value)
      if (n != null && n >= 0 && n <= 100) return Math.round(n)
    }
  }
  for (const value of Object.values(record)) {
    if (value && typeof value === 'object') {
      const found = findWalkScoreByKeys(value, depth + 1)
      if (found != null) return found
    }
  }
  return null
}

/** Walk nested JSON for the first positive numeric value on known field names. */
function findNumberByKeys(obj: unknown, keys: Set<string>, depth = 0): number | null {
  if (depth > 8 || obj == null) return null
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findNumberByKeys(item, keys, depth + 1)
      if (found != null) return found
    }
    return null
  }
  if (typeof obj !== 'object') return null

  const record = obj as Record<string, unknown>
  for (const [key, value] of Object.entries(record)) {
    if (keys.has(key.toLowerCase())) {
      const n = toNumber(value)
      if (n != null && n > 0) return n
    }
  }
  for (const value of Object.values(record)) {
    if (value && typeof value === 'object') {
      const found = findNumberByKeys(value, keys, depth + 1)
      if (found != null) return found
    }
  }
  return null
}

/** Collect human-readable fact strings from amenities, key_facts objects, and description. */
function collectTextBlobs(data: Record<string, unknown>): string[] {
  const blobs: string[] = []

  const pushFacts = (value: unknown) => {
    if (!value) return
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string') {
          blobs.push(item)
        } else if (item && typeof item === 'object') {
          const obj = item as Record<string, unknown>
          const label = asString(obj.label || obj.name || obj.title || obj.key)
          const val = asString(obj.value || obj.text || obj.content || obj.amount)
          if (label && val) blobs.push(`${label}: ${val}`)
          else blobs.push(...asList(item))
        }
      }
      return
    }
    blobs.push(...asList(value))
  }

  pushFacts(data.amenities || data.features || data.highlights || data.key_features)
  pushFacts(data.keyFacts || data.key_facts || data.facts || data.propertyFacts || data.listing_facts)
  pushFacts(data.summary || data.size)

  const description = asString(dig(data, ['description', 'remarks', 'public_remarks', 'overview']))
  if (description) blobs.push(description)

  return blobs.filter(Boolean)
}

type PropertyStats = {
  beds: number | null
  baths: number | null
  sqft: number | null
  lot: number | null
  built: number | null
  garage: string
  walkScore: number
}

/** Extract listing stats from documented + nested Compass API fields. */
export function extractPropertyStats(data: Record<string, unknown>): PropertyStats {
  const textBlobs = collectTextBlobs(data)

  const beds =
    pickNumber(data, ['beds', 'bedrooms', 'beds_total', 'numBedrooms', 'bedroomsTotal', 'property.beds']) ??
    findNumberByKeys(data, BED_KEYS) ??
    matchFromText(textBlobs, [
      /(\d+(?:\.\d+)?)\s*(?:bed(?:room)?s?|br|bd)\b/i,
      /bedrooms?\s*[:#]?\s*(\d+(?:\.\d+)?)/i,
    ])

  const bathsDirect =
    pickNumber(data, ['baths', 'bathrooms', 'baths_total', 'numBathrooms', 'bathroomsTotal', 'property.baths']) ??
    findNumberByKeys(data, BATH_KEYS)

  const bathsFull = pickNumber(data, ['bathsFull', 'full_baths', 'bathroomsFull', 'fullBaths'])
  const bathsHalf = pickNumber(data, ['bathsHalf', 'half_baths', 'bathroomsHalf', 'partialBaths', 'halfBaths'])

  let baths = bathsDirect
  if (baths == null && bathsFull != null) {
    baths = bathsHalf != null ? bathsFull + bathsHalf * 0.5 : bathsFull
  }
  if (baths == null) {
    baths = matchFromText(textBlobs, [
      /(\d+(?:\.\d+)?)\s*(?:bath(?:room)?s?|ba)\b/i,
      /bathrooms?\s*[:#]?\s*(\d+(?:\.\d+)?)/i,
    ])
  }

  let sqft =
    pickNumber(data, [
      'sqft',
      'living_area_sqft',
      'living_area',
      'square_feet',
      'livingArea',
      'livingAreaSqFt',
      'living_sqft',
      'finished_sqft',
      'building_size',
      'squareFootage',
      'interior_sqft',
      'size.squareFeet',
      'size.livingArea',
      'property.livingArea',
      'building.sqft',
      'building.living_area',
      'building.livingArea',
    ]) ??
    findNumberByKeys(data, SQFT_KEYS) ??
    matchFromText(textBlobs, [
      /([\d,]+)\s*(?:sq\.?\s*ft\.?|sqft|sf\b|square feet)/i,
      /living area\s*[:#]?\s*([\d,]+)/i,
      /interior\s*[:#]?\s*([\d,]+)\s*(?:sq|sf)/i,
      /(?:finished|heated)\s*(?:sq\.?\s*ft\.?|area)\s*[:#]?\s*([\d,]+)/i,
    ])

  let lot =
    pickNumber(data, [
      'lot_size_sqft',
      'lot_size',
      'lotSqFt',
      'lotSize',
      'lot_sqft',
      'lotSquareFeet',
      'land_area_sqft',
      'land_area',
      'parcel_size',
      'size.lotSize',
      'property.lotSize',
      'building.lot_size',
      'building.lotSize',
    ]) ??
    findNumberByKeys(data, LOT_KEYS) ??
    matchFromText(textBlobs, [
      /lot(?:\s*size)?\s*[:#]?\s*([\d,]+)\s*(?:sq\.?\s*ft\.?|sqft|sf\b)/i,
      /([\d,]+)\s*(?:sq\.?\s*ft\.?|sf\b)\s*lot/i,
      /([\d,]+)\s*(?:lot|lot size)/i,
    ])

  const lotAcres =
    pickNumber(data, ['lot_acres', 'lotAcres', 'acres', 'lotSizeAcres', 'land_area_acres']) ??
    findNumberByKeys(data, LOT_ACRE_KEYS) ??
    matchFromText(textBlobs, [/([\d.]+)\s*acres?\b/i, /lot\s*[:#]?\s*([\d.]+)\s*acres?/i])

  if ((lot == null || lot < 100) && lotAcres != null) {
    lot = Math.round(lotAcres * 43560)
  }

  const built =
    pickYear(data, [
      'year_built',
      'yearBuilt',
      'building.year_built',
      'building.yearBuilt',
      'built_year',
      'construction_year',
    ]) ??
    findYearByKeys(data) ??
    matchFromText(textBlobs, [
      /built\s*(?:in)?\s*[:#]?\s*(19\d{2}|20\d{2})/i,
      /(19\d{2}|20\d{2})\s*built/i,
      /year built\s*[:#]?\s*(19\d{2}|20\d{2})/i,
      /(?:built|constructed)\s*[:#]?\s*(19\d{2}|20\d{2})/i,
    ])

  const garageRaw = dig(data, [
    'garageSpaces',
    'garage_spaces',
    'numGarageSpaces',
    'garage',
    'parking.garageSpaces',
    'parking.garage',
    'parkingSpaces',
    'building.garage_spaces',
    'building.parking',
    'parking.spaces',
  ])
  const parkingLines = [
    ...asList(data.parking),
    ...asList(data.parkingFeatures),
    ...asList(dig(data, ['resoFacts.parkingFeatures', 'facts.parking'])),
  ]
  const garageCount =
    pickNumber(data, [
      'garageSpaces',
      'garage_spaces',
      'numGarageSpaces',
      'parkingSpaces',
      'parking.garageSpaces',
      'building.garage_spaces',
    ]) ??
    findNumberByKeys(data, GARAGE_KEYS) ??
    toNumber(garageRaw) ??
    matchFromText([...asList(garageRaw), ...parkingLines, ...textBlobs], [
      /(\d+)\s*[- ]?car(?:\s*garage)?/i,
      /(\d+)\s*(?:car\s*)?garage/i,
      /garage\s*[:#]?\s*(\d+)/i,
      /parking\s*[:#]?\s*(\d+)/i,
      /(\d+)\s*garage spaces?/i,
    ])

  let garage = '—'
  if (garageCount != null && garageCount > 0) {
    garage = `${Math.round(garageCount)} Car`
  } else if (garageRaw != null) {
    const garageText = asList(garageRaw)[0] || asString(garageRaw)
    if (garageText && !/^[\d.]+$/.test(garageText.trim())) garage = garageText
  }

  const walkObj = dig(data, ['walkScore', 'walk_score'])
  let walkFromObj: number | null = null
  if (walkObj && typeof walkObj === 'object' && !Array.isArray(walkObj)) {
    walkFromObj = pickWalkScore(walkObj as Record<string, unknown>, ['walkscore', 'score', 'value', 'walk_score'])
  }

  const walkScore =
    pickWalkScore(data, [
      'walk_score',
      'walkScore',
      'walkscore',
      'walkScore.walkscore',
      'walk_score.score',
      'walkScore.score',
      'location.walkScore',
      'location.walk_score',
      'resoFacts.walkScore',
      'walkAndTransitScore.walkscore',
      'walkAndTransitScore.walkScore',
    ]) ??
    walkFromObj ??
    findWalkScoreByKeys(data) ??
    matchFromText(textBlobs, [/walk\s*score\s*[:#]?\s*(\d{1,3})/i]) ??
    0

  return {
    beds,
    baths: baths != null ? Math.round(baths * 10) / 10 : null,
    sqft,
    lot,
    built,
    garage,
    walkScore: Math.min(100, Math.max(0, Math.round(walkScore))),
  }
}

function matchFromText(blobs: string[], patterns: RegExp[]): number | null {
  for (const blob of blobs) {
    for (const pattern of patterns) {
      const m = blob.match(pattern)
      if (m?.[1]) {
        const n = toNumber(m[1])
        if (n != null && n > 0) return n
      }
    }
  }
  return null
}

function prettyHomeType(raw: string): string {
  const t = raw.replace(/_/g, ' ').trim()
  if (!t) return 'home'
  const lower = t.toLowerCase()
  if (lower.includes('single') || lower.includes('house') || lower.includes('residence')) return 'home'
  if (lower.includes('town')) return 'townhome'
  if (lower.includes('condo')) return 'condo'
  if (lower.includes('co-op') || lower.includes('coop')) return 'co-op'
  return lower
}

function looksLikeImageUrl(value: string): boolean {
  const v = value.trim()
  if (!/^https?:\/\//i.test(v)) return false
  if (/photos\.compass\.com/i.test(v)) return true
  if (/photos\.zillowstatic\.com/i.test(v)) return true
  if (/cdn-redfin\.com/i.test(v)) return true
  if (IMAGE_URL_RE.test(v)) return true
  if (CDN_HINT_RE.test(v)) return true
  if (/[?&](w|width|h|height|size|fit)=/i.test(v) && /\/(photo|image|img|media|pictures?)\//i.test(v)) return true
  return false
}

/** PullAPI + Zillow/Redfin photo fields on portal payloads. */
function extractListingPhotos(data: Record<string, unknown>): string[] {
  const photoObjects = data.photos
  const fromPhotoObjects: string[] = []
  if (Array.isArray(photoObjects)) {
    for (const item of photoObjects) {
      if (item && typeof item === 'object') {
        const obj = item as Record<string, unknown>
        if (typeof obj.url === 'string') fromPhotoObjects.push(obj.url)
        if (typeof obj.href === 'string') fromPhotoObjects.push(obj.href)
      }
    }
  }

  const primary = [
    ...fromPhotoObjects,
    ...asList(data.photos),
    ...asList(data.image_url),
    ...asList(data.image_urls),
    ...asList(data.images),
    ...asList(dig(data, ['media.photos', 'gallery', 'photoUrls', 'building.photos', 'listingPhotos', 'propertyPhotos'])),
  ].filter((u) => looksLikeImageUrl(u))

  if (primary.length >= 2) return [...new Set(primary)]
  return [...new Set([...primary, ...extractPhotoUrls(data)])]
}
/** Deep-collect listing photo URLs from nested portal payloads. */
export function extractPhotoUrls(data: unknown, limit = 24): string[] {
  const found: string[] = []
  const seen = new Set<string>()

  const push = (raw: string) => {
    let url = raw.trim().replace(/^\/\//, 'https://')
    if (!looksLikeImageUrl(url)) return
    // Prefer full-size when scrapers append tiny thumbs
    url = url.replace(/[?&](w|width)=\d+/gi, '').replace(/\?$/, '')
    if (seen.has(url)) return
    seen.add(url)
    found.push(url)
  }

  const walk = (node: unknown, depth: number) => {
    if (found.length >= limit || depth > 8 || node == null) return
    if (typeof node === 'string') {
      push(node)
      return
    }
    if (Array.isArray(node)) {
      for (const item of node) walk(item, depth + 1)
      return
    }
    if (typeof node !== 'object') return

    const obj = node as Record<string, unknown>
    const preferredKeys = [
      'url',
      'href',
      'src',
      'originalUrl',
      'original',
      'highResUrl',
      'highRes',
      'fullUrl',
      'large',
      'xl',
      'photoUrl',
      'imageUrl',
      'image_url',
    ]
    for (const key of preferredKeys) {
      const val = obj[key]
      if (typeof val === 'string') push(val)
    }

    // Zillow mixedSources: { jpeg: [{ url, width }, ...] }
    if (obj.mixedSources && typeof obj.mixedSources === 'object') {
      const mixed = obj.mixedSources as Record<string, unknown>
      for (const format of Object.values(mixed)) {
        if (Array.isArray(format) && format.length) {
          const largest = [...format].sort((a, b) => {
            const wa = toNumber((a as Record<string, unknown>).width) || 0
            const wb = toNumber((b as Record<string, unknown>).width) || 0
            return wb - wa
          })[0] as Record<string, unknown>
          if (typeof largest?.url === 'string') push(largest.url)
        }
      }
    }

    const nestKeys = [
      'photos',
      'photo',
      'images',
      'image',
      'image_urls',
      'imageUrls',
      'photoUrls',
      'gallery',
      'media',
      'responsivePhotos',
      'hugePhotos',
      'originalPhotos',
      'listingPhotos',
      'propertyPhotos',
      'pictures',
      'thumbnails',
      'data',
      'property',
      'resoFacts',
    ]
    for (const key of nestKeys) {
      if (key in obj) walk(obj[key], depth + 1)
    }
  }

  walk(data, 0)
  return found.slice(0, limit)
}

function buildImages(urls: string[]): ListingImage[] {
  const spans: ListingImage['span'][] = ['hero', 'wide', 'tall', 'square', 'wide', 'square', 'tall', 'square']
  return urls.slice(0, 12).map((src, i) => ({
    src,
    alt: `Listing photo ${i + 1}`,
    span: spans[i] || 'square',
  }))
}

function featuresFromAmenities(amenities: string[], description: string): FeatureCard[] {
  if (!amenities.length) {
    if (!description) {
      return [
        { title: 'Residence', body: 'Edit brochure to add standout features from the listing.' },
        { title: 'Kitchen', body: 'Add kitchen highlights from the MLS or portal remarks.' },
        { title: 'Outdoor', body: 'Note patio, yard, or view details buyers should know.' },
        { title: 'Systems', body: 'HVAC, roof, and updates — fill in from your notes.' },
        { title: 'Location', body: 'Neighborhood access and daily conveniences.' },
        { title: 'Presentation', body: 'Staging and photography ready for private showings.' },
      ]
    }
    const sentences = description
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 40)
      .slice(0, 6)
    if (sentences.length) {
      return sentences.map((body, i) => ({
        title: ['Highlights', 'Spaces', 'Details', 'Living', 'Setting', 'Notes'][i] || 'Detail',
        body,
      }))
    }
  }
  return amenities.slice(0, 9).map((item) => {
    const [title, ...rest] = item.split(':')
    return {
      title: (title || 'Feature').trim().slice(0, 40),
      body: rest.join(':').trim() || item,
    }
  })
}

function placesForLocation(neighborhood: string, city: string, schools: unknown): NeighborhoodPlace[] {
  const list = Array.isArray(schools) ? schools : []
  const schoolPlaces: NeighborhoodPlace[] = list.slice(0, 3).map((s) => {
    const obj = (s || {}) as Record<string, unknown>
    return {
      category: 'Schools',
      name: asString(obj.name, 'Local school'),
      detail: [obj.rating != null ? `Rating ${obj.rating}` : '', asString(obj.type), obj.distance != null ? `${obj.distance} mi` : '']
        .filter(Boolean)
        .join(' · '),
      icon: 'school' as const,
    }
  })
  const place = neighborhood || city || 'the area'
  const local: NeighborhoodPlace[] = [
    { category: 'Dining', name: `${place} dining`, detail: 'Cafés and restaurants nearby', icon: 'dining' },
    { category: 'Parks', name: `${place} parks`, detail: 'Green space for daily loops', icon: 'park' },
    { category: 'Shopping', name: `${place} shopping`, detail: 'Boutiques and everyday essentials', icon: 'shop' },
    {
      category: 'Transit',
      name: 'Transit & corridors',
      detail: `Access serving ${city || place}`,
      icon: 'transit',
    },
    {
      category: 'Employment',
      name: 'Job centers',
      detail: `Commute options from ${city || place}`,
      icon: 'tech',
    },
  ]
  return [...schoolPlaces, ...local].slice(0, 6)
}

function lifestyleFromImages(images: ListingImage[], neighborhood: string, city: string): Listing['lifestyle'] {
  const place = neighborhood || city || 'the neighborhood'
  const quotes = [
    `Morning light settles across the rooms in ${place}.`,
    `Evenings that begin steps from the best of ${place}.`,
    `A home composed for how life actually feels in ${place}.`,
  ]
  const fallback = images[0]?.src || ''
  return [0, 1, 2].map((i) => ({
    quote: quotes[i],
    image: images[i + 1]?.src || fallback,
    caption: images[i + 1]?.alt || 'Residence moment',
  }))
}

/** Keep lifestyle moments aligned with current listing photos after edits. */
export function syncLifestyleFromImages(listing: Listing): Listing {
  const images = listing.images
  if (!images.length) return listing
  return {
    ...listing,
    lifestyle: listing.lifestyle.map((m, i) => ({
      ...m,
      image: images[i + 1]?.src || images[0]?.src || m.image,
    })),
  }
}

export function fullAddress(listing: Pick<Listing, 'address' | 'city' | 'state' | 'zip'>): string {
  return [listing.address, listing.city, listing.state, listing.zip].filter(Boolean).join(', ')
}

/** Google Maps embed URL — optional Embed API key in sessionStorage (`google_maps_embed_key`). */
export function googleMapsEmbedUrl(address: string): string {
  const q = address.trim() || 'United States'
  const key = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('google_maps_embed_key') || '' : ''
  if (key.trim()) {
    return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key.trim())}&q=${encodeURIComponent(q)}&zoom=15`
  }
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`
}

function withJasonBrand(listing: Listing, sourceUrl: string): Listing {
  return {
    ...listing,
    listingUrl: sourceUrl || listing.listingUrl,
    website: 'https://www.jasonlimrealty.com',
    agent: { ...BRAND_AGENT },
  }
}

function normalizeGeneric(data: Record<string, unknown>, sourceUrl: string): Listing {
  const photos = extractListingPhotos(data)
  const amenities = asList(
    data.amenities || data.features || data.highlights || data.key_features || dig(data, ['resoFacts.highlights']),
  )
  const address = asString(
    dig(data, ['street_address', 'address', 'name', 'location.streetAddress', 'address.streetAddress']),
  )
  const city = asString(dig(data, ['city', 'address.city', 'location.city']))
  const state = asString(dig(data, ['state', 'address.state', 'location.state']))
  const zip = asString(dig(data, ['zip_code', 'zipcode', 'zip', 'address.zipcode', 'address.zip']))
  const neighborhood = asString(dig(data, ['neighborhood', 'area', 'subdivision', 'region', 'location']))
  const description = asString(dig(data, ['description', 'remarks', 'public_remarks', 'overview']))
  const price = money(dig(data, ['price', 'list_price', 'listPrice', 'priceInfo.price']))

  const { beds, baths, sqft, lot, built, garage, walkScore } = extractPropertyStats(data)

  // Photos may be empty here — importListingFromUrl applies example fallback with a notice.
  const images = buildImages(photos)
  const place = neighborhood || city || 'this neighborhood'
  const homeType = prettyHomeType(asString(dig(data, ['property_type', 'home_type', 'type', 'propertyType'])))
  const regionHint = state && ['CA', 'California'].includes(state) ? 'Bay Area' : city || place

  const fmtSqft = (n: number | null) => (n == null ? '—' : `${Math.round(n).toLocaleString()} SF`)

  return withJasonBrand(
    {
      address: address || 'Address on request',
      city,
      state,
      zip,
      neighborhood: place,
      price: price || 'Price on request',
      status: asString(
        data.status || data.listing_status || data.mls_status || data.listingStatus,
        'Offered exclusively',
      ).replace(/_/g, ' '),
      headline: `Modern living in ${place}`,
      subhead: `A refined ${homeType} presentation for ${regionHint} sellers and buyers.`,
      about:
        description ||
        `Discover this residence in ${place}. Thoughtful spaces, standout presentation, and a setting that makes everyday life feel considered — prepared as a private listing brochure by Jason Lim, Compass.`,
      listingUrl: sourceUrl,
      website: 'https://www.jasonlimrealty.com',
      stats: [
        { label: 'Bedrooms', value: beds != null ? String(beds) : '—', icon: 'bed' },
        { label: 'Bathrooms', value: baths != null ? String(baths) : '—', icon: 'bath' },
        { label: 'Living Area', value: fmtSqft(sqft), icon: 'area' },
        { label: 'Lot Size', value: fmtSqft(lot), icon: 'lot' },
        { label: 'Garage', value: garage, icon: 'garage' },
        { label: 'Year Built', value: built != null ? String(built) : '—', icon: 'built' },
      ],
      images,
      features: featuresFromAmenities(amenities, description),
      neighborhoodIntro: `Exploring ${place}${city ? ` in ${city}` : ''} — schools, daily conveniences, and the corridors that connect everyday life.`,
      places: placesForLocation(neighborhood, city, data.schools),
      walkScore,
      lifestyle: lifestyleFromImages(images, neighborhood, city),
      agent: BRAND_AGENT,
    },
    sourceUrl,
  )
}

async function rapidGet(host: string, path: string, apiKey: string): Promise<Record<string, unknown>> {
  const res = await fetch(`https://${host}${path}`, {
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': host,
    },
  })
  const text = await res.text()
  let json: Record<string, unknown> = {}
  try {
    json = JSON.parse(text) as Record<string, unknown>
  } catch {
    throw new Error(`API returned non-JSON (${res.status}).`)
  }
  const apiMessage = asString(json.message || json.error)
  if (/quota|exceeded|upgrade your plan/i.test(apiMessage)) {
    throw new Error(
      'RapidAPI monthly quota exceeded for this listing API. Upgrade the plan on RapidAPI, or wait until quota resets, then re-import.',
    )
  }
  if (res.status === 401 || res.status === 403) {
    throw new PortalFetchError(
      `Not subscribed to ${RAPIDAPI_PRODUCT[host] || host} on RapidAPI.`,
      true,
    )
  }
  if (res.status === 429) throw new Error('Rate limit hit. Wait a moment and retry.')
  if (res.status === 404 || /endpoint.*does not exist|not found/i.test(apiMessage)) {
    throw new PortalFetchError(apiMessage || `Endpoint not found on ${host}`, true)
  }
  if (res.status >= 400) {
    throw new PortalFetchError(apiMessage || `API error ${res.status}`, res.status >= 500)
  }
  if (json.success === false) {
    const msg = asString(json.error || json.message, 'Listing fetch failed')
    throw new PortalFetchError(msg, /not found|invalid url|no data/i.test(msg))
  }
  return json
}

async function fetchPortalRaw(
  attempts: Array<{ host: string; path: string }>,
  apiKey: string,
  portalLabel: string,
): Promise<Record<string, unknown>> {
  const failures: string[] = []
  let lastFatal: Error | null = null

  for (const { host, path } of attempts) {
    try {
      const json = await rapidGet(host, path, apiKey)
      return unwrapCompassPayload(json)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      const product = RAPIDAPI_PRODUCT[host] || host
      failures.push(`${product}: ${error.message}`)

      if (/quota|exceeded|rate limit/i.test(error.message)) throw error
      if (err instanceof PortalFetchError && err.skippable) continue
      lastFatal = error
    }
  }

  if (lastFatal && failures.length <= 1) throw lastFatal

  const tried = attempts.map((a) => RAPIDAPI_PRODUCT[a.host] || a.host).join(' · ')
  throw new Error(
    `${portalLabel} import failed after trying: ${tried}. ` +
      (failures.length
        ? `Details: ${failures.join(' | ')}. `
        : '') +
      `Subscribe to one of those products on RapidAPI (same account key works once subscribed), then retry.`,
  )
}

function extractZpid(url: string): string | null {
  const zpidMatch = url.match(/(\d+)_zpid/i)
  if (zpidMatch?.[1]) return zpidMatch[1]
  const pathMatch = url.match(/homedetails\/[^/]+\/(\d+)/i)
  return pathMatch?.[1] || null
}

function extractRedfinPropertyId(url: string): string | null {
  const m = url.match(/\/home\/(\d+)/i)
  return m?.[1] || null
}

async function fetchCompassRaw(url: string, apiKey: string): Promise<Record<string, unknown>> {
  return fetchPortalRaw(
    [{ host: HOSTS.compass, path: `/compass/property?url=${encodeURIComponent(url)}` }],
    apiKey,
    'Compass',
  )
}

async function fetchZillowRaw(url: string, apiKey: string): Promise<Record<string, unknown>> {
  const zpid = extractZpid(url)
  const attempts: Array<{ host: string; path: string }> = []

  if (zpid) {
    attempts.push({ host: HOSTS.zillow, path: `/zillow/property/${zpid}` })
    attempts.push({ host: HOSTS.zillow56, path: `/property?zpid=${zpid}` })
  }
  // Unified real-estate API last — often a separate subscription from Zillow Scraper
  attempts.push({ host: HOSTS.zillowAlt, path: `/property-details?url=${encodeURIComponent(url)}` })

  let data = await fetchPortalRaw(attempts, apiKey, 'Zillow')

  if (zpid) {
    try {
      const photosJson = await rapidGet(HOSTS.zillow, `/zillow/photos/${zpid}`, apiKey)
      const photoPayload = unwrapCompassPayload(photosJson)
      const extra = extractListingPhotos(photoPayload)
      if (extra.length) {
        const merged = [...extractListingPhotos(data), ...extra]
        data = { ...data, photos: [...new Set(merged)], image_urls: [...new Set(merged)] }
      }
    } catch {
      // Optional photo enrichment
    }
  }

  return data
}

async function fetchRedfinRaw(url: string, apiKey: string): Promise<Record<string, unknown>> {
  const encoded = encodeURIComponent(url)
  const propertyId = extractRedfinPropertyId(url)
  const attempts: Array<{ host: string; path: string }> = [
    { host: HOSTS.redfin, path: `/details?url=${encoded}` },
    { host: HOSTS.redfinAlt, path: `/property-details?url=${encoded}` },
  ]
  if (propertyId) {
    attempts.push({
      host: HOSTS.redfinAlt,
      path: `/property-details?property_id=${propertyId}`,
    })
  }
  return fetchPortalRaw(attempts, apiKey, 'Redfin')
}

async function fetchListing(url: string, source: ListingSource, apiKey: string): Promise<Listing> {
  let data: Record<string, unknown>
  switch (source) {
    case 'compass':
      data = await fetchCompassRaw(url, apiKey)
      break
    case 'zillow':
      data = await fetchZillowRaw(url, apiKey)
      break
    case 'redfin':
      data = await fetchRedfinRaw(url, apiKey)
      break
    default:
      throw new Error(`Unsupported listing source: ${source}`)
  }
  return normalizeGeneric(data, url)
}

function portalKeyForSource(source: ListingSource, keys: PortalApiKeys): string {
  switch (source) {
    case 'compass':
      return keys.compass?.trim() || ''
    case 'zillow':
      return keys.zillow?.trim() || ''
    case 'redfin':
      return keys.redfin?.trim() || ''
    default:
      return ''
  }
}

function buildImportNotice(listing: Listing, source: ListingSource, photoCount: number): string {
  const statBits = listing.stats.filter((s) => s.value && s.value !== '—').map((s) => s.label.toLowerCase())
  const statsSummary =
    statBits.length > 0 ? ` · ${statBits.slice(0, 5).join(', ')} scraped` : ' · review stats in Edit brochure if any show —'
  let notice = `Loaded from ${sourceLabel(source)} via RapidAPI · ${photoCount} photo${photoCount === 1 ? '' : 's'}${statsSummary}.`
  if (listing.walkScore > 0) notice += ` Walk Score ${listing.walkScore}.`
  return notice
}

export type ImportResult = {
  listing: Listing
  source: ListingSource
  /** True when Compass API returned no photos and example stand-ins were applied. */
  usedExamplePhotos: boolean
  notice: string
}

export async function importListingFromUrl(url: string, keys: PortalApiKeys | string): Promise<ImportResult> {
  const trimmed = url.trim()
  if (!trimmed) throw new Error('Paste a Compass, Zillow, or Redfin listing URL first.')

  const portalKeys: PortalApiKeys =
    typeof keys === 'string' ? { compass: keys, zillow: keys, redfin: keys } : keys

  const source = detectSource(trimmed)
  if (source !== 'compass' && source !== 'zillow' && source !== 'redfin') {
    throw new Error(
      'Paste a supported listing URL: compass.com/homedetails/…, zillow.com/homedetails/…, or redfin.com/…/home/…. Then add the matching RapidAPI key below.',
    )
  }

  const apiKey = portalKeyForSource(source, portalKeys)
  if (!apiKey) {
    const products =
      source === 'compass'
        ? 'Compass.com Real Estate Data API'
        : source === 'zillow'
          ? 'Zillow Scraper API (recommended) or Zillow56'
          : 'Redfin.com Data API (recommended) or Real-Time Redfin Data'
    throw new Error(`Add your RapidAPI key for ${sourceLabel(source)}. Subscribe to ${products} on RapidAPI.`)
  }

  let listing = await fetchListing(trimmed, source, apiKey)
  let usedExamplePhotos = false
  let notice = buildImportNotice(listing, source, listing.images.length)

  if (!listing.images.length) {
    usedExamplePhotos = true
    listing = syncLifestyleFromImages({
      ...listing,
      images: EXAMPLE_LISTING_PHOTOS.map((img) => ({ ...img })),
    })
    notice = `${sourceLabel(source)} facts loaded, but RapidAPI returned no photo URLs. Example photos were added — replace them in Edit brochure.`
  }

  return { listing, source, usedExamplePhotos, notice }
}
