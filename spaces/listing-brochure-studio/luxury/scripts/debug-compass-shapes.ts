import { flattenCompassPayload, extractPropertyStats } from '../src/lib/listingImport'

const partial = {
  success: true,
  data: {
    beds: 4,
    street_address: '2175 Meadowgate Way',
    price: 865000,
    neighborhood: 'Berryessa',
    city: 'Berryessa',
    detailedInfo: { garageSpaces: 2 },
  },
}

const nested = {
  success: true,
  data: {
    beds: 4,
    listingRelation: {
      listing: {
        size: {
          bedrooms: 4,
          totalBathrooms: 2,
          squareFeet: 1317,
          lotSizeInSquareFeet: 1570,
        },
        location: { city: 'San Jose', neighborhood: 'Berryessa', zipCode: '95132', walkScore: 62 },
        buildingInfo: { buildingYearOpened: 1972 },
        detailedInfo: {
          garageSpaces: 2,
          keyDetails: [{ key: 'Year Built', value: '1972' }],
        },
      },
    },
  },
}

const flat = {
  success: true,
  data: {
    beds: 4,
    baths: 2,
    sqft: 1317,
    lot_size_sqft: 1570,
    street_address: '2175 Meadowgate Way',
    city: 'San Jose',
    neighborhood: 'Berryessa',
    zip_code: '95132',
    building: { year_built: 1972 },
    walk_score: 62,
  },
}

for (const [name, payload] of [
  ['partial', partial],
  ['nested', nested],
  ['flat', flat],
] as const) {
  const stats = extractPropertyStats(flattenCompassPayload(payload))
  console.log(name, stats)
}

// Simulates merge-all-endpoints (property partial + listing nested)
function mergeRecordFields(base: Record<string, unknown>, extra: Record<string, unknown>) {
  return { ...base, ...extra, ...(extra.size ? { size: extra.size } : {}) }
}
let merged: Record<string, unknown> = {}
merged = mergeRecordFields(merged, flattenCompassPayload(partial))
merged = mergeRecordFields(merged, flattenCompassPayload(nested))
const mergedStats = extractPropertyStats(flattenCompassPayload({ success: true, data: merged }))
console.log('merged partial+nested', mergedStats)
