/**
 * Integration test: flattenCompassPayload + extractPropertyStats for Meadowgate Way.
 * Run: npx tsx scripts/verify-compass-stats.ts
 */
import { extractPropertyStats, flattenCompassPayload } from '../src/lib/listingImport'

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
        location: {
          city: 'San Jose',
          neighborhood: 'Berryessa',
          zipCode: '95132',
          state: 'CA',
          walkScore: 62,
        },
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

const flat = flattenCompassPayload(pullApiPayload as Record<string, unknown>)
const stats = extractPropertyStats(flat)

const checks: Array<[string, boolean]> = [
  ['beds', stats.beds === 4],
  ['baths', stats.baths === 2],
  ['sqft', stats.sqft === 1317],
  ['lot', stats.lot === 1570],
  ['built', stats.built === 1972],
  ['garage', stats.garage === '2 Car'],
  ['walk score', stats.walkScore === 62],
]

let failed = 0
for (const [label, ok] of checks) {
  console.log(`${ok ? '✓' : '✗'} ${label}${ok ? '' : ` (got ${JSON.stringify(stats[label as keyof typeof stats] ?? 'n/a')})`}`)
  if (!ok) failed++
}

if (failed) {
  console.error(`\n${failed} check(s) failed`)
  process.exit(1)
}
console.log('\nCompass flatten + extractPropertyStats: ok')
