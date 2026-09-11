/**
 * The hero's singer carousel. Curated separately from the Teams data on
 * purpose — this is "who do you want to hear", not the roster.
 *
 * PLACEHOLDERS. Cut-outs are pulled from event footage and the clips are
 * synthesised; every name is invented. Replace with real singers, real
 * die-cut photos (person isolated, transparent background) and their clips.
 */
export type Singer = {
  id: string
  name: string
  role: string
  /** Transparent WebP/PNG of the person alone — rendered as a sticker. */
  image: string
  /** 10–15 second clip. */
  audio: string
}

export const SINGERS: Singer[] = [
  { id: 'aditya', name: 'Aditya', role: 'vocals', image: '/singers/aditya.webp', audio: '/audio/sample-1.mp3' },
  { id: 'imran', name: 'Imran', role: 'lead vocals', image: '/singers/imran.webp', audio: '/audio/sample-2.mp3' },
  { id: 'kabir', name: 'Kabir', role: 'guitar, vocals', image: '/singers/kabir.webp', audio: '/audio/sample-3.mp3' },
]
