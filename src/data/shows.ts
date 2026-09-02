export type EventType = 'cafe' | 'private' | 'community'

export type LineupEntry = { name: string; role: string }

export type Show = {
  id: string
  startsAt: string
  venue: string
  city: string
  eventType: EventType
  setName: string | null
  note: string | null
  ticketUrl: string | null
  /** Portrait event poster. Null renders the typographic card instead. */
  posterUrl: string | null
  /** Which team is playing. Null if the staff tool hasn't assigned one yet. */
  teamSlug: string | null
  teamName: string | null
  /** Who actually plays this date — the team roster, or a per-date override. */
  lineup: LineupEntry[]
  lineupIsOverride: boolean
}

/** Live RSVP state, fetched separately from the day-cached show list. */
export type RsvpState = Record<string, { count: number; going: boolean }>

export const EVENT_TYPE_LABEL: Record<EventType, string> = {
  cafe: 'Café',
  private: 'Private event',
  community: 'Community / religious',
}

const IST = 'Asia/Kolkata'

/**
 * The calendar keys everything by IST civil date, so a 9pm Delhi show never
 * lands on the previous day for a viewer in another timezone.
 * en-CA formats as YYYY-MM-DD.
 */
export const istDateKey = (iso: string) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: IST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(iso))

export const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: IST,
  }).format(new Date(iso))

/** dd.mm.yy — the compact form the event cards use. */
export const fmtShortDate = (iso: string) => {
  const p = new Intl.DateTimeFormat('en-GB', {
    timeZone: IST,
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }).formatToParts(new Date(iso))
  const get = (type: string) => p.find((x) => x.type === type)?.value ?? ''
  return `${get('day')}.${get('month')}.${get('year')}`
}

export const fmtWeekday = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { weekday: 'long', timeZone: IST }).format(
    new Date(iso),
  )

export const fmtLongDate = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: IST,
  }).format(new Date(iso))

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** Sunday-first, matching the calendars people use here. */
export const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

/**
 * Used only when /api/shows is unreachable — `npm run dev` with no
 * DATABASE_URL. Mirrors db/seed.sql so the calendar is never empty.
 */
type Seed = [string, string, string, EventType, string, string, string, string | null]

const SEED: Seed[] = [
  ['2026-09-08T15:00:00.000Z', 'Chords & Coffee', 'New Delhi', 'cafe', 'tuesday-trio', 'Open jamming', 'Every Tuesday. Put your name down at the counter.', null],
  ['2026-09-12T15:00:00.000Z', 'Depot48', 'New Delhi', 'cafe', 'full-band', 'Jazz standards, Sufi second set', 'Two sets, no cover. Kitchen open till late.', null],
  ['2026-09-15T15:00:00.000Z', 'Chords & Coffee', 'New Delhi', 'cafe', 'tuesday-trio', 'Open jamming', 'Every Tuesday. Put your name down at the counter.', null],
  ['2026-09-19T15:30:00.000Z', 'The Piano Man', 'New Delhi', 'cafe', 'full-band', 'Late-night trio', 'Doors at 20:00. Seating is first come.', 'https://example.com/tickets/piano-man'],
  ['2026-09-22T15:00:00.000Z', 'Chords & Coffee', 'New Delhi', 'cafe', 'tuesday-trio', 'Open jamming', 'Every Tuesday. Put your name down at the counter.', null],
  ['2026-09-27T12:30:00.000Z', 'Private residence', 'Gurugram', 'private', 'full-band', 'Wedding sangeet', 'Closed event — listed so you know where we are.', null],
  ['2026-09-29T15:00:00.000Z', 'Chords & Coffee', 'New Delhi', 'cafe', 'tuesday-trio', 'Open jamming', 'Every Tuesday. Put your name down at the counter.', null],
  ['2026-10-04T14:00:00.000Z', 'Sufi night, Nizamuddin', 'New Delhi', 'community', 'sufi-collective', 'Qawwali-led set', 'Free entry, seating on the floor.', null],
  ['2026-10-11T14:30:00.000Z', 'Cafe Lota', 'New Delhi', 'cafe', 'full-band', 'Bollywood, reworked', 'One long set, 20:00 to 22:30.', null],
  ['2026-10-18T12:00:00.000Z', 'Corporate offsite', 'Noida', 'private', 'tuesday-trio', 'Acoustic duo', 'Closed event.', null],
  ['2026-10-25T13:30:00.000Z', 'Sector 29 amphitheatre', 'Gurugram', 'community', 'full-band', 'Diwali mela set', 'Open air. Bring something to sit on.', null],
  ['2026-11-07T15:30:00.000Z', 'Summer House Cafe', 'New Delhi', 'cafe', 'full-band', 'Full band', 'Cover charge at the door, redeemable.', 'https://example.com/tickets/summer-house'],
  ['2026-11-15T13:00:00.000Z', 'Gurudwara langar hall', 'Faridabad', 'community', 'sufi-collective', 'Shabad kirtan', 'All welcome.', null],
]

const SEED_ROSTERS: Record<string, LineupEntry[]> = {
  'tuesday-trio': [
    { name: 'Aditya', role: 'vocals, guitar' },
    { name: 'Rhea', role: 'vocals' },
    { name: 'Kabir', role: 'cajon' },
  ],
  'sufi-collective': [
    { name: 'Imran', role: 'lead vocals' },
    { name: 'Sahil', role: 'harmonium' },
    { name: 'Danish', role: 'tabla' },
    { name: 'Rhea', role: 'vocals' },
  ],
  'full-band': [
    { name: 'Aditya', role: 'vocals, guitar' },
    { name: 'Rhea', role: 'vocals' },
    { name: 'Kabir', role: 'drums' },
    { name: 'Naman', role: 'bass' },
    { name: 'Sahil', role: 'keys' },
    { name: 'Tara', role: 'saxophone' },
  ],
}

const SEED_TEAM_NAMES: Record<string, string> = {
  'tuesday-trio': 'The Tuesday Trio',
  'sufi-collective': 'Sufi Collective',
  'full-band': 'The Full Band',
}

export const FALLBACK_SHOWS: Show[] = SEED.map(
  ([startsAt, venue, city, eventType, teamSlug, setName, note, ticketUrl], i) => {
    // Mirrors the seed's lineup override: Rhea sits out The Piano Man.
    const isOverride = venue === 'The Piano Man'
    const roster = SEED_ROSTERS[teamSlug] ?? []
    return {
      id: `fallback-${i + 1}`,
      startsAt,
      venue,
      city,
      eventType,
      setName,
      note,
      ticketUrl,
      posterUrl: null, // no artwork supplied yet — see README
      teamSlug,
      teamName: SEED_TEAM_NAMES[teamSlug] ?? null,
      lineup: isOverride ? roster.filter((m) => m.name !== 'Rhea') : roster,
      lineupIsOverride: isOverride,
    }
  },
)

/** Deterministic stand-in counts so the fallback view isn't all zeroes. */
export const FALLBACK_RSVPS: RsvpState = Object.fromEntries(
  FALLBACK_SHOWS.map((s, i) => [s.id, { count: 7 + ((i * 13) % 90), going: false }]),
)
