import { Suspense, lazy, useState } from 'react'
import SingerStrip from './SingerStrip'
import { SINGERS } from '../data/singers'
import { useAudioPlayer } from '../lib/useAudioPlayer'
import { useReducedMotion } from '../lib/useMediaQuery'

// Three.js is ~150KB gzipped. It only loads once the hero renders, and never
// blocks the text.
const MicScene = lazy(() => import('../three/MicScene'))

function MicFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <img
        src="/brand/sunggeet-mark.png"
        alt=""
        width={120}
        height={120}
        className="h-28 w-28 rounded-full opacity-80 ring-1 ring-cream-50/15"
      />
    </div>
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
      className="relative min-h-[100svh] overflow-hidden bg-navy-950 px-5 pb-10 pt-24 sm:px-10 sm:pt-28 lg:pb-16"
    >
      {/* Tungsten spill and navy ground, as before. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[12%] top-[-12%] h-[72vh] w-[72vh] rounded-full opacity-70 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(212,141,70,0.42) 0%, rgba(170,85,56,0.20) 45%, transparent 72%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[18%] bottom-[-22%] h-[58vh] w-[58vh] rounded-full opacity-80 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(22,49,92,0.9) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:min-h-[calc(100svh-9rem)] lg:grid-cols-[1.05fr_1fr] lg:gap-8">
        {/* ---------------------------------------------------- left ---- */}
        <div>
          <p className="font-sans text-[0.78rem] tracking-[0.26em] text-amber-400">
            Delhi&rsquo;s own music community
          </p>

          <h1
            id="hero-heading"
            className="mt-5 font-display leading-[0.86] text-cream-50"
            style={{ fontSize: 'clamp(4.2rem, 10.5vw, 9.5rem)', letterSpacing: '-0.01em' }}
          >
            Sung
            <br />
            <em className="text-amber-400">Sungeet</em>
          </h1>

          <p className="mt-8 max-w-md font-sans text-[1.02rem] leading-relaxed text-cream-400">
            Open jamming every Tuesday, private events, weddings and stage shows
            across Delhi NCR.
          </p>

          <ol className="mt-10 flex flex-wrap gap-x-7 gap-y-2 font-sans text-[0.72rem] uppercase tracking-[0.2em] text-cream-50/55">
            {['Swipe a singer', 'Spin the mic', 'Listen'].map((step, i) => (
              <li key={step}>
                <span className="mr-2 font-semibold text-amber-400">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* --------------------------------------------------- right ---- */}
        <div className="relative">
          {/* The mic. Kept small on purpose — it's an instrument, not a hero image. */}
          <div className="relative mx-auto h-[15rem] w-[15rem] sm:h-[17rem] sm:w-[17rem]">
            <Suspense fallback={<MicFallback />}>
              <MicScene
                playing={playing}
                level={level}
                reduced={reduced}
                onSpin={() => play(singer.audio)}
              />
            </Suspense>

            <p
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[1.25rem] text-amber-400"
              style={{ fontFamily: '"Caveat", cursive', fontWeight: 600 }}
            >
              {playing ? 'spin again to restart' : 'spin me →'}
            </p>
          </div>

          <div className="mt-10">
            <SingerStrip
              singers={SINGERS}
              selected={selected}
              onSelect={setSelected}
              playing={playing}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
