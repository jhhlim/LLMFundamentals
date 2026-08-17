/** Compass listing size/keyDetails mapping (2175 Meadowgate Way). */

function unwrapCompassSize(listing) {
  const size = listing.size || {}
  const loc = listing.location || {}
  const details = listing.detailedInfo || {}
  const info = listing.buildingInfo || {}
  return {
    beds: size.bedrooms,
    baths: size.totalBathrooms ?? size.bathrooms,
    sqft: size.squareFeet,
    lot: size.lotSizeInSquareFeet,
    built: info.buildingYearOpened,
    garage: details.garageSpaces,
    city: loc.city,
    neighborhood: loc.neighborhood,
    zip: loc.zipCode,
    facts: (details.keyDetails || []).map((d) => `${d.key}: ${d.value}`),
  }
}

const listing = {
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
  location: { city: 'San Jose', neighborhood: 'Berryessa', zipCode: '95132', state: 'CA' },
  buildingInfo: { buildingYearOpened: 1972 },
  detailedInfo: {
    garageSpaces: 2,
    keyDetails: [
      { key: 'Year Built', value: '1972' },
      { key: 'Lot Size', value: '0.04 AC / 1,570 SF' },
    ],
  },
}

const flat = unwrapCompassSize(listing)
const lotFromFact = flat.facts
  .find((f) => f.startsWith('Lot Size:'))
  ?.match(/\/\s*([\d,]+)\s*SF/i)?.[1]

const checks = [
  ['baths', flat.baths === 2],
  ['sqft', flat.sqft === 1317],
  ['lot', flat.lot === 1570],
  ['year', flat.built === 1972],
  ['city', flat.city === 'San Jose'],
  ['garage', flat.garage === 2],
  ['lot from keyDetails', lotFromFact === '1,570'],
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
