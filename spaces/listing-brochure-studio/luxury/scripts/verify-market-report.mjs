/** Nearby sold/listed comp mapping from Zillow-style search payloads. */

function money(value) {
  if (value == null || value === '') return ''
  if (typeof value === 'string' && value.trim().startsWith('$')) return value.trim()
  const n = Number(String(value).replace(/[^\d.]/g, ''))
  if (!Number.isFinite(n) || n <= 0) return ''
  return `$${Math.round(n).toLocaleString()}`
}

function detectStatus(raw, fallback) {
  const blob = [raw.homeStatus, raw.listingStatus, raw.dateSoldString].map((v) => String(v || '').toLowerCase()).join(' ')
  if (/pending/.test(blob)) return 'pending'
  if (/sold/.test(blob) || raw.dateSoldString) return 'sold'
  if (/for.?sale|listed|active/.test(blob)) return 'listed'
  return fallback || 'listed'
}

function compsFromPayload(payload, fallback) {
  const records = payload.props || payload.comps || payload.homes || []
  return records.map((raw) => ({
    address: raw.address || raw.streetAddress || '',
    status: detectStatus(raw, fallback),
    price: money(raw.unformattedPrice || raw.price),
    beds: String(raw.bedrooms ?? '—'),
    sqft: raw.livingArea ? `${raw.livingArea.toLocaleString()} SF` : '—',
  }))
}

const soldSearch = {
  props: [
    {
      address: '1412 Cherry Ave',
      unformattedPrice: 1765000,
      bedrooms: 3,
      livingArea: 1842,
      homeStatus: 'RECENTLY_SOLD',
      dateSoldString: '2026-06-12',
    },
    {
      address: '1188 Minnesota Ave',
      unformattedPrice: 1920000,
      bedrooms: 4,
      livingArea: 2310,
      homeStatus: 'RECENTLY_SOLD',
    },
  ],
}

const listSearch = {
  props: [
    {
      address: '1320 Camino Ramon',
      unformattedPrice: 1849000,
      bedrooms: 4,
      livingArea: 2180,
      homeStatus: 'FOR_SALE',
    },
  ],
}

const sold = compsFromPayload(soldSearch, 'sold')
const listed = compsFromPayload(listSearch, 'listed')

if (sold.length !== 2) throw new Error(`expected 2 sold comps, got ${sold.length}`)
if (sold[0].status !== 'sold') throw new Error(`expected sold status, got ${sold[0].status}`)
if (sold[0].price !== '$1,765,000') throw new Error(`sold price ${sold[0].price}`)
if (listed[0].status !== 'listed') throw new Error(`expected listed, got ${listed[0].status}`)
if (listed[0].price !== '$1,849,000') throw new Error(`list price ${listed[0].price}`)

console.log('verify-market-report: ok', { sold: sold.length, listed: listed.length, sample: sold[0].address })
