export function RapidApiDisclaimer({
  tone = 'light',
  className = '',
}: {
  tone?: 'light' | 'dark'
  className?: string
}) {
  const styles =
    tone === 'dark'
      ? 'border-white/10 bg-white/5 text-white/45'
      : 'border-stone-light/50 bg-warm/80 text-stone dark:border-white/10 dark:bg-white/5 dark:text-stone-light/60'

  return (
    <p className={`rounded-xl border px-4 py-3 text-xs leading-relaxed ${styles} ${className}`}>
      <span className="font-semibold uppercase tracking-[0.14em]">For agents importing listings</span>
      {' — '}
      Compass, Zillow, and Redfin imports use third-party RapidAPI products (separate subscriptions from
      RapidAPI.com). A free preview brochure is available without an API key; live imports require your own
      RapidAPI account and portal subscription.
    </p>
  )
}
