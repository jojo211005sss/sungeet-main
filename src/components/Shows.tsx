import { useEffect, useMemo, useState } from 'react'
import {
  EVENT_TYPE_LABEL,
  FALLBACK_SHOWS,
  fmtDay,
  fmtMonth,
  fmtWeekdayTime,
  type EventType,
  type Show,
} from '../data/shows'
import { getVisitorId } from '../lib/visitor'

const FILTER_THRESHOLD = 6

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`border px-3 py-1.5 font-sans text-[0.8rem] transition-colors ${
        active
          ? 'border-navy-950 bg-navy-950 text-cream-50'
          : 'border-navy-950/25 text-navy-950/70 hover:border-navy-950/60 hover:text-navy-950'
      }`}
    >
      {children}
    </button>
  )
}

function ShowRow({
  show,
  onRsvp,
  pending,
}: {
  show: Show
  onRsvp: (show: Show) => void
  pending: boolean
}) {
  return (
    <li className="border-t border-navy-950/15 first:border-t-0">
      <article className="grid grid-cols-[4.5rem_1fr] items-start gap-x-5 gap-y-4 py-7 sm:grid-cols-[6rem_1fr_auto] sm:gap-x-8">
        {/* Date block — the one place the display face gets to be loud. */}
        <div className="pt-1 text-navy-950">
          <div className="font-display text-[2.6rem] leading-[0.85] sm:text-[3.25rem]">
            {fmtDay(show.startsAt)}
          </div>
          <div className="mt-1 font-sans text-[0.78rem] tracking-[0.22em] text-rust-500">
            {fmtMonth(show.startsAt)}
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="font-display text-[1.55rem] leading-snug text-navy-950 sm:text-[1.9rem]">
            {show.venue}
          </h3>
          <p className="mt-1 font-sans text-[0.9rem] text-navy-950/65">
            {show.city} · {fmtWeekdayTime(show.startsAt)} ·{' '}
            <span className="text-rust-500">
              {EVENT_TYPE_LABEL[show.eventType]}
            </span>
          </p>
          {show.setName && (
            <p className="mt-3 font-display text-[1.05rem] italic text-navy-950/80">
              {show.setName}
            </p>
          )}
          {show.note && (
            <p className="mt-1.5 max-w-md font-sans text-[0.86rem] leading-relaxed text-navy-950/55">
              {show.note}
            </p>
          )}
        </div>

        <div className="col-span-2 flex flex-wrap items-center gap-4 sm:col-span-1 sm:justify-end sm:pt-2">
          <button
            type="button"
            onClick={() => onRsvp(show)}
            disabled={pending}
            aria-pressed={show.going}
            className={`min-w-[8.5rem] border px-4 py-2.5 font-sans text-[0.85rem] transition-colors disabled:opacity-50 ${
              show.going
                ? 'border-rust-500 bg-rust-500 text-cream-50'
                : 'border-navy-950/30 text-navy-950 hover:border-navy-950 hover:bg-navy-950 hover:text-cream-50'
            }`}
          >
            {show.going ? "You're going" : "I'm going"}
          </button>
          <span className="font-sans text-[0.8rem] text-navy-950/55">
            {show.rsvpCount} {show.rsvpCount === 1 ? 'person' : 'people'}
          </span>
          {show.ticketUrl && (
            <a
              href={show.ticketUrl}
              target="_blank"
              rel="noreferrer"
              className="font-sans text-[0.85rem] text-navy-950 underline decoration-rust-500 decoration-2 underline-offset-4 hover:text-rust-500"
            >
              Tickets
            </a>
          )}
        </div>
      </article>
    </li>
  )
}

export default function Shows() {
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingId, setPendingId] = useState<string | null>(null)
  // True when /api/shows was unreachable and we fell back to the seed. RSVPs
  // then stay local — posting them would only produce failed requests.
  const [offline, setOffline] = useState(false)
  const [city, setCity] = useState<string>('all')
  const [type, setType] = useState<EventType | 'all'>('all')

  useEffect(() => {
    let cancelled = false
    const visitor = getVisitorId()

    fetch(`/api/shows?visitor=${encodeURIComponent(visitor)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: { shows: Show[] }) => {
        if (!cancelled) setShows(data.shows)
      })
      .catch(() => {
        // No API in plain `vite dev`, or DATABASE_URL missing. Render the seed
        // so the section is never a blank slab.
        if (!cancelled) {
          setShows(FALLBACK_SHOWS)
          setOffline(true)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const cities = useMemo(
    () => Array.from(new Set(shows.map((s) => s.city))).sort(),
    [shows],
  )

  const visible = useMemo(
    () =>
      shows.filter(
        (s) =>
          (city === 'all' || s.city === city) &&
          (type === 'all' || s.eventType === type),
      ),
    [shows, city, type],
  )

  const showFilters = shows.length > FILTER_THRESHOLD

  async function handleRsvp(show: Show) {
    const next = !show.going
    setPendingId(show.id)

    // Optimistic — the button should answer immediately.
    setShows((prev) =>
      prev.map((s) =>
        s.id === show.id
          ? { ...s, going: next, rsvpCount: s.rsvpCount + (next ? 1 : -1) }
          : s,
      ),
    )

    if (offline) {
      setPendingId(null)
      return
    }

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          showId: show.id,
          visitorId: getVisitorId(),
          going: next,
        }),
      })
      if (!res.ok) throw new Error(String(res.status))
      const data: { rsvpCount: number } = await res.json()
      setShows((prev) =>
        prev.map((s) => (s.id === show.id ? { ...s, rsvpCount: data.rsvpCount } : s)),
      )
    } catch {
      // Roll back so the count never quietly lies.
      setShows((prev) =>
        prev.map((s) =>
          s.id === show.id
            ? { ...s, going: show.going, rsvpCount: show.rsvpCount }
            : s,
        ),
      )
    } finally {
      setPendingId(null)
    }
  }

  return (
    <section
      id="shows"
      data-nav="light"
      aria-labelledby="shows-heading"
      className="bg-cream-50 text-navy-950"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
        <header className="flex flex-col gap-6 border-b-2 border-navy-950 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="shows-heading"
              className="font-display text-section leading-[0.95]"
            >
              Aage kahan baj rahe hain
            </h2>
            <p className="mt-3 max-w-md font-sans text-[0.95rem] leading-relaxed text-navy-950/60">
              Delhi NCR, mostly. Café nights are open to anyone — private and
              community dates are listed so you know where we are.
            </p>
          </div>
          <p className="font-sans text-[0.8rem] tracking-[0.2em] text-navy-950/50">
            {visible.length} {visible.length === 1 ? 'date' : 'dates'}
          </p>
        </header>

        {showFilters && (
          <div className="flex flex-col gap-4 border-b border-navy-950/15 py-5 sm:flex-row sm:items-center sm:gap-8">
            <fieldset className="flex flex-wrap items-center gap-2">
              <legend className="sr-only">Filter by city</legend>
              <span className="mr-1 font-sans text-[0.78rem] tracking-[0.18em] text-navy-950/45">
                city
              </span>
              <Chip active={city === 'all'} onClick={() => setCity('all')}>
                All
              </Chip>
              {cities.map((c) => (
                <Chip key={c} active={city === c} onClick={() => setCity(c)}>
                  {c}
                </Chip>
              ))}
            </fieldset>

            <fieldset className="flex flex-wrap items-center gap-2">
              <legend className="sr-only">Filter by event type</legend>
              <span className="mr-1 font-sans text-[0.78rem] tracking-[0.18em] text-navy-950/45">
                type
              </span>
              <Chip active={type === 'all'} onClick={() => setType('all')}>
                All
              </Chip>
              {(Object.keys(EVENT_TYPE_LABEL) as EventType[]).map((t) => (
                <Chip key={t} active={type === t} onClick={() => setType(t)}>
                  {EVENT_TYPE_LABEL[t]}
                </Chip>
              ))}
            </fieldset>
          </div>
        )}

        {loading ? (
          <p className="py-16 font-sans text-[0.9rem] text-navy-950/50">
            Loading dates…
          </p>
        ) : visible.length === 0 ? (
          <p className="py-16 font-display text-2xl text-navy-950/60">
            Nothing listed for that yet. Try another city.
          </p>
        ) : (
          <ul aria-live="polite">
            {visible.map((show) => (
              <ShowRow
                key={show.id}
                show={show}
                pending={pendingId === show.id}
                onRsvp={handleRsvp}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
