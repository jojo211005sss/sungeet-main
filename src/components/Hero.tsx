import { useState } from 'react'
import ArtistField from './ArtistField'
import { useAudioPlayer } from '../lib/useAudioPlayer'
import { useFloaters } from '../lib/useFloaters'
import { useReducedMotion } from '../lib/useMediaQuery'

export default function Hero() {
  const reduced = useReducedMotion()
  const [selected, setSelected] = useState(0)
  const { play, playing } = useAudioPlayer()
  const { floaters } = useFloaters()
  const singer = floaters[selected] ?? floaters[0]

  // Click is a real user gesture, which is what lets audio start.
  const pick = (i: number) => {
    setSelected(i)
    play(floaters[i].audio)
  }

  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-navy-950"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[80vh] w-[80vh] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-45 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(212,141,70,0.28) 0%, rgba(170,85,56,0.13) 45%, transparent 72%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[16%] bottom-[-22%] h-[52vh] w-[52vh] rounded-full opacity-80 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(22,49,92,0.9) 0%, transparent 70%)' }}
      />

      <ArtistField
        singers={floaters}
        selected={selected}
        playing={playing}
        reduced={reduced}
        onPick={pick}
      />

      {/* Brand sits dead centre; the artists orbit it. */}
      <div className="pointer-events-none relative z-20 mx-auto flex min-h-[100svh] w-full max-w-6xl flex-1 items-center justify-center px-5 sm:px-10">
        <div className="max-w-[34rem] text-center">
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
          <p className="mx-auto mt-7 max-w-md font-sans text-[1.02rem] leading-relaxed text-cream-400">
            Open jamming every Tuesday, private events, weddings and stage shows
            across Delhi NCR.
          </p>

          <p
            aria-live="polite"
            className="mt-9 font-sans text-[0.72rem] uppercase tracking-[0.22em] text-cream-50/55"
          >
            {playing ? (
              <>
                <span className="text-amber-400">Now singing</span>
                {' — '}
                {singer.name}, {singer.role}
              </>
            ) : (
              <>
                <span className="mr-2 font-semibold text-amber-400">↗</span>
                Tap an artist to hear them sing
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  )
}
