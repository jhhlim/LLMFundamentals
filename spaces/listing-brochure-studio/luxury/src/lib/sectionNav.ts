export const BROCHURE_SECTIONS = [
  { id: 'section-overview', label: 'Overview' },
  { id: 'section-about', label: 'About the home' },
  { id: 'section-gallery', label: 'Gallery' },
  { id: 'section-neighborhood', label: 'Neighborhood' },
  { id: 'section-market', label: 'Market trends' },
  { id: 'section-features', label: 'Craft & systems' },
  { id: 'section-lifestyle', label: 'Lifestyle' },
  { id: 'section-agent', label: 'Private showing' },
] as const

export type BrochureSectionId = (typeof BROCHURE_SECTIONS)[number]['id']
