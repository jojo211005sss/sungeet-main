/**
 * The hero's artists. Curated separately from Teams — "who do you want to
 * hear", not the roster.
 *
 * PLACEHOLDERS: cut-outs pulled from event footage, clips synthesised, names
 * invented. Replace with real artists, real die-cut photos (person isolated,
 * transparent background) and their clips.
 */
export type Singer = {
  id: string
  name: string
  role: string
  image: string
  audio: string
}

export const SINGERS: Singer[] = [
  { id: 'aditya', name: 'Aditya', role: 'vocals, guitar', image: '/singers/aditya.webp', audio: '/audio/sample-1.mp3' },
  { id: 'imran', name: 'Imran', role: 'lead vocals', image: '/singers/imran.webp', audio: '/audio/sample-2.mp3' },
  { id: 'kabir', name: 'Kabir', role: 'guitar', image: '/singers/kabir.webp', audio: '/audio/sample-3.mp3' },
  { id: 'rhea', name: 'Rhea', role: 'vocals', image: '/singers/rhea.webp', audio: '/audio/sample-1.mp3' },
  { id: 'tara', name: 'Tara', role: 'percussion', image: '/singers/tara.webp', audio: '/audio/sample-2.mp3' },
]
