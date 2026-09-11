import { Suspense, lazy, useState } from 'react'
import SingerReel from './SingerReel'
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
      className="relative min-h-[100svh] overflow-hidden bg-navy-950 px-5 pb-12 pt-24 sm:px-10 sm:pt-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[80vh] w-[80vh] -translate-x-1/3 -translate-y-1/2 rounded-full opacity-55 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(212,141,70,0.34) 0%, rgba(170,85,56,0.16) 45%, transparent 72%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[16%] bottom-[-22%] h-[54vh] w-[54vh] rounded-full opacity-80 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(22,49,92,0.9) 0%, transparent 70%)' }}
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-8 lg:min-h-[calc(100svh-9rem)] lg:grid-cols-[1fr_1.15fr_0.72fr] lg:gap-4">
        {/* ---------------------------------------------------- left: text */}
        <div>
          <p className="font-sans text-[0.78rem] tracking-[0.26em] text-amber-400">
            Delhi&rsquo;s own music community
          </p>
          <h1
            id="hero-heading"
            className="mt-5 font-display leading-[0.86] text-cream-50"
            style={{ fontSize: 'clamp(3.9rem, 8.5vw, 8rem)', letterSpacing: '-0.01em' }}
          >
            Sung
            <br />
            <em className="text-amber-400">Sungeet</em>
          </h1>
          <p className="mt-8 max-w-sm font-sans text-[1.02rem] leading-relaxed text-cream-400">
            Open jamming every Tuesday, private events, weddings and stage shows
            across Delhi NCR.
          </p>
          <ol className="mt-10 flex flex-wrap gap-x-6 gap-y-2 font-sans text-[0.72rem] uppercase tracking-[0.2em] text-cream-50/55">
            {['Swipe a singer', 'Spin the mic', 'Listen'].map((s, i) => (
              <li key={s}>
                <span className="mr-2 font-semibold text-amber-400">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>

        {/* ------------------------------------------ centre: the big mic */}
        <div className="relative mx-auto flex h-[22rem] w-full max-w-[26rem] items-center justify-center sm:h-[28rem]">
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
            className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-[1.15rem] text-amber-400"
            style={{ fontFamily: '"Caveat",cursive', fontWeight: 600 }}
          >
            {playing ? 'spin to restart' : 'spin me'}
          </p>
        </div>

        {/* ------------------------------- right: vertical singer reel */}
        <div className="mx-auto w-full max-w-[13rem] lg:mx-0">
          <SingerReel
            singers={SINGERS}
            selected={selected}
            onSelect={setSelected}
            playing={playing}
          />
        </div>
      </div>
    </section>
  )
}
