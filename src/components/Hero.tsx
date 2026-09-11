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
      {/* warm centre glow behind the mic */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[74vh] w-[74vh] -translate-x-[38%] -translate-y-1/2 rounded-full opacity-55 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(212,141,70,0.32) 0%, rgba(170,85,56,0.15) 45%, transparent 72%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[16%] bottom-[-22%] h-[52vh] w-[52vh] rounded-full opacity-80 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(22,49,92,0.9) 0%, transparent 70%)' }}
      />

      {/* Floating / docking artists sit behind the mic and text. */}
      <ArtistField
        singers={SINGERS}
        selected={selected}
        onSelect={setSelected}
        playing={playing}
        reduced={reduced}
      />

      <div className="relative z-20 mx-auto grid h-full w-full max-w-6xl items-center gap-8 lg:min-h-[calc(100svh-9rem)] lg:grid-cols-[1fr_1.1fr_0.7fr]">
        {/* ------------------------------------------------- left: brand */}
        <div className="pointer-events-none">
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
            {['Tap an artist', 'Spin the mic', 'Listen'].map((s, i) => (
              <li key={s}>
                <span className="mr-2 font-semibold text-amber-400">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </div>

        {/* --------------------------------------------- centre: the mic */}
        <div className="relative mx-auto flex h-[22rem] w-full max-w-[26rem] items-center justify-center sm:h-[28rem]">
          {/* platform: an elliptical glow the mic stands on */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[14%] left-1/2 h-10 w-52 -translate-x-1/2 rounded-[50%] opacity-70 blur-xl"
            style={{ background: 'radial-gradient(ellipse, rgba(212,141,70,0.45), transparent 70%)' }}
          />
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
            className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap font-sans text-[0.66rem] uppercase tracking-[0.28em] text-amber-400/90"
          >
            {playing ? 'spin to restart' : 'spin to play'}
          </p>
        </div>

        {/* -------------------------------------- right: selected info */}
        <div className="pointer-events-none hidden lg:block">
          <p className="font-sans text-[0.66rem] uppercase tracking-[0.22em] text-cream-400/60">
            Now on the mic
          </p>
          <p className="mt-2 font-display text-[2rem] leading-tight text-cream-50">
            {singer.name}
          </p>
          <p className="mt-1 font-sans text-[0.72rem] uppercase tracking-[0.2em] text-amber-400">
            {singer.role}
          </p>
          <p className="mt-4 max-w-[12rem] font-sans text-[0.8rem] leading-relaxed text-cream-400">
            {playing
              ? 'Playing their set. Tap another artist to switch.'
              : 'Spin the mic to hear this set, or tap another drifting artist.'}
          </p>
        </div>
      </div>
    </section>
  )
}
