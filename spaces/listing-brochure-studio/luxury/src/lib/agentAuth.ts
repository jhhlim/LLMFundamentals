import type { Agent } from '../data/listing'

export type BrokerageId =
  | 'compass'
  | 'keller-williams'
  | 'exp'
  | 'remax'
  | 'coldwell-banker'
  | 'sothebys'
  | 'berkshire'
  | 'century-21'
  | 'realty-one'
  | 'better-homes'
  | 'independent'

export type BrokeragePreset = {
  id: BrokerageId
  name: string
  title: string
}

export const BROKERAGES: BrokeragePreset[] = [
  { id: 'compass', name: 'Compass', title: 'REALTOR®' },
  { id: 'keller-williams', name: 'Keller Williams', title: 'REALTOR®' },
  { id: 'exp', name: 'eXp Realty', title: 'REALTOR®' },
  { id: 'remax', name: 'RE/MAX', title: 'REALTOR®' },
  { id: 'coldwell-banker', name: 'Coldwell Banker', title: 'REALTOR®' },
  { id: 'sothebys', name: "Sotheby's International Realty", title: 'REALTOR®' },
  { id: 'berkshire', name: 'Berkshire Hathaway HomeServices', title: 'REALTOR®' },
  { id: 'century-21', name: 'Century 21', title: 'REALTOR®' },
  { id: 'realty-one', name: 'Realty One Group', title: 'REALTOR®' },
  { id: 'better-homes', name: 'Better Homes and Gardens Real Estate', title: 'REALTOR®' },
  { id: 'independent', name: 'Independent / Other', title: 'REALTOR®' },
]

export type AgentAccount = Agent & {
  id: string
  emailKey: string
  brokerageId: BrokerageId
  customBrokerage: string
  passwordHash: string
  salt: string
  createdAt: string
  /** Debug banners and import diagnostics — set via admin email allowlist. */
  isAdmin?: boolean
}

/** Emails that see debug/import banners and API warnings. */
const ADMIN_EMAIL_KEYS = new Set(['jason.lim@compass.com'])

export function isAdminAccount(account: AgentAccount | null | undefined): boolean {
  if (!account) return false
  return account.isAdmin === true || ADMIN_EMAIL_KEYS.has(account.emailKey)
}

function withAdminFlag(account: AgentAccount): AgentAccount {
  if (ADMIN_EMAIL_KEYS.has(account.emailKey)) return { ...account, isAdmin: true }
  return account
}

const ACCOUNTS_KEY = 'brochure_agent_accounts_v1'
const SESSION_KEY = 'brochure_agent_session_v1'

function emailKey(email: string): string {
  return email.trim().toLowerCase()
}

export function initialsAvatar(name: string): string {
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
    <rect width="256" height="256" rx="48" fill="#0b1f33"/>
    <text x="50%" y="54%" text-anchor="middle" font-family="Georgia, serif" font-size="92" fill="#d4b483">${initials}</text>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function displayWebsite(url: string): string {
  const raw = url.trim()
  if (!raw) return ''
  try {
    const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
    return new URL(withProto).hostname.replace(/^www\./, '')
  } catch {
    return raw.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '')
  }
}

export function websiteHref(url: string): string {
  const raw = url.trim()
  if (!raw) return ''
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
}

export function brokerageName(account: Pick<AgentAccount, 'brokerageId' | 'customBrokerage' | 'brokerage'>): string {
  if (account.brokerageId === 'independent' && account.customBrokerage.trim()) return account.customBrokerage.trim()
  return account.brokerage || BROKERAGES.find((b) => b.id === account.brokerageId)?.name || 'Brokerage'
}

async function sha256Hex(value: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function randomSalt(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function hashPassword(password: string, salt: string): Promise<string> {
  return sha256Hex(`${salt}:${password}`)
}

function loadAccounts(): AgentAccount[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    const parsed = raw ? (JSON.parse(raw) as AgentAccount[]) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveAccounts(accounts: AgentAccount[]) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

export function hasSavedAccounts(): boolean {
  return loadAccounts().length > 0
}

export async function fileToProfilePhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Choose a photo file.')
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Could not read photo.'))
    reader.readAsDataURL(file)
  })
  return resizeDataUrl(dataUrl, 512)
}

function resizeDataUrl(dataUrl: string, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const width = Math.max(1, Math.round(img.width * scale))
      const height = Math.max(1, Math.round(img.height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(dataUrl)
        return
      }
      ctx.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL('image/jpeg', 0.88))
    }
    img.onerror = () => reject(new Error('Could not process photo.'))
    img.src = dataUrl
  })
}

export function loadSession(): AgentAccount | null {
  if (typeof sessionStorage === 'undefined') return null
  const id = sessionStorage.getItem(SESSION_KEY)
  if (!id) return null
  const account = loadAccounts().find((a) => a.id === id)
  return account ? withAdminFlag(account) : null
}

function setSession(id: string) {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(SESSION_KEY, id)
}

export function signOut() {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(SESSION_KEY)
}

export function toAgent(account: AgentAccount): Agent {
  const brokerage = brokerageName(account)
  return {
    name: account.name,
    title: account.title || `${brokerage} REALTOR®`,
    brokerage,
    phone: account.phone,
    email: account.email,
    dre: account.dre,
    photo: account.photo || initialsAvatar(account.name),
    website: websiteHref(account.website),
  }
}

export type ProfileInput = {
  name: string
  email: string
  password: string
  phone: string
  dre: string
  website: string
  title: string
  brokerageId: BrokerageId
  customBrokerage: string
  photo: string
}

export function emptyProfileInput(): ProfileInput {
  return {
    name: '',
    email: '',
    password: '',
    phone: '',
    dre: '',
    website: '',
    title: '',
    brokerageId: 'compass',
    customBrokerage: '',
    photo: '',
  }
}

export function inputFromAccount(account: AgentAccount): ProfileInput {
  return {
    name: account.name,
    email: account.email,
    password: '',
    phone: account.phone,
    dre: account.dre,
    website: account.website,
    title: account.title,
    brokerageId: account.brokerageId,
    customBrokerage: account.customBrokerage,
    photo: account.photo,
  }
}

function validateProfile(input: ProfileInput, requirePassword: boolean) {
  if (!input.name.trim()) throw new Error('Add your name.')
  if (!input.email.trim() || !input.email.includes('@')) throw new Error('Add a valid email.')
  if (requirePassword && input.password.trim().length < 6) {
    throw new Error('Password must be at least 6 characters.')
  }
}

export async function createAccount(input: ProfileInput): Promise<AgentAccount> {
  validateProfile(input, true)
  const accounts = loadAccounts()
  const key = emailKey(input.email)
  if (accounts.some((a) => a.emailKey === key)) {
    throw new Error('An account with that email already exists. Sign in instead.')
  }
  const preset = BROKERAGES.find((b) => b.id === input.brokerageId) || BROKERAGES[0]
  const salt = randomSalt()
  const account: AgentAccount = {
    id: crypto.randomUUID(),
    emailKey: key,
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    dre: input.dre.trim(),
    website: websiteHref(input.website),
    title: input.title.trim() || `${preset.name} REALTOR®`,
    brokerageId: input.brokerageId,
    customBrokerage: input.customBrokerage.trim(),
    brokerage: input.brokerageId === 'independent' ? input.customBrokerage.trim() || 'Independent' : preset.name,
    photo: input.photo.trim() || initialsAvatar(input.name),
    passwordHash: await hashPassword(input.password, salt),
    salt,
    createdAt: new Date().toISOString(),
  }
  saveAccounts([...accounts, account])
  setSession(account.id)
  return withAdminFlag(account)
}

export async function signIn(email: string, password: string): Promise<AgentAccount> {
  const account = loadAccounts().find((a) => a.emailKey === emailKey(email))
  if (!account) throw new Error('No profile found for that email. Create one to get started.')
  const hash = await hashPassword(password, account.salt)
  if (hash !== account.passwordHash) throw new Error('Incorrect password.')
  setSession(account.id)
  return withAdminFlag(account)
}

export async function updateAccount(id: string, input: Omit<ProfileInput, 'password'> & { password?: string }): Promise<AgentAccount> {
  validateProfile({ ...emptyProfileInput(), ...input, password: input.password || '' }, Boolean(input.password?.trim()))
  const accounts = loadAccounts()
  const index = accounts.findIndex((a) => a.id === id)
  if (index < 0) throw new Error('Profile not found. Sign in again.')
  const current = accounts[index]
  const preset = BROKERAGES.find((b) => b.id === input.brokerageId) || BROKERAGES[0]
  const next: AgentAccount = {
    ...current,
    name: input.name.trim(),
    email: input.email.trim(),
    emailKey: emailKey(input.email),
    phone: input.phone.trim(),
    dre: input.dre.trim(),
    website: websiteHref(input.website),
    title: input.title.trim() || `${preset.name} REALTOR®`,
    brokerageId: input.brokerageId,
    customBrokerage: input.customBrokerage.trim(),
    brokerage: input.brokerageId === 'independent' ? input.customBrokerage.trim() || 'Independent' : preset.name,
    photo: input.photo.trim() || initialsAvatar(input.name),
  }
  if (input.password?.trim()) {
    if (input.password.trim().length < 6) throw new Error('Password must be at least 6 characters.')
    next.salt = randomSalt()
    next.passwordHash = await hashPassword(input.password, next.salt)
  }
  const clash = accounts.find((a) => a.emailKey === next.emailKey && a.id !== id)
  if (clash) throw new Error('Another profile already uses that email.')
  accounts[index] = next
  saveAccounts(accounts)
  setSession(next.id)
  return withAdminFlag(next)
}

export function applyAgentToListing<T extends { agent: Agent; website: string }>(listing: T, agent: Agent): T {
  return {
    ...listing,
    website: agent.website,
    agent: { ...agent },
  }
}
