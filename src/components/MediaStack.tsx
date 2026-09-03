import { useRef, useState } from 'react'
import { useReducedMotion } from '../lib/useMediaQuery'

export type MediaItem = {
  kind: 'video' | 'photo'
  /** Null until real media is supplied — renders the placeholder face. */
  src: string | null
  /** Poster frame for a video. Matters more than the clip for perceived speed. */
  poster?: string | null
  label: string
}

/**
 * A stack of media you flip through like pages in a notebook.
 *
 * Cards sit slightly offset and rotated so the next one peeks out behind the
 * top one. Tapping, dragging left, or the arrow keys turns the top card away
 * around its left edge and the next comes forward.
 *
 * The outgoing card is rendered in its own slot with a one-shot animation
 * instead of transitioning the stack, because a looping stack would otherwise
 * animate the turned card backwards as it re-enters at the rear.
 */
export default function MediaStack({
  items,
  monogram,
  accent = '#d48d46',
}: {
  items: MediaItem[]
  monogram: string
  accent?: string
}) {
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  const dragStart = useRef<number | null>(null)
  const nextKey = useRef(0)

  /**
   * Cards currently turning away. A list rather than a single slot, so tapping
   * quickly never drops a tap — each turn spawns its own animating node that
   * cleans itself up. Gating on "one at a time" made fast taps feel broken.
   */
  const [turning, setTurning] = useState<{ key: number; item: number }[]>([])

  const count = items.length

  const turn = () => {
    if (count < 2) return
    const key = nextKey.current++
    setTurning((list) => [...list, { key, item: index }])
    setIndex((i) => (i + 1) % count)

    // Safety net: if an animationend is ever missed (reused node, throttled
    // tab, browser quirk) the card would linger over the stack forever.
    window.setTimeout(
      () => setTurning((list) => list.filter((c) => c.key !== key)),
      reduced ? 260 : 760,
    )
  }

  // Depth 0 is the card you're looking at; 1 and 2 peek out behind it.
  const depths = [0, 1, 2].slice(0, Math.min(3, count))

  const onPointerDown = (e: React.PointerEvent) => {
    dragStart.current = e.clientX
  }

  const onPointerUp = (e: React.PointerEvent) => {
    const start = dragStart.current
    dragStart.current = null
    if (start === null) return
    // A left drag turns the page; so does a tap (a tiny delta).
    if (start - e.clientX > 40 || Math.abs(start - e.clientX) < 6) turn()
  }

  // A real tap fires pointerup *and* click, which would turn two pages. Pointer
  // input is handled above, so only act here on a click with no pointer behind
  // it — keyboard activation and programmatic clicks report detail 0.
  const onClick = (e: React.MouseEvent) => {
    if (e.detail === 0) turn()
  }

  const current = items[index]

  return (
    <div className="relative select-none" style={{ perspective: '1400px' }}>
      <div className="relative aspect-[4/5]">
        {/* Behind-cards first so the top card paints last. */}
        {[...depths].reverse().map((d) => {
          const itemIndex = (index + d) % count
          const item = items[itemIndex]
          const isTop = d === 0
          return (
            <div
              key={itemIndex}
              aria-hidden={!isTop}
              className="absolute inset-0 overflow-hidden transition-transform duration-500 ease-out"
              style={{
                zIndex: 10 - d,
                transform: reduced
                  ? undefined
                  : `translate(${d * 9}px, ${d * -9}px) rotate(${d * 1.4}deg) scale(${1 - d * 0.02})`,
                boxShadow: d === 0 ? '0 18px 40px -18px rgba(0,0,0,0.75)' : undefined,
              }}
            >
              <MediaFace item={item} monogram={monogram} accent={accent} dimmed={!isTop} />
            </div>
          )
        })}

        {/* Cards being turned away — usually one, more if you tap fast. */}
        {turning.map((card) => (
          <div
            key={card.key}
            className="u-page-turn pointer-events-none absolute inset-0 overflow-hidden"
            style={{ zIndex: 20 + card.key }}
            onAnimationEnd={() =>
              setTurning((list) => list.filter((c) => c.key !== card.key))
            }
          >
            <MediaFace
              item={items[card.item]}
              monogram={monogram}
              accent={accent}
              dimmed={false}
            />
            {/* Shading along the fold, so the turn reads as paper. */}
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 35%)',
              }}
            />
          </div>
        ))}

        {/* One control covering the stack: tap, drag, or keyboard. */}
        <button
          type="button"
          onClick={onClick}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
              e.preventDefault()
              turn()
            }
          }}
          className="absolute inset-0 z-30 cursor-pointer"
          style={{ touchAction: 'pan-y' }}
          aria-label={`${current.label} — ${index + 1} of ${count}. Turn to the next.`}
        />
      </div>

      {/* Position markers, doubling as the "there is more here" hint. */}
      <div className="mt-3 flex items-center gap-2">
        {items.map((_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`h-0.5 transition-all duration-300 ${
              i === index ? 'w-6' : 'w-2.5'
            }`}
            style={{ background: i === index ? accent : 'rgba(247,244,239,0.25)' }}
          />
        ))}
        <span className="ml-auto font-sans text-[0.66rem] uppercase tracking-[0.18em] text-cream-400/70">
          {current.kind === 'video' ? 'Showreel' : `Photo ${index}`}
          {' · '}
          {current.src ? 'tap to turn' : 'pending'}
        </span>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- face ---- */

function MediaFace({
  item,
  monogram,
  accent,
  dimmed,
}: {
  item: MediaItem
  monogram: string
  accent: string
  dimmed: boolean
}) {
  if (item.src && item.kind === 'photo') {
    return (
      <>
        <img
          src={item.src}
          alt={item.label}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
        {dimmed && <div aria-hidden="true" className="absolute inset-0 bg-navy-950/55" />}
      </>
    )
  }

  if (item.src && item.kind === 'video') {
    return (
      <>
        <video
          src={item.src}
          poster={item.poster ?? undefined}
          muted
          loop
          playsInline
          autoPlay
          className="h-full w-full object-cover"
        />
        {dimmed && <div aria-hidden="true" className="absolute inset-0 bg-navy-950/55" />}
      </>
    )
  }

  // Placeholder face. Says what belongs here rather than faking artwork.
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center bg-navy-900">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #f7f4ef 0 1px, transparent 1px 11px)',
        }}
      />

      {item.kind === 'video' ? (
        <span
          aria-hidden="true"
          className="flex h-16 w-16 items-center justify-center rounded-full border"
          style={{ borderColor: accent, color: accent }}
        >
          <span className="ml-1 text-lg">▶</span>
        </span>
      ) : (
        <span
          aria-hidden="true"
          className="font-display text-[3.6rem] leading-none text-cream-50/85"
        >
          {monogram}
        </span>
      )}

      <span className="relative mt-5 font-sans text-[0.66rem] uppercase tracking-[0.2em] text-cream-50/40">
        {item.label}
      </span>

      {dimmed && <div aria-hidden="true" className="absolute inset-0 bg-navy-950/55" />}
    </div>
  )
}
