/**
 * Compass listing stat mapping — 2175 Meadowgate Way (PullAPI nested shape).
 * Run: node scripts/verify-compass-parse.mjs (after npm run build, uses dist logic via inline mirror)
 */

function toNumber(value) {
  if (value == null || value === '') return null
  const n = Number(String(value).replace(/[^\d.]/g, ''))
  return Number.isFinite(n) ? n : null
}

function parseFormattedLotSize(value) {
  const text = String(value || '').trim()
  if (!text) return null
  const sqft = text.match(/([\d,]+)\s*SF\b/i)
  if (sqft) return toNumber(sqft[1])
  const acres = text.match(/([\d.]+)\s*AC\b/i)
  if (acres) return Math.round(Number(acres[1]) * 43560)
  return null
}

function unwrapSize(listing) {
  const size = listing.size || {}
  return {
    beds: size.bedrooms,
    baths: size.totalBathrooms ?? size.bathrooms,
    sqft: size.squareFeet,
    lot: size.lotSizeInSquareFeet ?? parseFormattedLotSize(size.formattedLotSize),
    built: listing.buildingInfo?.buildingYearOpened,
    garage: listing.detailedInfo?.garageSpaces,
    walk: listing.location?.walkScore,
  }
}

const pullApiPayload = {
  success: true,
  data: {
    listingRelation: {
      listing: {
        size: {
          bedrooms: 4,
          fullBathrooms: 1,
          halfBathrooms: 1,
          totalBathrooms: 2,
          bathrooms: 1.5,
          squareFeet: 1317,
          lotSizeInSquareFeet: 1570,
          formattedLotSize: '0.04 AC / 1,570 SF',
        },
        location: { city: 'San Jose', neighborhood: 'Berryessa', zipCode: '95132', state: 'CA', walkScore: 62 },
        buildingInfo: { buildingYearOpened: 1972 },
        detailedInfo: {
          garageSpaces: 2,
          keyDetails: [
            { key: 'Year Built', value: '1972' },
            { key: 'Lot Size', value: '0.04 AC / 1,570 SF' },
            { key: 'Walk Score', value: '62' },
          ],
        },
      },
    },
  },
}

const flat = unwrapSize(pullApiPayload.data.listingRelation.listing)

const checks = [
  ['baths', flat.baths === 2],
  ['sqft', flat.sqft === 1317],
  ['lot', flat.lot === 1570],
  ['year', flat.built === 1972],
  ['garage', flat.garage === 2],
  ['walk score', flat.walk === 62],
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
console.log('\nAll Compass stat checks passed.')
