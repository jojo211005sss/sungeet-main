/**
 * Placeholder content for the member portal. Every word and every clip below
 * is invented — nothing here is a real quote from a real person. Replace
 * wholesale once there's actual material. See README.
 */

export type Clip = {
  id: string
  title: string
  context: string
  duration: string
  /** null renders the placeholder face; no real media is wired in. */
  src: string | null
}

export const CLIPS: Clip[] = [
  { id: 'c1', title: 'Soundcheck, Chords & Coffee', context: 'Tuesday, before doors', duration: '4:12', src: null },
  { id: 'c2', title: 'Take four of the qawwali', context: 'Nizamuddin', duration: '7:38', src: null },
  { id: 'c3', title: 'The van, 2am', context: 'Gurugram to Noida', duration: '2:05', src: null },
  { id: 'c4', title: 'Arguing about the setlist', context: 'Rehearsal room', duration: '5:50', src: null },
  { id: 'c5', title: 'Load-out', context: 'Summer House', duration: '3:19', src: null },
  { id: 'c6', title: 'The one that fell apart', context: 'Somewhere in Aerocity', duration: '6:44', src: null },
]

export type CastStory = {
  name: string
  role: string
  pull: string
  body: string
}

export const CAST: CastStory[] = [
  {
    name: 'Aditya',
    role: 'vocals, guitar',
    pull: 'Placeholder pull-quote — replace with their own words.',
    body: 'Placeholder. This is where each person writes, in their own words, what they were doing before this and how they ended up here. Two or three short paragraphs, first person, unedited.',
  },
  {
    name: 'Rhea',
    role: 'vocals',
    pull: 'Placeholder pull-quote — replace with their own words.',
    body: 'Placeholder. Same again — background, the first night they turned up, what keeps them coming back.',
  },
  {
    name: 'Kabir',
    role: 'cajon, drums',
    pull: 'Placeholder pull-quote — replace with their own words.',
    body: 'Placeholder. Worth recording these as voice notes and transcribing; people write stiffly and talk well.',
  },
  {
    name: 'Imran',
    role: 'lead vocals',
    pull: 'Placeholder pull-quote — replace with their own words.',
    body: 'Placeholder. For the Sufi side of the room, where that training came from.',
  },
]

export type Beat = { year: string; title: string; body: string }

export const ORIGIN: Beat[] = [
  { year: '—', title: 'The first jam', body: 'Placeholder. Where it actually started, who was in the room, and how many people came.' },
  { year: '—', title: 'The rooms that said no', body: 'Placeholder. The cafés that turned it down, and the one that did not.' },
  { year: '—', title: 'Har Tuesday', body: 'Placeholder. How a one-off became a standing night.' },
  { year: '—', title: 'Now', body: 'Placeholder. Private events, club dates, and a community that outgrew the corner it started in.' },
]
