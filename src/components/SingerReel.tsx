import { useRef } from 'react'
import type { Singer } from '../data/singers'

/**
 * A vertical reel of singer cut-outs on the right of the hero. The centred
 * card is selected — larger, in front, with its name; neighbours sit above and
 * below, smaller and faded, like frames scrolling past. Swipe/scroll up-down,
 * click a card, or arrow-key to change. Selecting only arms the mic.
 */

const ITEM_H = 132 // px between neighbouring cards

const STICKER_EDGE = [
  'drop-shadow(1.5px 0 0 #fff)',
  'drop-shadow(-1.5px 0 0 #fff)',
  'drop-shadow(0 1.5px 0 #fff)',
  'drop-shadow(0 -1.5px 0 #fff)',
  'drop-shadow(1px 1px 0 #fff)',
  'drop-shadow(0 8px 12px rgba(0,0,0,.5))',
].join(' ')

export default function SingerReel({
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
  const drag = useRef<{ y: number; done: boolean } | null>(null)
  const n = singers.length
  const step = (d: number) => onSelect((selected + d + n) % n)

  return (
    <div
      className="relative h-[24rem] w-full select-none overflow-hidden sm:h-[28rem]"
      data-lenis-prevent
      style={{ touchAction: 'pan-x' }}
      onPointerDown={(e) => (drag.current = { y: e.clientY, done: false })}
      onPointerMove={(e) => {
        const d = drag.current
        if (!d || d.done) return
        const dy = e.clientY - d.y
        if (Math.abs(dy) > 38) {
          step(dy > 0 ? -1 : 1) // drag down → previous rolls into view
          d.done = true
        }
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      onWheel={(e) => {
        if (Math.abs(e.deltaY) > 8) step(e.deltaY > 0 ? 1 : -1)
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') step(1)
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') step(-1)
      }}
      role="listbox"
      aria-label="Pick a singer"
      tabIndex={0}
    >
      {/* Top/bottom fade so cards dissolve rather than hard-clip. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-20 bg-gradient-to-b from-navy-950 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-20 bg-gradient-to-t from-navy-950 to-transparent"
      />

      {singers.map((s, i) => {
        let rel = i - selected
        if (rel > n / 2) rel -= n
        if (rel < -n / 2) rel += n
        const isSel = rel === 0
        const hidden = Math.abs(rel) > 2
        return (
          <button
            key={s.id}
            type="button"
            role="option"
            aria-selected={isSel}
            onClick={() => onSelect(i)}
            className="absolute left-1/2 top-1/2 origin-center transition-all duration-[450ms] ease-[cubic-bezier(.2,.7,.2,1)]"
            style={{
              transform: `translate(-50%, -50%) translateY(${rel * ITEM_H}px) scale(${isSel ? 1 : 0.6})`,
              zIndex: isSel ? 10 : 5 - Math.abs(rel),
              opacity: hidden ? 0 : isSel ? 1 : 0.45,
              pointerEvents: hidden ? 'none' : 'auto',
            }}
          >
            <span className="relative block">
              <img
                src={s.image}
                alt={s.name}
                draggable={false}
                className="block h-[11rem] w-auto max-w-[9rem] object-contain sm:h-[13rem]"
                style={{
                  filter: isSel
                    ? `${STICKER_EDGE} drop-shadow(0 0 6px rgba(212,141,70,.5))`
                    : STICKER_EDGE,
                }}
              />
              {isSel && (
                <span className="mt-1 flex flex-col items-center">
                  <span
                    className="text-[1.3rem] leading-none text-cream-50"
                    style={{ fontFamily: '"Caveat","Instrument Serif",cursive', fontWeight: 600 }}
                  >
                    {s.name}
                  </span>
                  <span className="mt-1 font-sans text-[0.62rem] uppercase tracking-[0.2em] text-amber-400">
                    {s.role}
                  </span>
                </span>
              )}
            </span>
          </button>
        )
      })}

      <p aria-live="polite" className="sr-only">
        {singers[selected].name}, {singers[selected].role}.{' '}
        {playing ? 'Playing.' : 'Spin the mic to hear.'}
      </p>
    </div>
  )
}
