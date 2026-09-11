import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Musical notes orbiting the mic while a clip plays. They fade in when audio
 * starts, bob to the actual loudness, and fade out when it stops.
 *
 * Glyphs are drawn to a canvas at runtime — no font file to fetch — and each
 * note is a sprite, so it always faces the camera as the mic turns.
 */

const GLYPHS = ['♪', '♫', '♩', '♬', '♪', '♫']

function glyphTexture(glyph: string): THREE.Texture {
  const size = 128
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  ctx.clearRect(0, 0, size, size)
  ctx.font = `600 ${size * 0.72}px "Instrument Serif", Georgia, serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(212,141,70,0.9)'
  ctx.shadowBlur = 18
  ctx.fillStyle = '#e3ab6d'
  ctx.fillText(glyph, size / 2, size / 2 + 4)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export default function Notes({
  active,
  level,
}: {
  active: boolean
  /** Returns current loudness 0..1. */
  level: () => number
}) {
  const sprites = useRef<THREE.Sprite[]>([])
  const opacity = useRef(0)

  const notes = useMemo(
    () =>
      GLYPHS.map((g, i) => ({
        texture: glyphTexture(g),
        // Spread around the mic at different radii, heights and speeds so
        // they never move in lockstep.
        angle: (i / GLYPHS.length) * Math.PI * 2,
        radius: 1.35 + (i % 3) * 0.22,
        height: -0.4 + ((i * 0.37) % 1) * 1.1,
        speed: 0.35 + (i % 2) * 0.18,
        wobble: 0.6 + (i % 3) * 0.25,
        size: 0.26 + (i % 2) * 0.06,
      })),
    [],
  )

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const target = active ? 1 : 0
    opacity.current += (target - opacity.current) * Math.min(1, dt * 4)
    if (opacity.current < 0.01 && !active) return

    const loud = active ? level() : 0

    notes.forEach((n, i) => {
      const s = sprites.current[i]
      if (!s) return
      const a = n.angle + t * n.speed
      // Bob: a slow sine for drift, plus the music's loudness on top.
      const bob = Math.sin(t * 2.1 * n.wobble + i) * 0.08 + loud * 0.28
      s.position.set(Math.cos(a) * n.radius, n.height + bob, Math.sin(a) * n.radius)
      const sc = n.size * (1 + loud * 0.55)
      s.scale.set(sc, sc, 1)
      ;(s.material as THREE.SpriteMaterial).opacity = opacity.current * (0.55 + loud * 0.45)
      ;(s.material as THREE.SpriteMaterial).rotation = Math.sin(t * 1.3 + i) * 0.25
    })
  })

  return (
    <group>
      {notes.map((n, i) => (
        <sprite
          key={i}
          ref={(el) => {
            if (el) sprites.current[i] = el
          }}
          scale={[n.size, n.size, 1]}
        >
          <spriteMaterial map={n.texture} transparent opacity={0} depthWrite={false} />
        </sprite>
      ))}
    </group>
  )
}
