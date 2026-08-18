import { SHOW_MARKET_TRENDS } from './featureFlags'

export const SECTION_IDS = {
  overview: 'section-overview',
  about: 'section-about',
  gallery: 'section-gallery',
  neighborhood: 'section-neighborhood',
  market: 'section-market',
  features: 'section-features',
  lifestyle: 'section-lifestyle',
  agent: 'section-agent',
} as const

const ALL_BROCHURE_SECTIONS = [
  { id: SECTION_IDS.overview, label: 'Overview' },
  { id: SECTION_IDS.about, label: 'About the home' },
  { id: SECTION_IDS.gallery, label: 'Gallery' },
  { id: SECTION_IDS.neighborhood, label: 'Neighborhood' },
  { id: SECTION_IDS.market, label: 'Market trends' },
  { id: SECTION_IDS.features, label: 'Craft & systems' },
  { id: SECTION_IDS.lifestyle, label: 'Lifestyle' },
  { id: SECTION_IDS.agent, label: 'Private showing' },
] as const

export const BROCHURE_SECTIONS = SHOW_MARKET_TRENDS
  ? ALL_BROCHURE_SECTIONS
  : ALL_BROCHURE_SECTIONS.filter((s) => s.id !== SECTION_IDS.market)

export type BrochureSectionId = (typeof ALL_BROCHURE_SECTIONS)[number]['id']
