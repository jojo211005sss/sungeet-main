import type { SceneArt } from '../data/sceneArt'

/**
 * One scene of the walkthrough.
 *
 * Each layer carries `data-depth` (0 = far, 1+ = near); ScrollWalkthrough reads
 * those to drive the parallax. To swap in a video clip instead of a still,
 * replace the <img> with <video muted playsInline> and leave the wrapper and
 * its data-depth alone.
 */
export function PhotoScene({
  art,
  index,
  eager,
}: {
  art: SceneArt
  index: number
  eager: boolean
}) {
  return (
    <>
      {/* Near: the photograph, pushing in. */}
      <div data-depth={1} className="absolute inset-0 will-change-transform">
        <img
          src={art.src}
          alt=""
          decoding="async"
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={index === 0 ? 'high' : 'low'}
          className="h-full w-full object-cover"
          style={{ objectPosition: art.focal }}
        />
        {/* Navy grade — pulls the phone-video colour toward the brand ground. */}
        <div
          className="absolute inset-0 mix-blend-color"
          style={{ background: 'rgba(9,25,50,0.32)' }}
        />
      </div>

      {/* A soft light source over the frame, drifting slower than the photo.
          Placed to match where the light actually is in each shot. */}
      <div
        data-depth={0.3}
        className="absolute inset-0 mix-blend-screen will-change-transform"
        style={{
          background: `radial-gradient(58% 52% at ${art.bloom.x} ${art.bloom.y}, ${art.bloom.color} 0%, transparent 72%)`,
        }}
      />
    </>
  )
}
