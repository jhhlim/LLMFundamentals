/** Sanity checks for Redfin photo expansion + walk score parsing. */

function upgradeRedfinPhotoUrl(url) {
  return url
    .replace('/islphoto/', '/bigphoto/')
    .replace(/genIslnoResize\./g, '')
}

function expandRedfinPhotoSequence(urls, photoCount) {
  const template = urls.find((u) => /cdn-redfin\.com\/photo\/.*[_-]\d+\.[a-z]+(\?|$)/i.test(u))
  if (!template) return urls
  const match = template.match(/^(.*)[_-](\d+)(\.[a-z]+)(\?.*)?$/i)
  if (!match) return urls
  const [, prefix, , ext, query = ''] = match
  const target = Math.min(Math.max(photoCount || 36, urls.length), 60)
  const expanded = [...urls]
  for (let i = 0; i < target; i++) expanded.push(`${prefix}_${i}${ext}${query}`)
  return [...new Set(expanded)]
}

function pickWalkScore(walkObj) {
  const n = Number(walkObj?.walkScore ?? walkObj?.walkscore ?? walkObj?.score)
  return Number.isFinite(n) && n > 0 && n <= 100 ? n : 0
}

const url = 'https://www.redfin.com/CA/Santa-Clara/1134-Monroe-St-95050/home/1279750'
const onePhoto = ['https://ssl.cdn-redfin.com/photo/8/islphoto/750/genIslnoResize.1279750_0.jpg']
const upgraded = onePhoto.map(upgradeRedfinPhotoUrl)
const expanded = expandRedfinPhotoSequence(upgraded, 12)
const walk = pickWalkScore({ walkScore: 82, walkScoreDescription: 'Very Walkable' })

const checks = [
  ['upgrade bigphoto', upgraded[0].includes('/bigphoto/')],
  ['strip genIsl', !upgraded[0].includes('genIslnoResize')],
  ['expand count', expanded.length >= 12],
  ['expand _5', expanded.some((u) => u.endsWith('_5.jpg'))],
  ['walk score', walk === 82],
  ['listing url', url.includes('1279750')],
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
console.log('\nAll Redfin photo/walk checks passed.')
