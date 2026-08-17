import { useEffect, useRef, useState } from 'react'
import { BROCHURE_SECTIONS, type BrochureSectionId } from '../lib/sectionNav'
import { cn } from '../lib/utils'

export function SectionNav() {
  const [activeId, setActiveId] = useState<BrochureSectionId>('section-overview')
  const navRef = useRef<HTMLElement>(null)
  const buttonRefs = useRef<Partial<Record<BrochureSectionId, HTMLButtonElement>>>({})

  useEffect(() => {
    const sections = BROCHURE_SECTIONS.map(({ id }) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    )
    if (!sections.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id as BrochureSectionId)
        }
      },
      { rootMargin: '-8rem 0px -55% 0px', threshold: [0, 0.15, 0.35, 0.55] },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const button = buttonRefs.current[activeId]
    const nav = navRef.current
    if (!button || !nav) return

    const navRect = nav.getBoundingClientRect()
    const buttonRect = button.getBoundingClientRect()
    const outOfViewLeft = buttonRect.left < navRect.left + 12
    const outOfViewRight = buttonRect.right > navRect.right - 12
    if (outOfViewLeft || outOfViewRight) {
      button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [activeId])

  function scrollToSection(id: BrochureSectionId) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveId(id)
  }

  return (
    <nav
      ref={navRef}
      aria-label="Brochure sections"
      className="border-b border-stone-light/40 bg-paper/95 backdrop-blur transition-colors dark:border-white/10 dark:bg-[#071421]/95"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 md:px-6">
        <p className="hidden shrink-0 text-[10px] font-semibold uppercase tracking-[0.24em] text-stone md:block dark:text-stone-light/70">
          Jump to
        </p>
        <div className="section-nav-scroll flex min-w-0 flex-1 gap-2 overflow-x-auto pb-0.5">
          {BROCHURE_SECTIONS.map(({ id, label }) => {
            const active = activeId === id
            return (
              <button
                key={id}
                ref={(el) => {
                  if (el) buttonRefs.current[id] = el
                }}
                type="button"
                onClick={() => scrollToSection(id)}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'shrink-0 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition duration-200',
                  active
                    ? 'border-accent bg-accent text-white shadow-sm'
                    : 'border-stone-light/60 bg-white/70 text-ink/75 hover:border-accent/40 hover:text-accent dark:border-white/15 dark:bg-white/5 dark:text-white/75 dark:hover:border-accent/50 dark:hover:text-gold-soft',
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
