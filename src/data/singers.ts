/**
 * The hero's artists. Curated separately from Teams — "who do you want to
 * hear", not the roster.
 *
 * PLACEHOLDERS: real cut-outs from show photos, but the clips are synthesised
 * samples and the names are not filled in yet. Replace with real artists, real die-cut photos (person isolated,
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
  { id: 'artist-1', name: 'Sung Sungeet', role: 'vocals', image: '/singers/artist-1.webp', audio: '/audio/sample-1.mp3' },
  { id: 'artist-2', name: 'Sung Sungeet', role: 'vocals', image: '/singers/artist-2.webp', audio: '/audio/sample-2.mp3' },
  { id: 'artist-3', name: 'Sung Sungeet', role: 'vocals', image: '/singers/artist-3.webp', audio: '/audio/sample-3.mp3' },
]
