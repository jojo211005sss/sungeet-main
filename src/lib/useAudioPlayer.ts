import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * One shared player for the hero. Exposes a live amplitude reading so the
 * notes around the mic can move to the music rather than on a timer.
 *
 * The AudioContext is created lazily inside a user gesture — browsers refuse
 * to start one otherwise — which is why play() must only ever be called from
 * a pointer handler.
 */
export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataRef = useRef<Uint8Array<ArrayBuffer> | null>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState<string | null>(null)

  const ensure = useCallback(() => {
    if (audioRef.current) return audioRef.current
    const el = new Audio()
    el.preload = 'auto'
    el.crossOrigin = 'anonymous'
    el.addEventListener('ended', () => setPlaying(false))
    el.addEventListener('pause', () => setPlaying(false))
    el.addEventListener('play', () => setPlaying(true))
    audioRef.current = el
    return el
  }, [])

  const wire = useCallback((el: HTMLAudioElement) => {
    if (ctxRef.current) return
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.82
    ctx.createMediaElementSource(el).connect(analyser)
    analyser.connect(ctx.destination)
    ctxRef.current = ctx
    analyserRef.current = analyser
    dataRef.current = new Uint8Array(analyser.frequencyBinCount)
  }, [])

  /** Play from the start. Same clip → restarts; different clip → switches. */
  const play = useCallback(
    (src: string) => {
      const el = ensure()
      wire(el)
      void ctxRef.current?.resume()
      if (el.src !== new URL(src, window.location.href).href) {
        el.src = src
        setCurrent(src)
      }
      el.currentTime = 0
      void el.play().catch(() => setPlaying(false))
    },
    [ensure, wire],
  )

  const stop = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  /** 0..1 loudness right now. Cheap enough to call every frame. */
  const level = useCallback(() => {
    const a = analyserRef.current
    const d = dataRef.current
    if (!a || !d) return 0
    a.getByteFrequencyData(d)
    let sum = 0
    // Weight the low-mid bins — that's where voice and plucked strings live.
    const n = Math.min(40, d.length)
    for (let i = 2; i < n; i++) sum += d[i]
    return Math.min(1, sum / (n - 2) / 140)
  }, [])

  useEffect(() => () => {
    audioRef.current?.pause()
    void ctxRef.current?.close()
  }, [])

  return { play, stop, playing, current, level }
}
