import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Smooth scroll, driven off GSAP's ticker so Lenis and ScrollTrigger stay on
 * one clock. Disabled entirely under prefers-reduced-motion — smoothing is
 * motion, and forcing it on someone who asked for less is the whole problem.
 */
export function useLenis(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      // Drive touch scrolling ourselves instead of leaving it to the browser.
      // iOS does not fire scroll events during momentum, so anything scrubbed
      // by scroll position freezes mid-flick and then jumps — which is exactly
      // what a scroll-driven video looks like when it "doesn't work" on a
      // phone. With this, the scrub updates on our own clock.
      syncTouch: true,
    })

    lenis.on('scroll', ScrollTrigger.update)


    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [enabled])
}
