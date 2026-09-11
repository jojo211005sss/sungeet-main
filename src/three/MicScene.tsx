import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import MicModel, { type MicHandle } from './MicModel'
import Notes from './Notes'

/**
 * The interactive mic: idles, spins when dragged, and reports the gesture so
 * the hero can start the selected singer's clip. Dragging is read on the
 * wrapper rather than inside the canvas so the gesture works before Three has
 * finished its first frame.
 */
export default function MicScene({
  playing,
  level,
  onSpin,
  reduced,
}: {
  playing: boolean
  level: () => number
  onSpin: () => void
  reduced: boolean
}) {
  const handle = useRef<MicHandle | null>(null)
  const drag = useRef<{ x: number; t: number; moved: boolean } | null>(null)

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, t: performance.now(), moved: false }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > 4) d.moved = true
    // Follow the finger: horizontal movement becomes angular velocity.
    handle.current?.spin(dx * 0.02)
    d.x = e.clientX
  }

  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current
    drag.current = null
    ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    // A tap counts as a spin too — it's the obvious thing to try on a phone.
    if (!d?.moved) handle.current?.spin(6)
    onSpin()
  }

  return (
    <div
      className="relative h-full w-full cursor-grab select-none active:cursor-grabbing"
      style={{ touchAction: 'pan-y' }}
      data-lenis-prevent
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (drag.current = null)}
      role="button"
      tabIndex={0}
      aria-label="Spin the microphone to play the selected singer"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handle.current?.spin(8)
          onSpin()
        }
      }}
    >
      <Canvas
        camera={{ position: [0, 0.1, 7.2], fov: 28 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        frameloop={reduced ? 'demand' : 'always'}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 4, 5]} intensity={1.1} color="#fff3e0" />
        <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#9fb4ff" />
        <pointLight position={[0, -1.5, 3]} intensity={0.6} color="#d48d46" />
        <MicModel handleRef={handle} />
        <Notes active={playing} level={level} />
      </Canvas>
    </div>
  )
}
