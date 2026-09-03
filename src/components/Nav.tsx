import { useEffect, useState } from 'react'

/**
 * The page alternates navy and cream sections, so a fixed nav in one colour
 * will always disappear against one of them. This watches which section is
 * currently under the bar and flips the nav to match.
 */
function useSectionUnderNav() {
  const [onLight, setOnLight] = useState(false)

  useEffect(() => {
    const targets = document.querySelectorAll('[data-nav="light"]')
    if (!targets.length) return

    // Collapse the root to a line at the very top of the viewport: an element
    // "intersects" it only while it sits under the bar.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => setOnLight(e.isIntersecting))
      },
      { rootMargin: '0px 0px -100% 0px', threshold: 0 },
    )

    targets.forEach((t) => io.observe(t))
    return () => io.disconnect()
  }, [])

  return onLight
}

export default function Nav() {
  const onLight = useSectionUnderNav()

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <a
        href="#shows"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-cream-50 focus:px-4 focus:py-2 focus:font-sans focus:text-sm focus:text-navy-950"
      >
        Skip to upcoming shows
      </a>

      {/* Scrim so the bar stays readable over bright photography. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 h-24 transition-opacity duration-300 ${
          onLight ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          background:
            'linear-gradient(to bottom, rgba(5,12,25,0.8) 0%, rgba(5,12,25,0.35) 55%, transparent 100%)',
        }}
      />

      <nav
        aria-label="Primary"
        className={`relative mx-auto flex max-w-6xl items-center justify-between px-6 py-4 transition-colors duration-300 sm:px-10 ${
          onLight ? 'text-navy-900' : 'text-cream-50'
        }`}
      >
        <a href="#top" className="flex items-center gap-3">
          <img
            src="/brand/sunggeet-mark.png"
            alt="Sung Sungeet"
            width={44}
            height={44}
            className={`h-11 w-11 rounded-full transition-shadow ${
              onLight ? 'ring-1 ring-navy-900/15' : 'ring-1 ring-cream-50/15'
            }`}
          />
          <span className="hidden font-display text-[1.3rem] sm:block">
            Sung Sungeet
          </span>
        </a>

        <ul className="flex items-baseline gap-4 font-sans text-[0.8rem] sm:gap-6 sm:text-[0.85rem]">
          <li>
            <a href="#walkthrough" className="hover:text-amber-400">
              A night
            </a>
          </li>
          <li>
            <a href="#shows" className="hover:text-amber-400">
              Dates
            </a>
          </li>
          <li className="hidden sm:block">
            <a href="#teams" className="hover:text-amber-400">
              Teams
            </a>
          </li>
          <li>
            <a href="#book" className="hover:text-amber-400">
              Book us
            </a>
          </li>
          <li className="hidden sm:block">
            <a href="#community" className="hover:text-amber-400">
              Community
            </a>
          </li>
          <li>
            <a href="#join" className="hover:text-amber-400">
              Join us
            </a>
          </li>
        </ul>
      </nav>
    </header>
  )
}
