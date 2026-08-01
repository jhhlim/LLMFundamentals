import { useEffect, useState } from 'react'
import { demoListing } from './data/listing'
import { HeroSection } from './components/HeroSection'
import { PropertyStats } from './components/PropertyStats'
import { ImageGallery } from './components/ImageGallery'
import { NeighborhoodSection } from './components/NeighborhoodSection'
import { FeatureGrid } from './components/FeatureGrid'
import { LifestyleSection } from './components/LifestyleSection'
import { AgentSection } from './components/AgentSection'
import { Footer } from './components/Footer'
import { Toolbar } from './components/Toolbar'

export default function App() {
  const [dark, setDark] = useState(false)
  const listing = demoListing

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    document.body.style.background = dark ? '#0b1f33' : '#fcfaf6'
  }, [dark])

  return (
    <div className={dark ? 'bg-ink text-white' : 'bg-paper text-ink'}>
      <Toolbar dark={dark} onToggleTheme={() => setDark((v) => !v)} />

      <main>
        <HeroSection listing={listing} />
        <PropertyStats listing={listing} />
        <ImageGallery listing={listing} />
        <NeighborhoodSection listing={listing} />
        <FeatureGrid listing={listing} />
        <LifestyleSection listing={listing} />
        <AgentSection listing={listing} />
      </main>

      <Footer />
    </div>
  )
}
