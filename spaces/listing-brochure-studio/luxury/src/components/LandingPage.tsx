import { ArrowRight, BookOpen, Sparkles } from 'lucide-react'
import { RapidApiDisclaimer } from './RapidApiDisclaimer'

export function LandingPage({
  onPreview,
  onSignIn,
}: {
  onPreview: () => void
  onSignIn: () => void
}) {
  return (
    <section className="relative min-h-screen overflow-hidden bg-ink text-white">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80"
          alt=""
          className="h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/88 to-ink" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-soft">
          Listing Brochure Studio
        </p>
        <h1 className="editorial-display mt-4 max-w-3xl text-5xl md:text-7xl">
          Luxury listing brochures, composed in minutes
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/72 md:text-lg">
          Editorial, print-ready collateral for Compass, Keller Williams, eXp, RE/MAX, and independent agents.
          Paste a listing URL, brand it with your profile, and export to PDF — or browse the sample brochure first.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-ink transition hover:bg-gold-soft"
          >
            <BookOpen className="h-4 w-4" />
            View sample brochure
          </button>
          <button
            type="button"
            onClick={onSignIn}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Sign in to create yours
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { title: 'Full-screen story', body: 'Hero, gallery, neighborhood, features, and agent CTA — like a private listing book.' },
            { title: 'Your branding', body: 'Name, headshot, license, and brokerage on every page after you sign in.' },
            { title: 'Print / PDF', body: 'Letter-size print layout with QR code — ready for showings and seller packets.' },
          ].map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
            >
              <p className="flex items-center gap-2 text-sm font-semibold text-gold-soft">
                <Sparkles className="h-3.5 w-3.5" />
                {item.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">{item.body}</p>
            </li>
          ))}
        </ul>

        <RapidApiDisclaimer className="mt-10 max-w-2xl" tone="dark" />
      </div>
    </section>
  )
}
