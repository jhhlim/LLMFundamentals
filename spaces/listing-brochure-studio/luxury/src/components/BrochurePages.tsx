import type { Listing } from '../data/listing'
import { SHOW_MARKET_TRENDS } from '../lib/featureFlags'
import { HeroSection } from './HeroSection'
import { PropertyStats } from './PropertyStats'
import { ImageGallery } from './ImageGallery'
import { NeighborhoodSection } from './NeighborhoodSection'
import { MarketTrendsSection } from './MarketTrendsSection'
import { FeatureGrid } from './FeatureGrid'
import { LifestyleSection } from './LifestyleSection'
import { AgentSection } from './AgentSection'

export function BrochurePages({ listing }: { listing: Listing }) {
  return (
    <main>
      <HeroSection listing={listing} />
      <PropertyStats listing={listing} />
      <ImageGallery listing={listing} />
      <NeighborhoodSection listing={listing} />
      {SHOW_MARKET_TRENDS ? <MarketTrendsSection listing={listing} /> : null}
      <FeatureGrid listing={listing} />
      <LifestyleSection listing={listing} />
      <AgentSection listing={listing} />
    </main>
  )
}
