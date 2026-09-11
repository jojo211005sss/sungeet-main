import { useEffect, useMemo, useRef } from 'react'
import type { Singer } from '../data/singers'

/**
 * Artist cut-outs that drift slowly around the hero (a lazy VHS-bounce
 * wander). Tap one and it glides to a "stage" spot beside the mic, brightens
 * and grows; the others dull and, while a clip plays, sway gently along.
 *
 * One RAF loop lerps every card toward a target each frame, so drifting and
 * the travel-to-stage use the same mechanism and hand off smoothly.
 */

type Card = {
  el: HTMLButtonElement | null
  // Scatter home + wander params (fractions of the field).
  hx: number
  hy: number
  ampX: number
  ampY: number
  phase: number
  speed: number
  // Current interpolated transform.
  x: number
  y: number
  s: number
  init: boolean
}

// Homes frame the composition — top corners, sides, bottom — filling the
// edges around the central mic and the left headline.
const HOMES: [number, number][] = [
  [0.5, 0.13],
  [0.8, 0.17],
  [0.3, 0.84],
  [0.56, 0.87],
  [0.78, 0.83],
  [0.2, 0.16],
]

export default function ArtistField({
  singers,
  selected,
  onSelect,
  playing,
  reduced,
}: {
  singers: Singer[]
  selected: number
  onSelect: (i: number) => void
  playing: boolean
  reduced: boolean
}) {
  const fieldRef = useRef<HTMLDivElement>(null)
  const raf = useRef<number>(0)
  // Latest selection/playback read inside the loop without restarting it.
  const state = useRef({ selected, playing, reduced })
  useEffect(() => {
    state.current = { selected, playing, reduced }
  }, [selected, playing, reduced])

  // Stable per-singer objects; the RAF loop mutates el/x/y/s on these in place.
  const cards = useMemo<Card[]>(
    () =>
      singers.map((_, i) => {
        const [hx, hy] = HOMES[i % HOMES.length]
        return {
          el: null,
          hx,
          hy,
          ampX: 0.03 + (i % 3) * 0.012,
          ampY: 0.035 + (i % 2) * 0.015,
          phase: i * 1.7,
          speed: 0.12 + (i % 3) * 0.03,
          x: 0,
          y: 0,
          s: 0.7,
          init: false,
        }
      }),
    [singers],
  )

  useEffect(() => {
    const field = fieldRef.current
    if (!field) return
    let t0 = performance.now()

    const tick = (now: number) => {
      const t = (now - t0) / 1000
      const { width: W, height: H } = field.getBoundingClientRect()
      const { selected: sel, playing: play, reduced: red } = state.current

      // Stage spot: just left of centre, vertically middle-low.
      const dockX = W * 0.5 - Math.min(W, 640) * 0.18
      const dockY = H * 0.56

      cards.forEach((c, i) => {
        if (!c.el) return
        const isSel = i === sel

        let tx: number
        let ty: number
        let ts: number
        if (isSel) {
          tx = dockX
          ty = dockY
          ts = 1.25
        } else {
          const wob = red ? 0 : 1
          const sway = play && !red ? Math.sin(t * 3 + i) * 0.008 : 0
          tx = (c.hx + Math.sin(t * c.speed + c.phase) * c.ampX * wob) * W
          ty =
            (c.hy + Math.cos(t * c.speed * 0.8 + c.phase) * c.ampY * wob + sway) *
            H
          ts = 0.62
        }

        if (!c.init) {
          c.x = tx
          c.y = ty
          c.s = ts
          c.init = true
        } else {
          // Ease toward the target; faster when travelling to the dock.
          const k = isSel ? 0.12 : 0.06
          c.x += (tx - c.x) * k
          c.y += (ty - c.y) * k
          c.s += (ts - c.s) * k
        }

        const dull = !isSel && play
        c.el.style.transform = `translate(-50%, -50%) translate(${c.x}px, ${c.y}px) scale(${c.s})`
        c.el.style.opacity = isSel ? '1' : play ? '0.4' : '0.68'
        c.el.style.zIndex = isSel ? '30' : '10'
        c.el.style.filter = dull ? 'saturate(0.65) brightness(0.8)' : ''
      })

      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [cards])

  const STICKER = [
    'drop-shadow(1.5px 0 0 #fff)',
    'drop-shadow(-1.5px 0 0 #fff)',
    'drop-shadow(0 1.5px 0 #fff)',
    'drop-shadow(0 -1.5px 0 #fff)',
    'drop-shadow(1px 1px 0 #fff)',
    'drop-shadow(0 8px 12px rgba(0,0,0,.5))',
  ].join(' ')

  return (
    <div ref={fieldRef} className="pointer-events-none absolute inset-0 z-10">
      {singers.map((s, i) => {
        const isSel = i === selected
        return (
          <button
            key={s.id}
            type="button"
            ref={(el) => {
              cards[i].el = el
            }}
            onClick={() => onSelect(i)}
            aria-label={`${s.name}, ${s.role}${isSel ? ' (selected)' : ''}`}
            aria-pressed={isSel}
            className="pointer-events-auto absolute left-0 top-0 origin-center cursor-pointer"
          >
            <span className="relative block">
              <img
                src={s.image}
                alt=""
                draggable={false}
                className="block h-[8.5rem] w-auto max-w-[7rem] object-contain sm:h-[10rem]"
                style={{
                  filter: isSel
                    ? `${STICKER} drop-shadow(0 0 7px rgba(212,141,70,.6))`
                    : STICKER,
                }}
              />
              {isSel && (
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
                  <span
                    className="block text-[1.25rem] leading-none text-cream-50"
                    style={{ fontFamily: '"Caveat","Instrument Serif",cursive', fontWeight: 600 }}
                  >
                    {s.name}
                  </span>
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
