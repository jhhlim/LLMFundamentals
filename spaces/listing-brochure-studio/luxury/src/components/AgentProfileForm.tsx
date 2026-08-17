import { useRef } from 'react'
import { Upload } from 'lucide-react'
import {
  BROKERAGES,
  fileToProfilePhoto,
  initialsAvatar,
  type BrokerageId,
  type ProfileInput,
} from '../lib/agentAuth'

const fieldClass = {
  light: 'w-full rounded-xl border border-stone-light/60 bg-white px-3 py-2 text-sm text-ink outline-none',
  dark: 'w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35',
}

const labelClass = {
  light: 'mb-1 block text-sm font-semibold text-ink',
  dark: 'mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55',
}

export function AgentProfileForm({
  value,
  onChange,
  showPassword,
  passwordLabel = 'Password',
  passwordHint,
  tone = 'light',
}: {
  value: ProfileInput
  onChange: (next: ProfileInput) => void
  showPassword: boolean
  passwordLabel?: string
  passwordHint?: string
  tone?: 'light' | 'dark'
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const inputClass = fieldClass[tone]
  const lbl = labelClass[tone]
  const preview = value.photo.trim() || initialsAvatar(value.name || 'Agent')

  function set<K extends keyof ProfileInput>(key: K, next: ProfileInput[K]) {
    onChange({ ...value, [key]: next })
  }

  function setBrokerage(brokerageId: BrokerageId) {
    const preset = BROKERAGES.find((b) => b.id === brokerageId) || BROKERAGES[0]
    const looksDefault = !value.title.trim() || /REALTOR/i.test(value.title)
    onChange({
      ...value,
      brokerageId,
      title: looksDefault ? `${preset.name} REALTOR®` : value.title,
    })
  }

  async function onPickPhoto(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    const photo = await fileToProfilePhoto(file)
    onChange({ ...value, photo })
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
        <img src={preview} alt="" className="h-20 w-20 rounded-2xl object-cover ring-1 ring-white/20" />
        <div className="min-w-0 flex-1 space-y-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={
              tone === 'dark'
                ? 'inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10'
                : 'inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white'
            }
          >
            <Upload className="h-4 w-4" />
            Upload headshot
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => void onPickPhoto(e.target.files)} />
          <input
            className={inputClass}
            placeholder="Or paste a photo URL"
            value={value.photo.startsWith('data:') ? '' : value.photo}
            onChange={(e) => set('photo', e.target.value)}
          />
        </div>
      </div>

      <label className="block">
        <span className={lbl}>Full name</span>
        <input className={inputClass} value={value.name} onChange={(e) => set('name', e.target.value)} placeholder="Alex Rivera" />
      </label>
      <label className="block">
        <span className={lbl}>Email</span>
        <input
          className={inputClass}
          type="email"
          value={value.email}
          onChange={(e) => set('email', e.target.value)}
          placeholder="you@brokerage.com"
        />
      </label>
      {showPassword && (
        <label className="block sm:col-span-2">
          <span className={lbl}>{passwordLabel}</span>
          <input
            className={inputClass}
            type="password"
            value={value.password}
            onChange={(e) => set('password', e.target.value)}
            placeholder="At least 6 characters"
            autoComplete={passwordLabel.toLowerCase().includes('new') ? 'new-password' : 'current-password'}
          />
          {passwordHint ? (
            <p className={tone === 'dark' ? 'mt-1 text-xs text-white/45' : 'mt-1 text-xs text-stone'}>{passwordHint}</p>
          ) : null}
        </label>
      )}
      <label className="block">
        <span className={lbl}>Phone</span>
        <input className={inputClass} value={value.phone} onChange={(e) => set('phone', e.target.value)} placeholder="(555) 555-0100" />
      </label>
      <label className="block">
        <span className={lbl}>License / DRE</span>
        <input className={inputClass} value={value.dre} onChange={(e) => set('dre', e.target.value)} placeholder="DRE #01234567" />
      </label>
      <label className="block">
        <span className={lbl}>Website</span>
        <input
          className={inputClass}
          value={value.website}
          onChange={(e) => set('website', e.target.value)}
          placeholder="yourwebsite.com"
        />
      </label>
      <label className="block">
        <span className={lbl}>Title</span>
        <input
          className={inputClass}
          value={value.title}
          onChange={(e) => set('title', e.target.value)}
          placeholder="REALTOR®"
        />
      </label>
      <label className="block sm:col-span-2">
        <span className={lbl}>Brokerage</span>
        <select
          className={inputClass}
          value={value.brokerageId}
          onChange={(e) => setBrokerage(e.target.value as BrokerageId)}
        >
          {BROKERAGES.map((b) => (
            <option key={b.id} value={b.id} className="text-ink">
              {b.name}
            </option>
          ))}
        </select>
      </label>
      {value.brokerageId === 'independent' && (
        <label className="block sm:col-span-2">
          <span className={lbl}>Brokerage name</span>
          <input
            className={inputClass}
            value={value.customBrokerage}
            onChange={(e) => set('customBrokerage', e.target.value)}
            placeholder="Your brokerage or team name"
          />
        </label>
      )}
    </div>
  )
}
