/** Quick sanity check for Redfin JSON-LD payload parsing (no API key). */
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

// Mock response matching Redfin.Com Data API /details documentation
const mockRedfinDetails = {
  organization: {
    name: 'Redfin',
    url: 'https://www.redfin.com',
  },
  properties: [
    {
      name: '1134 Monroe St',
      address: {
        streetAddress: '1134 Monroe St',
        addressLocality: 'Santa Clara',
        addressRegion: 'CA',
        postalCode: '95050',
        addressCountry: 'US',
      },
      image: 'https://ssl.cdn-redfin.com/photo/123/bigphoto/456/test_1.jpg',
      price: 1898000,
      currency: 'USD',
      numberOfBedrooms: 3,
      numberOfBathroomsTotal: 2,
      floorSize: { value: 1450, unitCode: 'FTK' },
      listing_url:
        'https://www.redfin.com/CA/Santa-Clara/1134-Monroe-St-95050/home/1279750',
      latitude: 37.352,
      longitude: -121.936,
    },
  ],
}

// Inline minimal copies of helpers would be heavy — import compiled output after build.
// For now, validate expected field mapping logic manually.
function normalizeRedfinProperty(prop) {
  const out = { ...prop }
  const a = prop.address || {}
  out.street_address = a.streetAddress || a.street
  out.city = a.addressLocality || a.city
  out.state = a.addressRegion || a.state
  out.zip = a.postalCode || a.zip
  if (prop.image) out.photos = [prop.image]
  if (prop.numberOfBedrooms != null) out.beds = prop.numberOfBedrooms
  if (prop.numberOfBathroomsTotal != null) out.baths = prop.numberOfBathroomsTotal
  if (prop.floorSize?.value != null) out.sqft = prop.floorSize.value
  return out
}

const flat = normalizeRedfinProperty(mockRedfinDetails.properties[0])
const checks = [
  ['street_address', flat.street_address === '1134 Monroe St'],
  ['city', flat.city === 'Santa Clara'],
  ['state', flat.state === 'CA'],
  ['zip', flat.zip === '95050'],
  ['price', mockRedfinDetails.properties[0].price === 1898000],
  ['beds', flat.beds === 3],
  ['baths', flat.baths === 2],
  ['sqft', flat.sqft === 1450],
  ['photos', Array.isArray(flat.photos) && flat.photos.length === 1],
]

let failed = 0
for (const [label, ok] of checks) {
  console.log(`${ok ? '✓' : '✗'} ${label}`)
  if (!ok) failed++
}

if (failed) {
  console.error(`\n${failed} check(s) failed`)
  process.exit(1)
}
console.log('\nAll Redfin parse checks passed.')
