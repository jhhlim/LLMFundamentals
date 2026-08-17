import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import {
  inputFromAccount,
  updateAccount,
  type AgentAccount,
  type ProfileInput,
} from '../lib/agentAuth'
import { AgentProfileForm } from './AgentProfileForm'

export function AgentProfilePanel({
  account,
  open,
  onClose,
  onSaved,
}: {
  account: AgentAccount
  open: boolean
  onClose: () => void
  onSaved: (account: AgentAccount) => void
}) {
  const [draft, setDraft] = useState<ProfileInput>(() => inputFromAccount(account))
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setDraft(inputFromAccount(account))
      setStatus('')
    }
  }, [open, account])

  if (!open) return null

  async function handleSave() {
    setLoading(true)
    setStatus('')
    try {
      const next = await updateAccount(account.id, draft)
      onSaved(next)
      onClose()
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Could not save profile.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="no-print fixed inset-0 z-[70] flex items-end justify-center bg-ink/45 p-4 backdrop-blur-sm md:items-center">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[1.5rem] bg-paper p-5 shadow-2xl md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Agent profile</p>
            <h3 className="editorial-display mt-2 text-3xl text-ink">Your brochure branding</h3>
            <p className="mt-2 text-sm text-stone">
              Name, photo, license, and brokerage print on every listing you generate while signed in.
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full px-3 py-1 text-sm text-stone hover:bg-warm">
            Close
          </button>
        </div>

        <div className="mt-6">
          <AgentProfileForm
            value={draft}
            onChange={setDraft}
            showPassword
            passwordLabel="New password (optional)"
            passwordHint="Leave blank to keep your current password."
            tone="light"
          />
        </div>

        {status ? <p className="mt-4 text-sm text-red-700">{status}</p> : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            onClick={() => void handleSave()}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save profile
          </button>
          <button type="button" className="rounded-full px-4 py-2.5 text-sm text-stone hover:bg-warm" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
