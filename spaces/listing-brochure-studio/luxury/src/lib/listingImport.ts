import { demoListing, type FeatureCard, type Listing, type ListingImage, type NeighborhoodPlace } from '../data/listing'

export type ListingSource = 'compass' | 'zillow' | 'redfin' | 'realtor' | 'mls' | 'unknown'

const BRAND_AGENT = demoListing.agent

const HOSTS = {
  compass: 'compass-com-real-estate-data-api.p.rapidapi.com',
  zillow: 'zillow-scraper-api.p.rapidapi.com',
  redfin: 'redfin-scraper-api.p.rapidapi.com',
} as const

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
          return asString(obj.url || obj.href || obj.src || obj.name || obj.title || obj.text)
        }
        return ''
      })
      .filter(Boolean)
  }
  if (typeof value === 'string') return value.split(/[\n|;]/).map((s) => s.trim()).filter(Boolean)
  return [String(value)]
}

function extractZpid(url: string): string | null {
  const m = url.match(/(\d{6,})_zpid/i) || url.match(/zpid[=/](\d{6,})/i)
  return m?.[1] ?? null
}

function buildImages(urls: string[]): ListingImage[] {
  const spans: ListingImage['span'][] = ['hero', 'wide', 'tall', 'square', 'wide', 'square']
  return urls.slice(0, 8).map((src, i) => ({
    src,
    alt: `Listing photo ${i + 1}`,
    span: spans[i] || 'square',
  }))
}

function featuresFromAmenities(amenities: string[], description: string): FeatureCard[] {
  const defaults = demoListing.features
  if (!amenities.length) return defaults
  const mapped = amenities.slice(0, 9).map((item) => {
    const [title, ...rest] = item.split(':')
    return {
      title: (title || 'Feature').trim().slice(0, 40),
      body: rest.join(':').trim() || item,
    }
  })
  while (mapped.length < 6) mapped.push(defaults[mapped.length % defaults.length])
  if (!description) return mapped
  return mapped
}

function placesFromSchools(schools: unknown): NeighborhoodPlace[] {
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
  const base = demoListing.places.filter((p) => p.icon !== 'school')
  return [...schoolPlaces, ...base].slice(0, 6)
}

function lifestyleFromImages(images: ListingImage[], neighborhood: string, city: string): Listing['lifestyle'] {
  const place = neighborhood || city || 'the neighborhood'
  const quotes = [
    `Morning light settles across the rooms in ${place}.`,
    `Evenings that begin steps from the best of ${place}.`,
    `A home composed for how Silicon Valley actually lives.`,
  ]
  return [0, 1, 2].map((i) => ({
    quote: quotes[i],
    image: images[i + 1]?.src || images[0]?.src || demoListing.images[0].src,
    caption: images[i + 1]?.alt || 'Residence moment',
  }))
}

function withJasonBrand(listing: Listing, sourceUrl: string): Listing {
  return {
    ...listing,
    listingUrl: sourceUrl || listing.listingUrl,
    website: 'https://www.jasonlimrealty.com',
    agent: { ...BRAND_AGENT },
  }
}

function normalizeGeneric(data: Record<string, unknown>, sourceUrl: string, _source: ListingSource): Listing {
  const photos = [
    ...asList(data.photos),
    ...asList(data.image_urls),
    ...asList(data.images),
    ...asList(data.image_url),
  ]
  const amenities = asList(data.amenities || data.features || data.highlights)
  const address = asString(data.street_address || data.address || data.name)
  const city = asString(data.city)
  const state = asString(data.state)
  const zip = asString(data.zip_code || data.zipcode || data.zip)
  const neighborhood = asString(data.neighborhood || data.area || data.subdivision)
  const description = asString(data.description || data.remarks || data.public_remarks)
  const price = money(data.price || data.list_price || data.listPrice)
  const beds = data.beds ?? data.bedrooms
  const baths = data.baths ?? data.bathrooms
  const sqft = data.sqft ?? data.living_area_sqft ?? data.living_area ?? data.square_feet
  const lot = data.lot_size_sqft ?? data.lot_size ?? data.lotSqFt
  const built = data.year_built ?? data.yearBuilt
  const garage = data.garage || data.parking
  const images = buildImages(photos.length ? photos : demoListing.images.map((i) => i.src))
  const place = neighborhood || city || 'this neighborhood'

  const garageValue = Array.isArray(garage)
    ? asString(garage[0], '—')
    : garage != null
      ? asString(garage)
      : '—'

  return withJasonBrand(
    {
      address: address || 'Address on request',
      city,
      state,
      zip,
      neighborhood: place,
      price: price || 'Price on request',
      status: asString(data.status || data.listing_status, 'Offered exclusively').replace(/_/g, ' '),
      headline: `Modern living in ${place}`,
      subhead: `A refined ${asString(data.property_type || data.home_type, 'residence').replace(/_/g, ' ').toLowerCase()} presentation for Silicon Valley sellers and buyers.`,
      about:
        description ||
        `Discover this residence in ${place}. Thoughtful spaces, standout presentation, and a setting that makes everyday life feel considered — prepared as a private listing brochure by Jason Lim, Compass.`,
      listingUrl: sourceUrl,
      website: 'https://www.jasonlimrealty.com',
      stats: [
        { label: 'Bedrooms', value: beds != null ? String(beds) : '—', icon: 'bed' },
        { label: 'Bathrooms', value: baths != null ? String(baths) : '—', icon: 'bath' },
        {
          label: 'Living Area',
          value: typeof sqft === 'number' ? `${Math.round(sqft).toLocaleString()} SF` : asString(sqft, '—'),
          icon: 'area',
        },
        {
          label: 'Lot Size',
          value: typeof lot === 'number' ? `${Math.round(lot).toLocaleString()} SF` : asString(lot, '—'),
          icon: 'lot',
        },
        { label: 'Garage', value: garageValue, icon: 'garage' },
        { label: 'Year Built', value: built != null ? String(built) : '—', icon: 'built' },
      ],
      images,
      features: featuresFromAmenities(amenities, description),
      neighborhoodIntro: `Exploring ${place}${city ? ` in ${city}` : ''} — schools, daily conveniences, and the corridors that connect to Silicon Valley’s defining campuses.`,
      places: placesFromSchools(data.schools),
      walkScore: Number(data.walk_score || data.walkScore) || demoListing.walkScore,
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
  if (res.status === 401 || res.status === 403) {
    throw new Error(`API key rejected for ${host}. Subscribe to that RapidAPI product, then try again.`)
  }
  if (res.status === 429) throw new Error('Rate limit hit. Wait a moment and retry.')
  if (res.status >= 400) {
    throw new Error(asString(json.message || json.error, `API error ${res.status}`))
  }
  if (json.success === false) {
    throw new Error(asString(json.error || json.message, 'Listing fetch failed'))
  }
  return json
}

async function fetchCompass(url: string, apiKey: string): Promise<Listing> {
  const json = await rapidGet(HOSTS.compass, `/compass/property?url=${encodeURIComponent(url)}`, apiKey)
  const data = (json.data || json) as Record<string, unknown>
  return normalizeGeneric(data, url, 'compass')
}

async function fetchZillow(url: string, apiKey: string): Promise<Listing> {
  const zpid = extractZpid(url)
  if (!zpid) {
    throw new Error('Could not find a Zillow property id (zpid) in that URL. Use a full homedetails link.')
  }
  const json = await rapidGet(HOSTS.zillow, `/zillow/property/${zpid}`, apiKey)
  const data = (json.data || json) as Record<string, unknown>
  return normalizeGeneric({ ...data, address: data.address || data.streetAddress }, url, 'zillow')
}

async function fetchRedfin(url: string, apiKey: string): Promise<Listing> {
  // PullAPI / Redfin scrapers vary; try URL detail first, then common alternates.
  const attempts = [
    { host: HOSTS.redfin, path: `/redfin/property?url=${encodeURIComponent(url)}` },
    { host: HOSTS.redfin, path: `/redfin/property-details?url=${encodeURIComponent(url)}` },
    { host: 'real-time-real-estate-data.p.rapidapi.com', path: `/redfin/property-details?url=${encodeURIComponent(url)}` },
  ]

  let lastError = 'Redfin import failed.'
  for (const attempt of attempts) {
    try {
      const json = await rapidGet(attempt.host, attempt.path, apiKey)
      const data = (json.data || json.property || json) as Record<string, unknown>
      return normalizeGeneric(data, url, 'redfin')
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err)
    }
  }
  throw new Error(
    `${lastError} Subscribe to a Redfin RapidAPI product (e.g. Redfin Scraper API), or paste a Compass/Zillow link instead.`,
  )
}

export async function importListingFromUrl(url: string, apiKey: string): Promise<{ listing: Listing; source: ListingSource }> {
  const trimmed = url.trim()
  if (!trimmed) throw new Error('Paste a listing URL first.')
  if (!apiKey.trim()) throw new Error('Add your RapidAPI key to import live listings.')

  const source = detectSource(trimmed)
  if (source === 'realtor' || source === 'mls') {
    throw new Error(
      `${sourceLabel(source)} links need an MLS/IDX feed or a subscribed scraper API. For now, paste a Compass, Zillow, or Redfin listing URL.`,
    )
  }
  if (source === 'unknown') {
    throw new Error('Use a Compass, Zillow, or Redfin listing URL.')
  }

  if (source === 'compass') return { listing: await fetchCompass(trimmed, apiKey.trim()), source }
  if (source === 'zillow') return { listing: await fetchZillow(trimmed, apiKey.trim()), source }
  return { listing: await fetchRedfin(trimmed, apiKey.trim()), source }
}
