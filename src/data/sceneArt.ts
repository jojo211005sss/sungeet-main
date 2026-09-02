/**
 * Which image belongs to which moment, and where the light is in each frame.
 *
 * These are real frames from the band's own footage (see README → "Where the
 * images came from"). They are stills, not a frame sequence, so the walkthrough
 * uses crossfade + push-in parallax rather than a canvas scrub — a scrub needs
 * continuous clips of each moment, which the source recording does not contain.
 */

export type SceneArt = {
  src: string
  /** object-position, so the subject survives any viewport aspect ratio. */
  focal: string
  /** Warm bloom placed to match where the light actually is in the frame. */
  bloom: { x: string; y: string; color: string }
}

export const SCENE_ART: SceneArt[] = [
  {
    src: '/scenes/01-room.jpg',
    focal: '50% 62%',
    bloom: { x: '62%', y: '30%', color: 'rgba(212,141,70,0.42)' },
  },
  {
    src: '/scenes/02-forward.jpg',
    focal: '58% 42%',
    bloom: { x: '30%', y: '22%', color: 'rgba(227,171,109,0.38)' },
  },
  {
    src: '/scenes/03-stage.jpg',
    focal: '52% 40%',
    bloom: { x: '50%', y: '18%', color: 'rgba(212,141,70,0.5)' },
  },
  {
    src: '/scenes/04-theroom.jpg',
    focal: '48% 50%',
    bloom: { x: '70%', y: '40%', color: 'rgba(170,85,56,0.42)' },
  },
  {
    src: '/scenes/05-after.jpg',
    focal: '55% 45%',
    bloom: { x: '25%', y: '30%', color: 'rgba(22,49,92,0.55)' },
  },
]
