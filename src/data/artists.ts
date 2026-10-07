import type { PassMedia } from '../components/Teams'

/**
 * Artists on the roster who aren't in a lineup yet. Everyone in a team comes
 * from the database; these are added on top on the artists page.
 */
export type SoloArtist = { name: string; role: string; photoUrl: string | null; media: PassMedia | null }

export const SOLO_ARTISTS: SoloArtist[] = [
  // Placeholder clip until Dhruv's own recording is in.
  { name: 'Dhruv', role: 'vocals', photoUrl: '/artists/dhruv.webp', media: { kind: 'audio', src: '/audio/sample-2.mp3' } },
]

/**
 * A person's own clip, used on their badge instead of their team's showreel.
 * Keyed by the name as it appears on the site.
 */
export const ARTIST_CLIPS: Record<string, PassMedia> = {
  Ayush: { kind: 'audio', src: '/audio/ayush.m4a' },
}
