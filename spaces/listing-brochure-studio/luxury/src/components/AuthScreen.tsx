import { useState } from 'react'
import { ArrowLeft, BookOpen, Loader2, Sparkles } from 'lucide-react'
import {
  createAccount,
  emptyProfileInput,
  hasSavedAccounts,
  signIn,
  type AgentAccount,
  type ProfileInput,
} from '../lib/agentAuth'
import { AgentProfileForm } from './AgentProfileForm'

export function AuthScreen({
  onSignedIn,
  onPreview,
  onHome,
}: {
  onSignedIn: (account: AgentAccount) => void
  onPreview?: () => void
  onHome?: () => void
}) {
  const [mode, setMode] = useState<'signin' | 'create'>(() => (hasSavedAccounts() ? 'signin' : 'create'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [profile, setProfile] = useState<ProfileInput>(() => emptyProfileInput())
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    setStatus('')
    try {
      const account =
        mode === 'signin' ? await signIn(email, password) : await createAccount(profile)
      onSignedIn(account)
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not continue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-ink text-white">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=2000&q=80"
          alt=""
          className="h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/85 to-ink" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
        <div className="mb-6 flex flex-wrap gap-2">
          {onHome ? (
            <button
              type="button"
              onClick={onHome}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/75 hover:bg-white/10"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Home
            </button>
          ) : null}
          {onPreview ? (
            <button
              type="button"
              onClick={onPreview}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/75 hover:bg-white/10"
            >
              <BookOpen className="h-3.5 w-3.5" />
              View sample brochure
            </button>
          ) : null}
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-soft">
          Listing Brochure Studio
        </p>
        <h1 className="editorial-display mt-4 text-5xl md:text-6xl">Sign in with your agent profile</h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg">
          Compass, Keller Williams, eXp, RE/MAX, and independent agents can create a profile. Your name,
          photo, license, and brokerage appear on every brochure you generate on this device.
        </p>

        <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-md md:p-8">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                mode === 'signin' ? 'bg-gold text-ink' : 'border border-white/20 text-white hover:bg-white/10'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode('create')}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                mode === 'create' ? 'bg-gold text-ink' : 'border border-white/20 text-white hover:bg-white/10'
              }`}
            >
              Create profile
            </button>
          </div>

          {mode === 'signin' ? (
            <div className="mt-6 grid gap-3">
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleSubmit()
                  }}
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-white/35"
                  placeholder="you@brokerage.com"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
                  Password
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleSubmit()
                  }}
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm outline-none placeholder:text-white/35"
                  placeholder="Your profile password"
                />
              </label>
            </div>
          ) : (
            <div className="mt-6">
              <AgentProfileForm
                value={profile}
                onChange={setProfile}
                showPassword
                tone="dark"
                passwordHint="Stored only in this browser — use a password you will remember on this device."
              />
            </div>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={() => void handleSubmit()}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-gold-soft disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {mode === 'signin' ? 'Sign in' : 'Save profile & continue'}
          </button>

          {status ? <p className="mt-4 text-sm text-gold-soft">{status}</p> : null}

          <p className="mt-6 text-xs leading-relaxed text-white/40">
            Profiles live in this browser (no cloud login). Sign in again on this device to reuse your
            branding across Compass, Zillow, and Redfin imports.
          </p>
        </div>
      </div>
    </section>
  )
}
