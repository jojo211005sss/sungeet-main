export type EventType = 'cafe' | 'private' | 'community'

export type Show = {
  id: string
  startsAt: string
  venue: string
  city: string
  eventType: EventType
  setName: string | null
  note: string | null
  ticketUrl: string | null
  rsvpCount: number
  going: boolean
}

export const EVENT_TYPE_LABEL: Record<EventType, string> = {
  cafe: 'Café',
  private: 'Private event',
  community: 'Community / religious',
}

/**
 * Used only when /api/shows is unreachable — i.e. `npm run dev` without a
 * DATABASE_URL. Mirrors db/seed.sql so the page is never empty in local dev.
 */
export const FALLBACK_SHOWS: Show[] = [
  ['2026-09-12T15:00:00.000Z', 'Depot48', 'New Delhi', 'cafe', 'Jazz standards, Sufi second set', 'Two sets, no cover. Kitchen open till late.', null, 34],
  ['2026-09-19T15:30:00.000Z', 'The Piano Man', 'New Delhi', 'cafe', 'Late-night trio', 'Doors at 20:00. Seating is first come.', 'https://example.com/tickets/piano-man', 58],
  ['2026-09-27T12:30:00.000Z', 'Private residence', 'Gurugram', 'private', 'Wedding sangeet', 'Closed event — listed so you know where we are.', null, 4],
  ['2026-10-04T14:00:00.000Z', 'Sufi night, Nizamuddin', 'New Delhi', 'community', 'Qawwali-led set', 'Community gathering. Free entry, seating on the floor.', null, 112],
  ['2026-10-11T14:30:00.000Z', 'Cafe Lota', 'New Delhi', 'cafe', 'Bollywood, reworked', 'One long set, 20:00 to 22:30.', null, 27],
  ['2026-10-18T12:00:00.000Z', 'Corporate offsite', 'Noida', 'private', 'Acoustic duo', 'Closed event.', null, 2],
  ['2026-10-25T13:30:00.000Z', 'Sector 29 amphitheatre', 'Gurugram', 'community', 'Diwali mela set', 'Open air. Bring something to sit on.', null, 76],
  ['2026-11-07T15:30:00.000Z', 'Summer House Cafe', 'New Delhi', 'cafe', 'Full band', 'Cover charge at the door, redeemable.', 'https://example.com/tickets/summer-house', 41],
  ['2026-11-15T13:00:00.000Z', 'Gurudwara langar hall', 'Faridabad', 'community', 'Shabad kirtan', 'Community event. All welcome.', null, 19],
].map(
  ([startsAt, venue, city, eventType, setName, note, ticketUrl, rsvpCount], i) =>
    ({
      id: `fallback-${i + 1}`,
      startsAt,
      venue,
      city,
      eventType,
      setName,
      note,
      ticketUrl,
      rsvpCount,
      going: false,
    }) as Show,
)

const IST = 'Asia/Kolkata'

export const fmtDay = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { day: '2-digit', timeZone: IST }).format(new Date(iso))

export const fmtMonth = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', { month: 'short', timeZone: IST })
    .format(new Date(iso))
    .toLowerCase()

export const fmtWeekdayTime = (iso: string) =>
  new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: IST,
  }).format(new Date(iso))
