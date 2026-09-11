import { Suspense, lazy, useState } from 'react'
import ArtistField from './ArtistField'
import { SINGERS } from '../data/singers'
import { useAudioPlayer } from '../lib/useAudioPlayer'
import { useReducedMotion } from '../lib/useMediaQuery'

const MicScene = lazy(() => import('../three/MicScene'))

function MicFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <img
        src="/brand/sunggeet-mark.png"
        alt=""
        width={140}
        height={140}
        className="h-32 w-32 rounded-full opacity-80 ring-1 ring-cream-50/15"
      />
    </div>
  )
}

/** Faint concentric orbit rings behind the mic — fills the space, echoes the
    "living network" feel without clutter. */
function OrbitRings() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[130vh] w-[130vh] -translate-x-1/2 -translate-y-1/2 opacity-[0.16]"
      viewBox="0 0 100 100"
      fill="none"
    >
      {[46, 37, 28, 19].map((r, i) => (
        <ellipse
          key={r}
          cx="50"
          cy="50"
          rx={r}
          ry={r * 0.64}
          stroke={i % 2 ? '#9aa6bb' : '#d48d46'}
          strokeWidth="0.15"
        />
      ))}
    </svg>
  )
}

export default function Hero() {
  const reduced = useReducedMotion()
  const [selected, setSelected] = useState(0)
  const { play, playing, level } = useAudioPlayer()
  const singer = SINGERS[selected]

  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-navy-950"
    >
      {/* warm glow centred on the mic */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[85vh] w-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(212,141,70,0.3) 0%, rgba(170,85,56,0.14) 42%, transparent 70%)',
        }}
      />
      <OrbitRings />

      {/* Drifting / docking artists across the whole frame. */}
      <ArtistField
        singers={SINGERS}
        selected={selected}
        onSelect={setSelected}
        playing={playing}
        reduced={reduced}
      />

      {/* ---------------------------------------------------- the big mic */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center sm:h-[36rem] sm:w-[36rem]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[16%] left-1/2 h-12 w-64 -translate-x-1/2 rounded-[50%] opacity-70 blur-xl"
          style={{ background: 'radial-gradient(ellipse, rgba(212,141,70,0.4), transparent 70%)' }}
        />
        <div className="pointer-events-auto h-full w-full">
          <Suspense fallback={<MicFallback />}>
            <MicScene
              playing={playing}
              level={level}
              reduced={reduced}
              onSpin={() => play(singer.audio)}
            />
          </Suspense>
        </div>
        <p
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[10%] left-1/2 -translate-x-1/2 whitespace-nowrap font-sans text-[0.68rem] uppercase tracking-[0.32em] text-amber-400/90"
        >
          {playing ? 'spin to restart' : 'spin to play'}
        </p>
      </div>

      {/* ------------------------------------------- brand, left, centred */}
      <div className="pointer-events-none relative z-30 mx-auto flex min-h-[100svh] w-full max-w-6xl flex-1 items-center px-5 sm:px-10">
        <div className="max-w-[24rem]">
          <p className="font-sans text-[0.78rem] tracking-[0.26em] text-amber-400">
            Delhi&rsquo;s own music community
          </p>
          <h1
            id="hero-heading"
            className="mt-5 font-display leading-[0.84] text-cream-50"
            style={{ fontSize: 'clamp(4rem, 8.5vw, 8.5rem)', letterSpacing: '-0.01em' }}
          >
            Sung
            <br />
            <em className="text-amber-400">Sungeet</em>
          </h1>
          <p className="mt-7 font-sans text-[1.02rem] leading-relaxed text-cream-400">
            Open jamming every Tuesday, private events, weddings and stage shows
            across Delhi NCR.
          </p>
          <ol className="mt-9 flex flex-wrap gap-x-6 gap-y-2 font-sans text-[0.72rem] uppercase tracking-[0.2em] text-cream-50/55">
            {['Tap an artist', 'Spin the mic', 'Listen'].map((s, i) => (
              <li key={s}>
                <span className="mr-2 font-semibold text-amber-400">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* -------------------------------------- selected info, right, centred */}
      <div className="pointer-events-none absolute right-5 top-1/2 z-30 hidden -translate-y-1/2 text-right sm:right-10 lg:block">
        <p className="font-sans text-[0.64rem] uppercase tracking-[0.24em] text-cream-400/60">
          Now on the mic
        </p>
        <p className="mt-2 font-display text-[2.4rem] leading-none text-cream-50">
          {singer.name}
        </p>
        <p className="mt-2 font-sans text-[0.72rem] uppercase tracking-[0.2em] text-amber-400">
          {singer.role}
        </p>
        <p className="ml-auto mt-4 max-w-[13rem] font-sans text-[0.8rem] leading-relaxed text-cream-400">
          {playing
            ? 'Playing their set. Tap another artist to switch.'
            : 'Spin the mic to hear this set, or tap another drifting artist.'}
        </p>
      </div>
    </section>
  )
}
