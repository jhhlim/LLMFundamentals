import { QRCodeSVG } from 'qrcode.react'
import type { Listing } from '../data/listing'

/** Print-only Letter brochure — separate from the interactive scroll layout. */
export function PrintBrochure({ listing }: { listing: Listing }) {
  const photos = listing.images
  const hero = photos[0]?.src
  const gallery = photos.slice(1, 5)

  return (
    <div className="print-root hidden print:block">
      {/* PAGE 1 — Cover */}
      <section className="print-page print-cover">
        <div className="print-cover-media">
          {hero && <img src={hero} alt={listing.address} />}
          <div className="print-cover-shade" />
        </div>
        <div className="print-cover-content">
          <div className="print-cover-top">
            <div>
              <p className="print-kicker">{listing.agent.brokerage}</p>
              <p className="print-muted">{listing.agent.dre}</p>
            </div>
            <div className="print-right">
              <p className="print-kicker">{listing.status}</p>
              <p className="print-price">{listing.price}</p>
            </div>
          </div>
          <div className="print-cover-mid">
            <p className="print-kicker gold">
              {listing.neighborhood} · {listing.city}, {listing.state}
            </p>
            <h1>{listing.address}</h1>
            <p className="print-sub">{listing.subhead}</p>
          </div>
          <div className="print-cover-bottom">
            <div className="print-stat-row">
              {listing.stats.slice(0, 5).map((s) => (
                <div key={s.label}>
                  <p className="print-kicker">{s.label}</p>
                  <p className="print-stat-value">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="print-agent-inline">
              <img src={listing.agent.photo} alt={listing.agent.name} />
              <div>
                <strong>{listing.agent.name}</strong>
                <p>{listing.agent.title}</p>
                <p>{listing.agent.phone}</p>
                <p>{listing.agent.email}</p>
              </div>
            </div>
            <div className="print-qr">
              <QRCodeSVG value={listing.listingUrl || listing.website} size={72} />
              <span>View listing</span>
            </div>
          </div>
        </div>
      </section>

      {/* PAGE 2 — About + stats */}
      <section className="print-page print-light">
        <p className="print-kicker">About the home</p>
        <h2>{listing.headline}</h2>
        <div className="print-rule" />
        <p className="print-about">{listing.about}</p>
        <div className="print-cards">
          {listing.stats.map((s) => (
            <div key={s.label} className="print-card">
              <p className="print-kicker">{s.label}</p>
              <p className="print-stat-value dark">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PAGE 3 — Gallery */}
      <section className="print-page print-light">
        <p className="print-kicker">Residences in frame</p>
        <h2>A study in light & form</h2>
        <div className="print-gallery">
          {gallery.map((img, i) => (
            <figure key={img.src} className={i === 0 ? 'wide' : ''}>
              <img src={img.src} alt={img.alt} />
            </figure>
          ))}
        </div>
      </section>

      {/* PAGE 4 — Neighborhood + features */}
      <section className="print-page print-dark">
        <div className="print-split">
          <div>
            <p className="print-kicker gold">Neighborhood</p>
            <h2>{listing.neighborhood}</h2>
            <p className="print-body">{listing.neighborhoodIntro}</p>
            <div className="print-walk">
              <p className="print-kicker">Walk Score</p>
              <p className="print-stat-value">{listing.walkScore}</p>
            </div>
          </div>
          <div className="print-place-grid">
            {listing.places.map((p) => (
              <div key={p.name} className="print-place">
                <p className="print-kicker">{p.category}</p>
                <strong>{p.name}</strong>
                <p>{p.detail}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="print-feature-block">
          <p className="print-kicker gold">Features</p>
          <div className="print-feature-grid">
            {listing.features.slice(0, 6).map((f) => (
              <div key={f.title} className="print-place">
                <strong>{f.title}</strong>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PAGE 5 — Lifestyle + CTA */}
      <section className="print-page print-light">
        <p className="print-kicker">Lifestyle</p>
        <h2>How the days feel here</h2>
        <div className="print-lifestyle">
          {listing.lifestyle.slice(0, 2).map((m) => (
            <div key={m.caption} className="print-lifestyle-row">
              <img src={m.image} alt={m.caption} />
              <blockquote>“{m.quote}”</blockquote>
            </div>
          ))}
        </div>
        <div className="print-cta">
          <img src={listing.agent.photo} alt={listing.agent.name} className="print-cta-photo" />
          <div>
            <p className="print-kicker">Private showing</p>
            <h3>{listing.agent.name}</h3>
            <p>
              {listing.agent.title} · {listing.agent.brokerage}
            </p>
            <p>
              {listing.agent.phone} · {listing.agent.email}
            </p>
            <p>
              {listing.agent.dre} · jasonlimrealty.com
            </p>
          </div>
          <div className="print-qr light">
            <QRCodeSVG value={listing.listingUrl || listing.website} size={88} />
            <span>Scan to view</span>
          </div>
        </div>
      </section>
    </div>
  )
}
