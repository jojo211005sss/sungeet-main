import { useEffect, useMemo, useRef } from 'react'
import type { Singer } from '../data/singers'

/**
 * Artist cut-outs drift slowly around the hero (a lazy VHS-bounce wander).
 * Click one and they start singing: they stop drifting, brighten and grow,
 * musical notes float up around them, and their clip plays. Everyone else
 * dulls and sways along. Click another to switch.
 *
 * One RAF loop lerps every card toward a per-frame target, so drifting and
 * the settle-in-place hand off smoothly.
 */

type Card = {
  el: HTMLButtonElement | null
  hx: number
  hy: number
  ampX: number
  ampY: number
  phase: number
  speed: number
  x: number
  y: number
  s: number
  init: boolean
}

// A loose ring around the centred brand. The middle of the frame (roughly
// x 0.3-0.7, y 0.3-0.7) belongs to the headline, so nothing homes there and
// the drift amplitude is small enough not to wander across it.
const HOMES: [number, number][] = [
  [0.16, 0.24],
  [0.84, 0.22],
  [0.09, 0.62],
  [0.91, 0.6],
  [0.28, 0.85],
  [0.72, 0.86],
  [0.5, 0.12],
  [0.5, 0.9],
]

const STICKER = [
  'drop-shadow(1.5px 0 0 #fff)',
  'drop-shadow(-1.5px 0 0 #fff)',
  'drop-shadow(0 1.5px 0 #fff)',
  'drop-shadow(0 -1.5px 0 #fff)',
  'drop-shadow(1px 1px 0 #fff)',
  'drop-shadow(0 8px 12px rgba(0,0,0,.5))',
].join(' ')

const NOTES = ['♪', '♫', '♩', '♬', '♪']

export default function ArtistField({
  singers,
  selected,
  playing,
  reduced,
  onPick,
}: {
  singers: Singer[]
  selected: number
  playing: boolean
  reduced: boolean
  /** Click a card: select it and start its clip (a real user gesture). */
  onPick: (i: number) => void
}) {
  const fieldRef = useRef<HTMLDivElement>(null)
  const raf = useRef<number>(0)
  const state = useRef({ selected, playing, reduced })
  useEffect(() => {
    state.current = { selected, playing, reduced }
  }, [selected, playing, reduced])

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
          s: 0.72,
          init: false,
        }
      }),
    [singers],
  )

  useEffect(() => {
    const field = fieldRef.current
    if (!field) return
    const t0 = performance.now()

    const tick = (now: number) => {
      const t = (now - t0) / 1000
      const { width: W, height: H } = field.getBoundingClientRect()
      const { selected: sel, playing: play, reduced: red } = state.current

      cards.forEach((c, i) => {
        if (!c.el) return
        const singing = i === sel && play

        let tx: number
        let ty: number
        let ts: number
        if (singing) {
          // Settle at home and bob gently, as if into the song.
          const bob = red ? 0 : Math.sin(t * 2.4 + i) * 0.006
          tx = c.hx * W
          ty = (c.hy + bob) * H
          ts = 1.32
        } else {
          const wob = red ? 0 : 1
          const sway = play && !red ? Math.sin(t * 3 + i) * 0.007 : 0
          tx = (c.hx + Math.sin(t * c.speed + c.phase) * c.ampX * wob) * W
          ty = (c.hy + Math.cos(t * c.speed * 0.8 + c.phase) * c.ampY * wob + sway) * H
          ts = 0.72
        }

        if (!c.init) {
          c.x = tx
          c.y = ty
          c.s = ts
          c.init = true
        } else {
          const k = singing ? 0.12 : 0.06
          c.x += (tx - c.x) * k
          c.y += (ty - c.y) * k
          c.s += (ts - c.s) * k
        }

        const dull = !singing && play
        c.el.style.transform = `translate(-50%, -50%) translate(${c.x}px, ${c.y}px) scale(${c.s})`
        c.el.style.opacity = singing ? '1' : play ? '0.4' : '0.72'
        c.el.style.zIndex = singing ? '30' : '10'
        c.el.style.filter = dull ? 'saturate(0.6) brightness(0.8)' : ''
      })

      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [cards])

  return (
    <div ref={fieldRef} className="pointer-events-none absolute inset-0 z-10">
      {singers.map((s, i) => {
        const singing = i === selected && playing
        return (
          <button
            key={s.id}
            type="button"
            ref={(el) => {
              cards[i].el = el
            }}
            onClick={() => onPick(i)}
            aria-label={`${s.name}, ${s.role}${singing ? ' — singing' : ' — tap to play'}`}
            aria-pressed={singing}
            className="pointer-events-auto absolute left-0 top-0 origin-center cursor-pointer"
          >
            <span className="relative block">
              {/* notes rising around the singer */}
              {singing &&
                !reduced &&
                NOTES.map((n, k) => (
                  <span
                    key={k}
                    aria-hidden="true"
                    className="note-rise absolute text-amber-300"
                    style={{
                      left: `${12 + k * 20}%`,
                      top: '4%',
                      fontSize: `${1 + (k % 2) * 0.35}rem`,
                      animationDelay: `${k * 0.42}s`,
                      textShadow: '0 0 10px rgba(212,141,70,.7)',
                    }}
                  >
                    {n}
                  </span>
                ))}
              <img
                src={s.image}
                alt=""
                draggable={false}
                className="block h-[9.5rem] w-auto max-w-[7.5rem] object-contain sm:h-[11.5rem]"
                style={{
                  filter: singing
                    ? `${STICKER} drop-shadow(0 0 9px rgba(212,141,70,.65))`
                    : STICKER,
                }}
              />
              {singing && (
                <span
                  className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[1.3rem] leading-none text-cream-50"
                  style={{ fontFamily: '"Caveat","Instrument Serif",cursive', fontWeight: 600 }}
                >
                  {s.name}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
