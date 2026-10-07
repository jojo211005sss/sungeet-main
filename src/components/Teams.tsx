import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { monogram, type Team } from '../data/teams'
import MediaStack from './MediaStack'
import { ARTIST_CLIPS } from '../data/artists'

type Props = {
  teams: Team[]
  activeSlug: string | 'all'
  onPickTeam: (slug: string) => void
  onBookTeam: (slug: string) => void
}

/*
 * Every lineup is a record. The showreel is the cover, the vinyl sits half
 * out of the sleeve, and tapping it drops the tonearm: the record spins and
 * the showreel's sound comes on. One record plays at a time. The tagline is
 * the hype sticker on the shrink-wrap; the people are the personnel credits.
 */

const HAND = 'font-hand font-semibold'

/**
 * The tonearm, drawn in the vinyl's own coordinates (0–100 across the disc)
 * so it lines up at any size. Pivots just off the top-right of the record;
 * dropping it is one rotation about that pivot.
 */
function Tonearm({ down }: { down: boolean }) {
  // Several records on the page, so gradient ids must be unique per arm.
  const id = useId().replace(/:/g, '')
  const metal = `metal-${id}`
  const weight = `weight-${id}`

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      overflow="visible"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient id={metal} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#8b93a3" />
          <stop offset="0.45" stopColor="#f4f1ea" />
          <stop offset="0.6" stopColor="#c9c6bf" />
          <stop offset="1" stopColor="#6e7585" />
        </linearGradient>
        <linearGradient id={weight} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#3a3f4a" />
          <stop offset="0.5" stopColor="#9aa1ad" />
          <stop offset="1" stopColor="#2b2f38" />
        </linearGradient>
      </defs>

      {/* Base plate the arm is mounted on, and the rest post it lifts back onto. */}
      <rect x="95" y="-8" width="18" height="20" rx="3" fill="#0e2244" stroke="rgba(247,244,239,0.12)" strokeWidth="0.5" />
      <rect x="107.2" y="70" width="2.6" height="10" rx="1.2" fill="#2b2f38" />
      <rect x="106.2" y="69" width="4.6" height="2.2" rx="1" fill={`url(#${metal})`} />

      {/* Everything that swings. */}
      <g
        className="transition-transform duration-700 ease-[cubic-bezier(.3,1.4,.5,1)] motion-reduce:transition-none"
        style={{ transformOrigin: '104px 2px', transformBox: 'view-box', rotate: down ? '21deg' : '0deg' }}
      >
        {/* Ridged counterweight behind the pivot. */}
        <rect x="100" y="-17" width="8" height="11" rx="1.6" fill={`url(#${weight})`} />
        {[-14.5, -12, -9.5].map((y) => (
          <line key={y} x1="100.4" x2="107.6" y1={y} y2={y} stroke="rgba(0,0,0,0.35)" strokeWidth="0.4" />
        ))}

        {/* Shadow on the platter, then the arm itself: an S-curve tube with a highlight. */}
        <path
          d="M106 4 C 105 30, 112 50, 108 64 C 105.5 72, 106.5 76, 104.5 81"
          fill="none"
          stroke="rgba(0,0,0,0.45)"
          strokeWidth="2.4"
          strokeLinecap="round"
          style={{ filter: 'blur(1.2px)' }}
        />
        <path
          d="M104 2 C 103 30, 110 50, 106 64 C 103.5 72, 104.5 76, 102.5 80"
          fill="none"
          stroke={`url(#${metal})`}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M103.6 6 C 102.8 30, 109.4 50, 105.5 63"
          fill="none"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="0.45"
          strokeLinecap="round"
        />

        {/* Headshell: finger lift, shell, cartridge, needle. */}
        <g transform="rotate(30 102 82)">
          <path d="M105.5 79 l 5 -2.5" stroke={`url(#${metal})`} strokeWidth="1" strokeLinecap="round" />
          <rect x="98.2" y="78" width="7.6" height="9.5" rx="1.2" fill={`url(#${metal})`} />
          <rect x="99.3" y="84.5" width="5.4" height="4.2" rx="0.6" fill="#141418" />
          <rect x="101.4" y="88.4" width="1.2" height="2.4" fill="var(--color-amber-400)" />
        </g>

        {/* Pivot bearing on top. */}
        <circle cx="104" cy="2" r="6.2" fill={`url(#${metal})`} />
        <circle cx="104" cy="2" r="3.6" fill="#141418" />
        <circle cx="104" cy="2" r="1.4" fill="var(--color-amber-400)" />
      </g>
    </svg>
  )
}

function Record({
  team,
  flip,
  active,
  playing,
  onToggle,
}: {
  team: Team
  flip: boolean
  active: boolean
  playing: boolean
  onToggle: () => void
}) {
  const sleeveRef = useRef<HTMLDivElement>(null)
  const hasReel = team.media.some((m) => m.kind === 'video' && m.src)

  // The cover video loops silently; dropping the needle turns its sound on.
  useEffect(() => {
    const v =
      sleeveRef.current?.querySelector<HTMLVideoElement>('[aria-hidden="false"] video') ??
      sleeveRef.current?.querySelector<HTMLVideoElement>('video')
    if (!v) return
    if (playing) {
      v.currentTime = 0
      v.muted = false
      void v.play().catch(() => onToggle())
    } else {
      v.muted = true
    }
  }, [playing, onToggle])

  const disc = `absolute top-[4%] aspect-square w-[74%] ${flip ? 'left-[2%]' : 'right-[2%]'}`

  return (
    // Room on one side for the vinyl to stick out of the sleeve.
    <div className={`relative ${flip ? 'pl-[22%]' : 'pr-[22%]'}`}>
      {/* The vinyl, behind the sleeve. */}
      <span aria-hidden="true" className={`${disc} rounded-full`}>
        <span
          className={`u-vinyl u-spin absolute inset-0 ${playing ? 'is-playing' : ''}`}
        >
          <span className="absolute inset-[33%] flex items-center justify-center rounded-full bg-amber-400 text-navy-950">
            <span className="font-display text-[clamp(1rem,2.4vw,1.6rem)] leading-none">{monogram(team.name)}</span>
            <span className="absolute h-[9%] w-[9%] rounded-full bg-navy-950" />
          </span>
        </span>
      </span>

      {hasReel && (
        <div className={`${disc} pointer-events-none z-[15] ${flip ? '-scale-x-100' : ''}`}>
          <Tonearm down={playing} />
        </div>
      )}

      {/* The sleeve. The showreel is the cover art. */}
      <div
        ref={sleeveRef}
        className={`relative z-10 bg-navy-900 p-2.5 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.95)] ${
          active ? 'outline-2 outline-offset-4 outline-amber-400' : ''
        }`}
      >
        <MediaStack items={team.media} monogram={monogram(team.name)} aspect="aspect-square" />
      </div>

      {/* Hype sticker on the shrink-wrap. */}
      {team.tagline && (
        <p
          className={`absolute -top-5 z-20 flex h-24 w-24 items-center justify-center rounded-full bg-amber-400 p-3 text-center font-sans text-[0.72rem] font-semibold leading-tight text-navy-950 shadow-[0_10px_20px_-8px_rgba(0,0,0,0.8)] sm:h-32 sm:w-32 sm:text-[0.85rem] ${
            flip ? '-right-3 rotate-12' : '-left-4 -rotate-12'
          }`}
        >
          {team.tagline}
        </p>
      )}

      {/* Tap anywhere on the record — cover or vinyl — to drop or lift the needle. */}
      {hasReel && (
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={playing}
          aria-label={playing ? `Stop ${team.name}` : `Play ${team.name} with sound`}
          className="absolute inset-0 z-30 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400"
        />
      )}

      {hasReel && (
        <p
          aria-hidden="true"
          className={`${HAND} absolute -bottom-10 whitespace-nowrap text-[1.35rem] transition-colors ${
            playing ? 'text-amber-400' : 'text-cream-400'
          } ${flip ? 'left-0' : 'right-0'}`}
        >
          {playing ? 'Now playing, tap to stop' : 'Tap the record to play'}
        </p>
      )}
    </div>
  )
}

const PASS_TILT = ['-2.5deg', '1.5deg', '-1deg', '2.5deg']
/** How hard each pass reacts to scroll, so they don't swing in lockstep. */
const PASS_SWING = [1, 0.75, 1.2, 0.9]

/**
 * Touch screens have no hover, so the passes answer the scroll instead: the
 * scroll speed kicks a spring, and the spring drives --swing on the list.
 * Damped, so a flick swings them and they settle with a little overshoot.
 */
export function useScrollSwing(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!matchMedia('(hover: none)').matches) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let angle = 0
    let velocity = 0
    let lastY = scrollY
    let frame = 0

    const tick = () => {
      velocity += -0.08 * angle // spring back to hanging straight
      velocity *= 0.9 // air resistance
      angle = Math.max(-10, Math.min(10, angle + velocity))
      el.style.setProperty('--swing', `${angle.toFixed(2)}deg`)
      frame = Math.abs(angle) > 0.05 || Math.abs(velocity) > 0.05 ? requestAnimationFrame(tick) : 0
      if (!frame) el.style.setProperty('--swing', '0deg')
    }

    const onScroll = () => {
      const dy = scrollY - lastY
      lastY = scrollY
      // Scrolling down drags the page up under the passes, so they lag the other way.
      velocity += Math.max(-2, Math.min(2, dy * 0.035))
      if (!frame) frame = requestAnimationFrame(tick)
    }

    addEventListener('scroll', onScroll, { passive: true })
    return () => {
      removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [ref])
}

export type PassMedia = { kind: 'video' | 'audio'; src: string }

/** Only one badge sings at a time: flipping one tells the rest to stop. */
const SING_EVENT = 'sg:pass-sing'

const condensed = { fontStretch: '62%' } as const

/**
 * An artist laminate on a lanyard, laid out like the company's own badges:
 * black card, the round mark up top, big tight type at the bottom. Sized in
 * container units (cqw) so it scales from a phone row to a desktop grid.
 *
 * If the artist has a clip, the badge flips like a card — swipe it sideways or
 * tap it — and the back plays them singing, with sound.
 */
export function ArtistPass({
  m,
  n,
  selected = false,
  media = null,
}: {
  m: { name: string; role: string; photoUrl?: string | null }
  n: number
  /** On the viewer's booking list: amber ring and a stamp. */
  selected?: boolean
  media?: PassMedia | null
}) {
  const card = useRef<HTMLDivElement>(null)
  const player = useRef<HTMLVideoElement & HTMLAudioElement>(null)
  const id = useId()
  const [flipped, setFlipped] = useState(false)
  const [drag, setDrag] = useState<number | null>(null)
  const start = useRef<number | null>(null)

  // Another badge started singing: stop this one.
  useEffect(() => {
    const onSing = (e: Event) => {
      if ((e as CustomEvent<string>).detail === id) return
      setFlipped(false)
      player.current?.pause()
    }
    addEventListener(SING_EVENT, onSing)
    return () => removeEventListener(SING_EVENT, onSing)
  }, [id])

  // Called straight from the gesture, which is what lets sound start on phones.
  const setSinging = (on: boolean) => {
    setFlipped(on)
    const p = player.current
    if (!p) return
    if (on) {
      dispatchEvent(new CustomEvent(SING_EVENT, { detail: id }))
      p.currentTime = 0
      p.muted = false
      void p.play().catch(() => setFlipped(false))
    } else {
      p.pause()
    }
  }

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = card.current
    if (el) {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
      el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
    }
    if (start.current !== null) setDrag(e.clientX - start.current)
  }

  const onUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (start.current === null) return
    const dx = e.clientX - start.current
    start.current = null
    setDrag(null)
    // A real swipe, or a tap (barely moved), turns the card over.
    if (Math.abs(dx) > 45 || Math.abs(dx) < 6) setSinging(!flipped)
  }

  const angle = (flipped ? 180 : 0) + (drag === null ? 0 : Math.max(-120, Math.min(120, drag * 0.9)))

  return (
    <div
      className="u-pass-sway group/pass relative flex flex-col items-center [container-type:inline-size]"
      style={{
        rotate: `calc(${PASS_TILT[n % PASS_TILT.length]} + var(--swing, 0deg) * ${PASS_SWING[n % PASS_SWING.length]})`,
      }}
    >
      {/* Lanyard: black woven strap with the name running down it. */}
      <div
        aria-hidden="true"
        className="flex h-12 w-[16cqw] items-start justify-center overflow-hidden bg-[#111216] pt-1 sm:h-16"
        style={{ boxShadow: 'inset 2px 0 0 #2a2c33, inset -2px 0 0 #2a2c33' }}
      >
        <span className="whitespace-nowrap font-sans text-[6.5cqw] font-semibold tracking-[0.2em] text-cream-50/75 [writing-mode:vertical-rl]">
          SUNG SUNGEET ✦ SUNG
        </span>
      </div>
      {/* Split ring, like the one on the real badge. */}
      <div aria-hidden="true" className="-mt-px h-[8cqw] w-[8cqw] rounded-full border-[1.6cqw] border-cream-200/90" />

      <div className="relative -mt-[2.5cqw] w-full" style={{ perspective: '900px' }}>
        <div
          ref={card}
          onPointerMove={onMove}
          onPointerDown={(e) => {
            if (!media) return
            start.current = e.clientX
            e.currentTarget.setPointerCapture(e.pointerId)
          }}
          onPointerUp={onUp}
          onPointerCancel={() => {
            start.current = null
            setDrag(null)
          }}
          className={`relative w-full [transform-style:preserve-3d] ${drag === null ? 'transition-transform duration-500 ease-out' : ''} ${
            media ? 'cursor-grab active:cursor-grabbing' : ''
          }`}
          style={{ transform: `rotateY(${angle}deg)`, touchAction: media ? 'pan-y' : undefined }}
        >
          {/* ---------- front ---------- */}
          <div
            className={`relative overflow-hidden rounded-[6cqw] bg-[#0c0d10] shadow-[0_24px_40px_-18px_rgba(0,0,0,0.95)] [backface-visibility:hidden] ${
              selected ? 'ring-[1.2cqw] ring-amber-400' : 'ring-1 ring-cream-50/15'
            }`}
          >
            {/* Slot punched for the ring. */}
            <div aria-hidden="true" className="absolute left-1/2 top-[3cqw] z-20 h-[4cqw] w-[22cqw] -translate-x-1/2 rounded-full bg-navy-950" />

            <div className="flex justify-center pb-[4cqw] pt-[10cqw]">
              <img src="/brand/sunggeet-mark.png" alt="" className="h-[22cqw] w-[22cqw] rounded-full ring-1 ring-cream-50/20" />
            </div>

            <div className="relative mx-[6cqw] overflow-hidden rounded-[3cqw]">
              {m.photoUrl ? (
                <img
                  src={m.photoUrl}
                  alt={m.name}
                  loading="lazy"
                  decoding="async"
                  className={`aspect-[4/5] w-full object-cover object-top transition-[filter] duration-500 ${
                    selected ? 'grayscale-0' : 'grayscale group-hover/pass:grayscale-0'
                  }`}
                />
              ) : (
                // No photo yet: an initial on a hatched ground, like an unprinted pass.
                <div className="relative flex aspect-[4/5] w-full items-center justify-center bg-navy-800">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-[0.07]"
                    style={{ backgroundImage: 'repeating-linear-gradient(45deg, #f7f4ef 0 1px, transparent 1px 9px)' }}
                  />
                  <span className="relative font-display text-[34cqw] leading-none text-cream-50/80">{m.name.slice(0, 1)}</span>
                </div>
              )}
              {selected && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-[4cqw] left-[4cqw] -rotate-[8deg] border-[0.8cqw] border-amber-300 bg-[#0c0d10]/60 px-[2.5cqw] py-[1.2cqw] font-sans text-[6cqw] font-semibold leading-none text-amber-300"
                >
                  ON YOUR LIST
                </span>
              )}
            </div>

            {/* The lockup at the bottom, as on the real badge: a small bold word over a big tight one. */}
            <div className="px-[6cqw] pb-[6cqw] pt-[5cqw]">
              <p className="font-sans text-[9cqw] font-bold leading-none tracking-[0.02em] text-cream-200" style={condensed}>
                ARTIST
              </p>
              <p
                className="mt-[1cqw] truncate font-sans text-[27cqw] font-semibold uppercase leading-[0.82] text-cream-50"
                style={condensed}
              >
                {m.name}
              </p>
              <div className="mt-[3cqw] flex items-baseline justify-between gap-2 font-sans">
                <span className="text-[7cqw] text-cream-400">{m.role}</span>
                {media ? (
                  <span className="shrink-0 text-[6cqw] text-amber-400">swipe to hear</span>
                ) : (
                  <span className="shrink-0 text-[6cqw] text-cream-400/70">No. {String(n + 1).padStart(3, '0')}</span>
                )}
              </div>
            </div>

            <div aria-hidden="true" className="u-holo pointer-events-none absolute inset-0 opacity-40" />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ background: 'linear-gradient(125deg, rgba(255,255,255,0.14) 0%, transparent 28%)' }}
            />
          </div>

          {/* ---------- back: they sing ---------- */}
          {media && (
            <div className="absolute inset-0 flex flex-col overflow-hidden rounded-[6cqw] bg-[#0c0d10] ring-1 ring-amber-400/60 [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <div aria-hidden="true" className="absolute left-1/2 top-[3cqw] z-20 h-[4cqw] w-[22cqw] -translate-x-1/2 rounded-full bg-navy-950" />
              <div className="relative mx-[6cqw] mt-[12cqw] flex-1 overflow-hidden rounded-[3cqw] bg-black">
                {media.kind === 'video' ? (
                  <video ref={player} src={media.src} preload="none" playsInline loop className="h-full w-full object-cover" />
                ) : (
                  <>
                    <audio ref={player} src={media.src} preload="none" loop />
                    {m.photoUrl && <img src={m.photoUrl} alt="" className="h-full w-full object-cover object-top opacity-60" />}
                    {/* Level meter while the clip plays. */}
                    <div aria-hidden="true" className="absolute inset-x-[8cqw] bottom-[6cqw] flex h-[14cqw] items-end gap-[1.5cqw]">
                      {[0.6, 1, 0.75, 0.9, 0.5, 0.85, 0.65].map((h, k) => (
                        <span
                          key={k}
                          className={`u-meter flex-1 origin-bottom bg-amber-400 ${flipped ? '' : '[animation-play-state:paused]'}`}
                          style={{ height: `${h * 100}%`, animationDelay: `${k * -0.17}s` }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="px-[6cqw] pb-[6cqw] pt-[4cqw]">
                <p className="font-sans text-[6.5cqw] text-amber-400">Now singing</p>
                <p className="font-sans text-[9cqw] font-bold leading-none text-cream-200" style={condensed}>
                  TEAM
                </p>
                <p className="font-sans text-[21cqw] font-semibold leading-[0.85] text-cream-50" style={condensed}>
                  SUNG SUNGEET
                </p>
              </div>
            </div>
          )}
        </div>

        {/* The same action for keyboards and screen readers. */}
        {media && (
          <button
            type="button"
            onClick={() => setSinging(!flipped)}
            aria-pressed={flipped}
            className="sr-only focus:not-sr-only focus:absolute focus:inset-x-0 focus:-bottom-10 focus:bg-amber-400 focus:px-3 focus:py-2 focus:text-center focus:font-sans focus:text-sm focus:text-navy-950"
          >
            {flipped ? `Stop ${m.name}` : `Hear ${m.name} sing`}
          </button>
        )}
      </div>
    </div>
  )
}

/** Album-back credits. Square prints for whoever has a photo, a plain line for the rest. */
function Personnel({ members, reel }: { members: Team['members']; reel: PassMedia | null }) {
  const pictured = members.filter((m) => m.photoUrl)
  const rest = members.filter((m) => !m.photoUrl)
  const passes = useRef<HTMLUListElement>(null)
  useScrollSwing(passes)

  return (
    <div className="mt-10">
      <p className="font-sans text-[0.8rem] text-amber-400">Personnel</p>
      <div className="mt-2 h-px bg-cream-50/15" />

      {pictured.length > 0 && (
        <ul ref={passes} className="mt-2 grid grid-cols-3 gap-4 sm:gap-5">
          {pictured.map((m, k) => (
            <li key={m.name + m.role}>
              <ArtistPass m={m} n={k} media={ARTIST_CLIPS[m.name] ?? reel} />
            </li>
          ))}
        </ul>
      )}

      {rest.length > 0 && (
        <ul className="mt-3 columns-1 gap-8 sm:columns-2">
          {rest.map((m) => (
            <li
              key={m.name + m.role}
              className="flex break-inside-avoid items-baseline gap-2 border-b border-dotted border-cream-50/15 py-2 font-sans text-[0.9rem]"
            >
              <span className="text-cream-50">{m.name}</span>
              <span className="ml-auto text-cream-400">{m.role}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function Teams({ teams, activeSlug, onPickTeam, onBookTeam }: Props) {
  const [playing, setPlaying] = useState<string | null>(null)
  const stop = useCallback(() => setPlaying(null), [])

  if (teams.length === 0) return null

  return (
    <section
      id="teams"
      aria-labelledby="teams-heading"
      className="scroll-mt-16 overflow-x-clip border-t u-rule bg-navy-950 text-cream-50"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-10 sm:py-28">
        <header className="max-w-2xl">
          <h2 id="teams-heading" className="font-display text-section leading-[0.95]">
            Meet the lineups
          </h2>
          <p className="mt-4 font-sans text-[0.95rem] leading-relaxed text-cream-400">
            Not one fixed band. Depending on the room, a different lineup goes
            out, and the calendar tells you which one is playing your date.
          </p>
        </header>

        <div className="mt-20 space-y-28 sm:space-y-36">
          {teams.map((team, i) => {
            const active = activeSlug === team.slug
            const flip = i % 2 === 1

            return (
              <article
                key={team.slug}
                aria-labelledby={`team-${team.slug}`}
                className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16"
              >
                <div
                  // Phones: leave a gutter for the tonearm, which pivots just past the record.
                  className={`mx-auto w-full max-w-md lg:col-span-6 lg:max-w-none ${
                    flip ? 'pl-10 lg:order-last lg:pl-0' : 'pr-10 lg:pr-0'
                  }`}
                >
                  <Record
                    team={team}
                    flip={flip}
                    active={active}
                    playing={playing === team.slug}
                    onToggle={playing === team.slug ? stop : () => setPlaying(team.slug)}
                  />
                </div>

                <div className="lg:col-span-6">
                  <h3
                    id={`team-${team.slug}`}
                    className="font-display text-[clamp(2.6rem,6vw,4.5rem)] leading-[0.9]"
                  >
                    {team.name}
                  </h3>
                  {team.blurb && (
                    <p className="mt-5 max-w-lg font-sans text-[0.95rem] leading-relaxed text-cream-400">
                      {team.blurb}
                    </p>
                  )}

                  <Personnel
                    members={team.members}
                    reel={(() => {
                      const v = team.media.find((x) => x.kind === 'video' && x.src)
                      return v?.src ? { kind: 'video', src: v.src } : null
                    })()}
                  />

                  <div className="mt-10 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onPickTeam(team.slug)}
                      aria-pressed={active}
                      className="bg-amber-400 px-5 py-2.5 font-sans text-[0.85rem] text-navy-950 transition-opacity hover:opacity-90"
                    >
                      {active ? 'Showing their dates' : 'See their dates'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onBookTeam(team.slug)}
                      className="border border-cream-50/30 px-5 py-2.5 font-sans text-[0.85rem] text-cream-50 transition-colors hover:border-cream-50 hover:bg-cream-50 hover:text-navy-950"
                    >
                      Book them
                    </button>
                    <span className={`${HAND} ml-1 text-[1.35rem] text-cream-400`}>
                      {team.members.length} on stage
                    </span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {/* The way into the full roster, which isn't on the menu. */}
        <div className="mt-28 flex flex-col items-start gap-5 border-t u-rule pt-12 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md font-sans text-[0.95rem] leading-relaxed text-cream-400">
            Want particular people rather than a whole lineup? Pick them one by one
            and send a single enquiry.
          </p>
          <a
            href="#artists"
            className="shrink-0 border border-amber-400 px-6 py-3 font-sans text-[0.9rem] text-amber-400 transition-colors hover:bg-amber-400 hover:text-navy-950"
          >
            See all our artists
          </a>
        </div>
      </div>
    </section>
  )
}
