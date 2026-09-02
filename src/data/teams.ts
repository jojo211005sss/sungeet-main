import type { LineupEntry } from './shows'

export type Team = {
  slug: string
  name: string
  tagline: string | null
  blurb: string | null
  /** null renders the placeholder tile — see README, media is still pending. */
  photoUrl: string | null
  videoUrl: string | null
  members: (LineupEntry & { photoUrl?: string | null })[]
}

export const FALLBACK_TEAMS: Team[] = [
  {
    slug: 'tuesday-trio',
    name: 'The Tuesday Trio',
    tagline: 'The open-jam house band',
    blurb:
      'Three of us hold the room down every Tuesday so anyone who wants the mic can take it. Jazz standards early, whatever the room asks for after.',
    photoUrl: null,
    videoUrl: null,
    members: [
      { name: 'Aditya', role: 'vocals, guitar' },
      { name: 'Rhea', role: 'vocals' },
      { name: 'Kabir', role: 'cajon' },
    ],
  },
  {
    slug: 'sufi-collective',
    name: 'Sufi Collective',
    tagline: 'Qawwali-led, harmonium forward',
    blurb:
      'Built for dargahs, gurudwaras and the second half of a long night. Acoustic where the space needs it.',
    photoUrl: null,
    videoUrl: null,
    members: [
      { name: 'Imran', role: 'lead vocals' },
      { name: 'Sahil', role: 'harmonium' },
      { name: 'Danish', role: 'tabla' },
      { name: 'Rhea', role: 'vocals' },
    ],
  },
  {
    slug: 'full-band',
    name: 'The Full Band',
    tagline: 'Six pieces, full PA',
    blurb:
      'Club dates, awards nights and weddings that want the volume. Bollywood reworked, jazz heads, and a horn section when the budget allows.',
    photoUrl: null,
    videoUrl: null,
    members: [
      { name: 'Aditya', role: 'vocals, guitar' },
      { name: 'Rhea', role: 'vocals' },
      { name: 'Kabir', role: 'drums' },
      { name: 'Naman', role: 'bass' },
      { name: 'Sahil', role: 'keys' },
      { name: 'Tara', role: 'saxophone' },
    ],
  },
]

/** Two-letter monogram for the placeholder tile: "The Full Band" → "FB". */
export function monogram(name: string): string {
  const words = name
    .replace(/^(the|a)\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}
