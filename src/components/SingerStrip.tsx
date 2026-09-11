import { useRef } from 'react'
import type { Singer } from '../data/singers'

/**
 * Scrapbook carousel. Each singer is a die-cut sticker — the person's own
 * silhouette with a white paper edge, a strip of tape, and a handwritten
 * name — fanned out with the selected one straight and forward.
 *
 * Swipe or drag to move, tap a sticker to pick it, arrows and keys as well.
 * Selecting only arms the mic; nothing plays until you spin it.
 */

/* Stacked white drop-shadows around the alpha silhouette read as a cut paper
   border. Slightly uneven offsets keep it from looking machine-perfect. */
const STICKER_EDGE = [
  'drop-shadow(0 0 0 #fff)',
  'drop-shadow(2px 1px 0 #fff)',
  'drop-shadow(-2px 1px 0 #fff)',
  'drop-shadow(1px -2px 0 #fff)',
  'drop-shadow(-1px 2px 0 #fff)',
  'drop-shadow(2px -1px 0 #fff)',
  'drop-shadow(-2px -2px 0 #fff)',
  'drop-shadow(0 3px 0 #fff)',
  'drop-shadow(0 12px 14px rgba(0,0,0,.55))',
].join(' ')

const TILT = [-9, -4, 1, 5, 10]

export default function SingerStrip({
  singers,
  selected,
  onSelect,
  playing,
}: {
  singers: Singer[]
  selected: number
  onSelect: (i: number) => void
  playing: boolean
}) {
  const drag = useRef<{ x: number; done: boolean } | null>(null)
  const n = singers.length
  const step = (d: number) => onSelect((selected + d + n) % n)

  return (
    <div
      className="relative select-none"
      data-lenis-prevent
      style={{ touchAction: 'pan-y' }}
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, done: false }
      }}
      onPointerMove={(e) => {
        const d = drag.current
        if (!d || d.done) return
        const dx = e.clientX - d.x
        if (Math.abs(dx) > 48) {
          step(dx < 0 ? 1 : -1)
          d.done = true
        }
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') step(1)
        if (e.key === 'ArrowLeft') step(-1)
      }}
      role="listbox"
      aria-label="Pick a singer"
      tabIndex={0}
    >
      <div className="relative flex h-[15rem] items-end justify-center sm:h-[17rem]">
        {singers.map((s, i) => {
          // Position relative to the selected sticker, wrapping so the strip
          // always looks continuous.
          let rel = i - selected
          if (rel > n / 2) rel -= n
          if (rel < -n / 2) rel += n
          const isSel = rel === 0
          const tilt = TILT[(rel + 2 + 5) % 5]
          const x = rel * 118
          return (
            <button
              key={s.id}
              type="button"
              role="option"
              aria-selected={isSel}
              onClick={() => onSelect(i)}
              className="absolute bottom-6 origin-bottom transition-all duration-500 ease-[cubic-bezier(.2,.7,.2,1)]"
              style={{
                transform: `translateX(${x}px) rotate(${isSel ? 1 : tilt}deg) translateY(${isSel ? -22 : 0}px) scale(${isSel ? 1.14 : 0.86})`,
                zIndex: isSel ? 10 : 5 - Math.abs(rel),
                opacity: Math.abs(rel) > 2 ? 0 : isSel ? 1 : 0.72,
                pointerEvents: Math.abs(rel) > 2 ? 'none' : 'auto',
              }}
            >
              <span className="relative block">
                {/* Tape */}
                <span
                  aria-hidden="true"
                  className="absolute left-1/2 top-1 z-20 h-5 w-16 -translate-x-1/2 rotate-[-4deg] bg-amber-400/60"
                  style={{ boxShadow: 'inset 0 0 6px rgba(0,0,0,.15)' }}
                />
                <img
                  src={s.image}
                  alt={s.name}
                  draggable={false}
                  className={`block h-[11rem] w-auto max-w-[9rem] object-contain transition-[filter] duration-500 sm:h-[12.5rem] ${
                    isSel && playing ? 'saturate-125' : ''
                  }`}
                  style={{
                    filter: isSel
                      ? `${STICKER_EDGE} drop-shadow(0 0 0 #d48d46) drop-shadow(0 0 3px #d48d46)`
                      : STICKER_EDGE,
                  }}
                />
                <span
                  className="mt-2 block text-center text-[1.15rem] leading-none text-cream-50"
                  style={{ fontFamily: '"Caveat", "Instrument Serif", cursive', fontWeight: 600 }}
                >
                  {s.name}
                </span>
              </span>
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => step(-1)}
          aria-label="Previous singer"
          className="absolute left-0 top-1/2 -translate-y-1/2 px-2 py-4 text-2xl text-cream-50/40 hover:text-amber-400"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          aria-label="Next singer"
          className="absolute right-0 top-1/2 -translate-y-1/2 px-2 py-4 text-2xl text-cream-50/40 hover:text-amber-400"
        >
          ›
        </button>
      </div>

      <p
        aria-live="polite"
        className="mt-1 text-center font-sans text-[0.68rem] uppercase tracking-[0.2em] text-cream-400"
      >
        <span className="text-cream-50">{singers[selected].name}</span>
        {' · '}
        {singers[selected].role}
        {' — '}
        {playing ? 'playing' : 'spin the mic to hear'}
      </p>
    </div>
  )
}
