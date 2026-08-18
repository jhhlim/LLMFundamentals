import { useEffect, useRef, useState } from 'react'
import { BROCHURE_SECTIONS, type BrochureSectionId } from '../lib/sectionNav'
import { cn } from '../lib/utils'

export function SectionNav() {
  const [activeId, setActiveId] = useState<BrochureSectionId>('section-overview')
  const scrollRef = useRef<HTMLDivElement>(null)
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
      { rootMargin: '-20% 0px -35% 0px', threshold: [0, 0.15, 0.35, 0.55] },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const button = buttonRefs.current[activeId]
    const scroller = scrollRef.current
    if (!button || !scroller) return

    const scrollerRect = scroller.getBoundingClientRect()
    const buttonRect = button.getBoundingClientRect()
    const outOfViewLeft = buttonRect.left < scrollerRect.left + 8
    const outOfViewRight = buttonRect.right > scrollerRect.right - 8
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
      aria-label="Brochure sections"
      className="no-print pointer-events-none fixed inset-x-0 bottom-[4.85rem] z-50 flex justify-center px-3 sm:bottom-[5.15rem] sm:px-4"
    >
      <div className="pointer-events-auto flex w-full max-w-4xl items-center gap-2 rounded-full border border-stone-light/50 bg-paper/95 py-2 pl-3 pr-2 shadow-[0_16px_48px_-20px_rgba(11,31,51,0.55)] backdrop-blur-md transition-colors dark:border-white/15 dark:bg-[#0c1f33]/95 dark:shadow-[0_16px_48px_-20px_rgba(0,0,0,0.85)] sm:gap-3 sm:pl-4">
        <p className="hidden shrink-0 text-[9px] font-semibold uppercase tracking-[0.22em] text-stone sm:block dark:text-stone-light/70">
          Sections
        </p>
        <div
          ref={scrollRef}
          className="section-nav-scroll flex min-w-0 flex-1 gap-1.5 overflow-x-auto sm:gap-2"
        >
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
                  'shrink-0 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition duration-200 sm:px-3 sm:text-[11px] sm:tracking-[0.14em]',
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
