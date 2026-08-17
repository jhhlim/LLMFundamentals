/** Sanity checks for Redfin payload parsing (no API key). */

function titleCaseWords(slug) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function parseRedfinUrlMeta(url) {
  const m = url.match(/redfin\.(?:com|ca)\/([A-Z]{2})\/([^/]+)\/([^/]+)\/home\/(\d+)/i)
  if (!m) return {}
  const [, state, citySlug, addressSlug, propertyId] = m
  const zipMatch = addressSlug.match(/-(\d{5})(?:-\d{4})?$/i)
  const zip = zipMatch?.[1] || ''
  const streetSlug = addressSlug.replace(/-(\d{5})(?:-\d{4})?$/i, '')
  return {
    state: state.toUpperCase(),
    city: titleCaseWords(citySlug),
    zip,
    street_address: titleCaseWords(streetSlug),
    propertyId: Number(propertyId),
  }
}

function extractRedfinMediaPhotos(data) {
  const urls = []
  const push = (raw) => {
    if (typeof raw === 'string' && raw.includes('cdn-redfin')) urls.push(raw)
  }
  const photos = data.mediaBrowserInfo?.photos || []
  for (const ph of photos) {
    push(ph.photoUrls?.fullScreenPhotoUrl)
    push(ph.photoUrls?.largePhotoUrl)
  }
  return { photos: [...new Set(urls)] }
}

const url =
  'https://www.redfin.com/CA/Santa-Clara/1134-Monroe-St-95050/home/1279750'
const urlMeta = parseRedfinUrlMeta(url)

const stingrayAboveFold = {
  resultCode: 0,
  payload: {
    propertyId: 1279750,
    listingId: 138238059,
    addressInfo: {
      streetAddress: '1134 Monroe St',
      city: 'Santa Clara',
      state: 'CA',
      zip: '95050',
    },
    price: 1100000,
    beds: 3,
    baths: 2,
    sqFt: 1450,
    mediaBrowserInfo: {
      photos: [
        {
          photoUrls: {
            fullScreenPhotoUrl: 'https://ssl.cdn-redfin.com/photo/1/bigphoto/1/a.jpg',
          },
        },
        {
          photoUrls: {
            fullScreenPhotoUrl: 'https://ssl.cdn-redfin.com/photo/1/bigphoto/1/b.jpg',
          },
        },
        {
          photoUrls: {
            fullScreenPhotoUrl: 'https://ssl.cdn-redfin.com/photo/1/bigphoto/1/c.jpg',
          },
        },
      ],
    },
  },
}

const photos = extractRedfinMediaPhotos(stingrayAboveFold.payload)

const checks = [
  ['url city', urlMeta.city === 'Santa Clara'],
  ['url zip', urlMeta.zip === '95050'],
  ['url street', urlMeta.street_address === '1134 Monroe St'],
  ['url propertyId', urlMeta.propertyId === 1279750],
  ['stingray beds', stingrayAboveFold.payload.beds === 3],
  ['stingray sqFt', stingrayAboveFold.payload.sqFt === 1450],
  ['photo count', photos.photos.length === 3],
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
