export type ListingImage = {
  src: string
  alt: string
  span?: 'hero' | 'wide' | 'tall' | 'square'
}

export type ListingStat = {
  label: string
  value: string
  icon: 'bed' | 'bath' | 'area' | 'lot' | 'garage' | 'built' | 'walk'
}

export type FeatureCard = {
  title: string
  body: string
}

export type NeighborhoodPlace = {
  category: string
  name: string
  detail: string
  icon: 'school' | 'dining' | 'park' | 'shop' | 'transit' | 'tech'
}

export type LifestyleMoment = {
  quote: string
  image: string
  caption: string
}

export type Agent = {
  name: string
  title: string
  brokerage: string
  phone: string
  email: string
  dre: string
  photo: string
  website: string
}

export type Listing = {
  address: string
  city: string
  state: string
  zip: string
  neighborhood: string
  price: string
  status: string
  headline: string
  subhead: string
  about: string
  listingUrl: string
  website: string
  stats: ListingStat[]
  images: ListingImage[]
  features: FeatureCard[]
  neighborhoodIntro: string
  places: NeighborhoodPlace[]
  walkScore: number
  lifestyle: LifestyleMoment[]
  agent: Agent
}

export const demoListing: Listing = {
  address: '1287 Willow Glen Way',
  city: 'San Jose',
  state: 'CA',
  zip: '95125',
  neighborhood: 'Willow Glen',
  price: '$1,895,000',
  status: 'Offered exclusively',
  headline: 'Modern living in Willow Glen',
  subhead: 'A light-filled Silicon Valley residence where architecture, garden, and everyday ease meet.',
  about:
    'Set on a quiet Willow Glen street, this residence opens with a sense of calm arrival — sunlit volumes, refined materials, and a floor plan designed for both intimate evenings and generous gatherings. The kitchen anchors the home with quiet precision, while the primary suite offers a private retreat above the garden. Outdoors, a covered patio and landscaped grounds invite long Silicon Valley summers: morning coffee, golden-hour dinners, and weekends that never feel rushed. Minutes from downtown Willow Glen’s boutiques and cafés, yet tucked into a neighborhood cadence that still feels residential — this is a home composed for how people actually live in the South Bay.',
  listingUrl: 'https://maps.google.com/?q=1287+Willow+Glen+Way+San+Jose+CA+95125',
  website: '',
  stats: [
    { label: 'Bedrooms', value: '4', icon: 'bed' },
    { label: 'Bathrooms', value: '3', icon: 'bath' },
    { label: 'Living Area', value: '2,450 SF', icon: 'area' },
    { label: 'Lot Size', value: '6,100 SF', icon: 'lot' },
    { label: 'Garage', value: '2 Car', icon: 'garage' },
    { label: 'Year Built', value: '2019', icon: 'built' },
    { label: 'Walk Score', value: '78', icon: 'walk' },
  ],
  images: [
    {
      src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80',
      alt: 'Pool and modern facade at dusk',
      span: 'hero',
    },
    {
      src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
      alt: 'Night exterior with warm interior glow',
      span: 'wide',
    },
    {
      src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80',
      alt: 'Living room with open kitchen beyond',
      span: 'tall',
    },
    {
      src: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=80',
      alt: 'Contemporary street elevation',
      span: 'square',
    },
    {
      src: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80',
      alt: 'Primary suite with garden light',
      span: 'wide',
    },
    {
      src: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=80',
      alt: 'Chef kitchen island',
      span: 'square',
    },
  ],
  features: [
    {
      title: 'Kitchen',
      body: 'Quartz surfaces, island seating, and a chef-ready appliance suite composed for everyday cooking and weekend hosting.',
    },
    {
      title: 'Bathrooms',
      body: 'Spa-inspired primary bath with refined finishes; secondary baths designed for calm utility and guest comfort.',
    },
    {
      title: 'Flooring',
      body: 'Wide-plank hardwood throughout principal living spaces — warm underfoot, quiet in tone.',
    },
    {
      title: 'Windows',
      body: 'Expansive glazing draws garden light deep into the plan and frames evening skies.',
    },
    {
      title: 'Energy',
      body: 'High-performance envelope considerations and efficient systems tuned for South Bay seasons.',
    },
    {
      title: 'Smart Home',
      body: 'Lighting and climate ready for modern control — discreet technology, never the centerpiece.',
    },
    {
      title: 'Roof & Exterior',
      body: 'Contemporary envelope with low-maintenance composition and strong curb presence.',
    },
    {
      title: 'HVAC',
      body: 'Zoned comfort for upstairs retreats and open living below — even temperatures, quiet operation.',
    },
    {
      title: 'Electrical',
      body: 'Updated service with capacity for EV charging and today’s connected household.',
    },
  ],
  neighborhoodIntro:
    'Willow Glen remains one of Silicon Valley’s most sought-after village neighborhoods — tree-lined streets, a walkable downtown, and an easy orbit to the region’s defining campuses.',
  places: [
    { category: 'Schools', name: 'Willow Glen Elementary / Middle', detail: 'Highly regarded local campuses', icon: 'school' },
    { category: 'Dining', name: 'Lincoln Avenue', detail: 'Cafés, wine bars, weekend brunch', icon: 'dining' },
    { category: 'Parks', name: 'Willow Street / Del Monte', detail: 'Green space for morning loops', icon: 'park' },
    { category: 'Shopping', name: 'Downtown Willow Glen', detail: 'Boutiques and everyday essentials', icon: 'shop' },
    { category: 'Transit', name: 'Caltrain & 280 / 87', detail: 'Peninsula and South Bay access', icon: 'transit' },
    { category: 'Tech', name: 'Apple · Google · NVIDIA', detail: 'Commute-friendly corridors', icon: 'tech' },
  ],
  walkScore: 78,
  lifestyle: [
    {
      quote: 'Morning coffee on the private patio, before the day begins.',
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80',
      caption: 'Private outdoor living',
    },
    {
      quote: 'Minutes from downtown Willow Glen — dinner without the freeway.',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80',
      caption: 'Village evenings',
    },
    {
      quote: 'Light that moves through the house from noon to golden hour.',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
      caption: 'Architectural calm',
    },
  ],
  agent: {
    name: 'Jason Lim',
    title: 'Compass REALTOR®',
    brokerage: 'Compass',
    phone: '(510) 480-7191',
    email: 'jason.lim@compass.com',
    dre: 'DRE #02444964',
    photo: 'https://www.jasonlimrealty.com/images/jason-lim-headshot.jpg',
    website: 'https://www.jasonlimrealty.com',
  },
}
