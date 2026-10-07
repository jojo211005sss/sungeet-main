import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PhotoScene } from '../scenes/Scenes'
import { SCENE_ART } from '../data/sceneArt'
import { SCENES } from '../data/scenes'
import { useIsMobile, useReducedMotion } from '../lib/useMediaQuery'

gsap.registerPlugin(ScrollTrigger)

// Where each scene starts on the timeline, in scene units. A scene with a
// bigger span gets more scroll before the next one fades in.
const SPANS = SCENE_ART.map((a) => a.span ?? 1)
const STARTS = SPANS.map((_, i) => SPANS.slice(0, i).reduce((t, s) => t + s, 0))
const TOTAL = SPANS.reduce((t, s) => t + s, 0)

/* -------------------------------------------------------------------------
   Reduced-motion path: no pin, no scrub, no parallax. Each moment is simply
   a section you scroll past. Same content, same order, zero animation.
------------------------------------------------------------------------- */
function StaticWalkthrough() {
  return (
    <section id="walkthrough" aria-labelledby="walkthrough-heading">
      <h2 id="walkthrough-heading" className="sr-only">
        A walkthrough of one show
      </h2>
      {SCENES.map((scene, i) => (
          <article
            key={scene.id}
            className="relative border-b u-rule bg-navy-950"
          >
            <div className="u-grain relative h-[58vh] min-h-[340px] overflow-hidden">
              <div aria-hidden="true" className="absolute inset-0">
                <PhotoScene art={SCENE_ART[i]} index={i} eager={i < 2} />
              </div>
            </div>
            <div className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
              <p className="font-sans text-xs tracking-[0.28em] text-amber-400">
                {scene.index} — {scene.rail}
              </p>
              <h3 className="mt-3 font-display text-scene leading-[1.04] text-cream-50">
                {scene.title}
              </h3>
              <p className="mt-4 max-w-xl font-sans text-[0.98rem] leading-relaxed text-cream-400">
                {scene.line}
              </p>
            </div>
          </article>
        ))}
    </section>
  )
}

/* -------------------------------------------------------------------------
   Motion path: one pinned viewport, scrubbed by a tall scroll track.
------------------------------------------------------------------------- */
export default function ScrollWalkthrough() {
  const reduced = useReducedMotion()
  const isMobile = useIsMobile()

  const trackRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useLayoutEffect(() => {
    if (reduced) return
    const track = trackRef.current
    const stage = stageRef.current
    if (!track || !stage) return

    const ctx = gsap.context(() => {
      const scenes = gsap.utils.toArray<HTMLElement>('[data-scene]', stage)
      const captions = gsap.utils.toArray<HTMLElement>('[data-caption]', stage)
      const n = scenes.length

      // Scene 1 is already showing; everything above it starts hidden.
      gsap.set(scenes, { opacity: (i) => (i === 0 ? 1 : 0) })
      gsap.set(captions, { opacity: (i) => (i === 0 ? 1 : 0), y: (i) => (i === 0 ? 0 : 26) })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: track,
          start: 'top top',
          end: 'bottom bottom',
          scrub: isMobile ? 0.4 : 0.8,
          onUpdate: (self) => {
            const p = self.progress * TOTAL + 0.001
            let i = 0
            while (i < n - 1 && STARTS[i + 1] <= p) i++
            setActive((prev) => (prev === i ? prev : i))
          },
        },
      })

      scenes.forEach((scene, i) => {
        const at = STARTS[i]
        const span = SPANS[i]
        // Each scene owns `span` units of the timeline. Incoming art fades up over
        // the outgoing one, which stays put underneath — no double-exposure
        // brightening mid-crossfade.
        if (i > 0) {
          tl.to(scene, { opacity: 1, duration: 0.42 }, at - 0.21)
          tl.to(captions[i], { opacity: 1, y: 0, duration: 0.34 }, at - 0.1)
          tl.to(captions[i - 1], { opacity: 0, y: -22, duration: 0.28 }, at - 0.24)
        }

        // Scrub any clip in this scene across its segment of the timeline, so
        // scroll position maps straight onto playback time.
        const video = scene.querySelector<HTMLVideoElement>('video[data-scrub]')
        if (video) {
          const playhead = { t: 0 }
          tl.to(
            playhead,
            {
              t: 1,
              duration: 0.5 + span,
              onUpdate: () => {
                // readyState < 2 means no frame is decoded yet; seeking then
                // throws the element into a bad state on Safari.
                if (video.readyState >= 2 && Number.isFinite(video.duration)) {
                  video.currentTime = playhead.t * video.duration
                }
              },
            },
            Math.max(0, at - 0.25),
          )
        }

        if (isMobile) {
          // Phones get the cheap version: whole-scene drift only. No per-layer
          // transforms, so there is one composited element per scene, not five.
          tl.fromTo(
            scene,
            { scale: 1.015 },
            { scale: 1.075, duration: 0.4 + span },
            Math.max(0, at - 0.2),
          )
          return
        }

        const layers = gsap.utils.toArray<HTMLElement>('[data-depth]', scene)
        layers.forEach((layer) => {
          const d = parseFloat(layer.dataset.depth ?? '0')
          tl.fromTo(
            layer,
            { yPercent: 4 * d, scale: 1 + 0.03 * d },
            { yPercent: -7 * d, scale: 1 + 0.16 * d, duration: 0.5 + span },
            Math.max(0, at - 0.25),
          )
        })
      })
    }, stageRef)

    return () => ctx.revert()
  }, [reduced, isMobile])

  // iOS Safari ignores preload="auto": it fetches nothing until the clip has
  // played once, so readyState never reaches 2 and the scrub never seeks. A
  // muted play-then-pause primes the decoder. Low Power Mode blocks even that,
  // so retry on the first touch, which counts as a user gesture.
  useEffect(() => {
    if (reduced) return
    const prime = () =>
      stageRef.current
        ?.querySelectorAll<HTMLVideoElement>('video[data-scrub]')
        .forEach((v) => {
          if (v.readyState >= 2) return
          v.play().then(() => v.pause(), () => {})
        })
    prime()
    window.addEventListener('touchstart', prime, { once: true, passive: true })
    return () => window.removeEventListener('touchstart', prime)
  }, [reduced, isMobile])

  // Keep pin measurements honest when fonts land or the layout really changes.
  useEffect(() => {
    if (reduced) return

    document.fonts?.ready.then(() => ScrollTrigger.refresh())

    // Mobile browsers fire `resize` every time the URL bar collapses or
    // reappears — which happens *while you are scrolling*. Refreshing then
    // recalculates the pin's start/end mid-gesture and the section reads as
    // frozen or jumps. Only a width change is a real layout change; height
    // alone is just browser chrome.
    let lastWidth = window.innerWidth
    const onResize = () => {
      if (window.innerWidth === lastWidth) return
      lastWidth = window.innerWidth
      ScrollTrigger.refresh()
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [reduced])

  if (reduced) return <StaticWalkthrough />

  return (
    <section
      id="walkthrough"
      ref={trackRef}
      aria-labelledby="walkthrough-heading"
      className="relative"
      // ~100svh of scroll per scene unit, so longer scenes make the track taller.
      style={{ height: `${Math.round((isMobile ? 100 : 104) * TOTAL)}svh` }}
    >
      <h2 id="walkthrough-heading" className="sr-only">
        A walkthrough of one show
      </h2>

      <div
        ref={stageRef}
        className="u-grain sticky top-0 h-[100svh] w-full overflow-hidden bg-navy-950"
      >
        {/* Art stack. Decorative — the captions carry the meaning. */}
        <div aria-hidden="true" className="absolute inset-0">
          {SCENE_ART.map((art, i) => (
            <div
              key={SCENES[i].id}
              data-scene={i}
              className="absolute inset-0 overflow-hidden will-change-[opacity,transform]"
              style={{ zIndex: i + 1 }}
            >
              <PhotoScene
                art={art}
                index={i}
                eager={i < 2}
                useVideo
                mobile={isMobile}
              />
            </div>
          ))}
        </div>

        {/* Legibility scrim — bottom-weighted so the art keeps its top half. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-navy-950 via-navy-950/55 to-transparent"
        />

        {/* Captions */}
        <div className="pointer-events-none absolute inset-0 z-30 flex items-end">
          <div className="w-full px-6 pb-14 sm:px-10 sm:pb-16 lg:px-16 lg:pb-20">
            <div className="relative mx-auto h-[13.5rem] max-w-6xl sm:h-[12rem]">
              {SCENES.map((scene, i) => (
                <div
                  key={scene.id}
                  data-caption={i}
                  className="absolute inset-x-0 bottom-0 max-w-2xl"
                >
                  <p className="font-sans text-xs tracking-[0.28em] text-amber-400">
                    {scene.index} — {scene.rail}
                  </p>
                  <h3 className="mt-3 font-display text-scene leading-[1.02] text-cream-50">
                    {scene.title}
                  </h3>
                  <p className="mt-4 font-sans text-[0.95rem] leading-relaxed text-cream-400 sm:text-base">
                    {scene.line}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress rail. Hidden on small screens where it would crowd the copy. */}
        <ol
          aria-hidden="true"
          className="absolute right-6 top-1/2 z-30 hidden -translate-y-1/2 space-y-5 lg:block"
        >
          {SCENES.map((scene, i) => (
            <li key={scene.id} className="flex items-center justify-end gap-3">
              <span
                className={`font-sans text-[0.7rem] tracking-[0.2em] transition-opacity duration-300 ${
                  i === active ? 'text-amber-400 opacity-100' : 'text-cream-400 opacity-40'
                }`}
              >
                {scene.rail}
              </span>
              <span
                className={`block h-px transition-all duration-300 ${
                  i === active ? 'w-10 bg-amber-400' : 'w-4 bg-cream-400/40'
                }`}
              />
            </li>
          ))}
        </ol>

        {/* Screen readers get the scene change without the animation. */}
        <p aria-live="polite" className="sr-only">
          {`Scene ${SCENES[active].index}: ${SCENES[active].title}`}
        </p>
      </div>
    </section>
  )
}
