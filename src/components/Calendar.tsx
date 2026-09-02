import { useEffect, useMemo, useRef, useState } from 'react'
import {
  EVENT_TYPE_LABEL,
  MONTH_NAMES,
  WEEKDAY_INITIALS,
  fmtShortDate,
  fmtTime,
  fmtWeekday,
  istDateKey,
  type EventType,
  type Show,
} from '../data/shows'
import type { SiteData } from '../lib/useSiteData'
import { useReducedMotion } from '../lib/useMediaQuery'

type Props = SiteData & {
  teamFilter: string | 'all'
  onTeamFilter: (slug: string | 'all') => void
}

const pad = (n: number) => String(n).padStart(2, '0')
const keyOf = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`

/* Two-letter weekday heads for the day strip, Sunday-first. */
const WD2 = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

/** Thin gold rule, used everywhere in this section. */
const BOX = 'border border-amber-400/40'
const LABEL = 'font-sans text-[0.65rem] uppercase tracking-[0.2em]'

/* --------------------------------------------------------- filter box ---- */

function FilterBox({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <label className={`${BOX} flex min-w-0 flex-1 items-center gap-3 px-4 py-3`}>
      <span className={`${LABEL} shrink-0 text-amber-400/60`}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${LABEL} min-w-0 flex-1 cursor-pointer appearance-none bg-transparent text-cream-50 outline-none`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-navy-900 text-cream-50">
            {o.label}
          </option>
        ))}
      </select>
      <span aria-hidden="true" className="shrink-0 text-[0.6rem] text-amber-400/60">
        ▼
      </span>
    </label>
  )
}

/* --------------------------------------------------------- event card ---- */

function Poster({ show }: { show: Show }) {
  if (show.posterUrl) {
    return (
      <img
        src={show.posterUrl}
        alt={`Poster for ${show.venue}`}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
    )
  }

  // No artwork supplied — a typographic card rather than a fake poster.
  return (
    <div className="relative flex h-full min-h-[22rem] w-full flex-col items-center justify-center overflow-hidden bg-navy-900 px-6 py-10 text-center">
      <span className={`${LABEL} text-amber-400/70`}>Sung Sungeet</span>
      <span className="mt-6 font-display text-[2.4rem] leading-[0.95] text-cream-50 sm:text-[3rem]">
        {show.venue}
      </span>
      {show.setName && (
        <span className="mt-4 font-display text-[1.15rem] italic text-amber-400">
          {show.setName}
        </span>
      )}
      <span className="mt-6 font-sans text-[0.8rem] tracking-[0.18em] text-cream-400">
        {fmtShortDate(show.startsAt)}
      </span>
      <span
        aria-hidden="true"
        className={`${LABEL} absolute bottom-4 left-0 right-0 text-cream-50/30`}
      >
        poster pending
      </span>
    </div>
  )
}

function InfoBox({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`${BOX} px-4 py-3 ${className}`}>{children}</div>
}

function EventCard({
  show,
  rsvp,
  onRsvp,
}: {
  show: Show
  rsvp: { count: number; going: boolean }
  onRsvp: () => void
}) {
  return (
    <article className={`${BOX} bg-navy-950 p-2 sm:p-3`}>
      <div className="grid gap-2 sm:gap-3 lg:grid-cols-[minmax(0,20rem)_1fr]">
        {/* Info column — a stack of boxes, as in the reference. */}
        <div className="flex flex-col gap-2 sm:gap-3">
          <InfoBox className="text-center">
            <p className={`${LABEL} text-amber-400/80`}>Sung Sungeet</p>
            <p className={`${LABEL} mt-1 text-cream-400`}>{show.city}</p>
          </InfoBox>

          <InfoBox className="text-center">
            <h4 className="font-display text-[1.6rem] leading-tight text-cream-50">
              {show.venue}
            </h4>
          </InfoBox>

          <InfoBox className="text-center">
            <p className={`${LABEL} text-cream-50`}>{fmtWeekday(show.startsAt)}</p>
            <p className="mt-1 font-display text-[1.5rem] text-cream-50">
              {fmtShortDate(show.startsAt)}
            </p>
            <p className={`${LABEL} mt-1 text-cream-400`}>
              Seating time {fmtTime(show.startsAt)}
            </p>
          </InfoBox>

          <InfoBox className="text-center">
            <p className={`${LABEL} text-amber-400`}>
              {EVENT_TYPE_LABEL[show.eventType]}
            </p>
            {show.setName && (
              <p className="mt-1 font-display text-[1.05rem] italic text-cream-200">
                {show.setName}
              </p>
            )}
          </InfoBox>

          {show.teamName && (
            <InfoBox>
              <p className={`${LABEL} text-amber-400/60`}>Playing this date</p>
              <p className="mt-2 font-display text-[1.25rem] text-cream-50">
                {show.teamName}
              </p>
              {show.lineup.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {show.lineup.map((m) => (
                    <li
                      key={m.name + m.role}
                      className="flex items-baseline justify-between gap-3 font-sans text-[0.8rem]"
                    >
                      <span className="text-cream-50">{m.name}</span>
                      <span className="text-cream-400">{m.role}</span>
                    </li>
                  ))}
                </ul>
              )}
              {show.lineupIsOverride && (
                <p className="mt-2 font-sans text-[0.7rem] text-cream-400/70">
                  Lineup adjusted for this date.
                </p>
              )}
            </InfoBox>
          )}

          {show.note && (
            <InfoBox>
              <p className="font-sans text-[0.82rem] leading-relaxed text-cream-400">
                {show.note}
              </p>
            </InfoBox>
          )}

          <button
            type="button"
            onClick={onRsvp}
            aria-pressed={rsvp.going}
            className={`${LABEL} w-full px-4 py-3.5 transition-colors ${
              rsvp.going
                ? 'bg-amber-400 text-navy-950'
                : 'border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-navy-950'
            }`}
          >
            {rsvp.going ? "You're going" : "I'm going"}
          </button>

          <p className={`${LABEL} text-center text-cream-400`}>
            {rsvp.count} {rsvp.count === 1 ? 'person' : 'people'} going
          </p>

          {show.ticketUrl && (
            <a
              href={show.ticketUrl}
              target="_blank"
              rel="noreferrer"
              className={`${LABEL} ${BOX} px-4 py-3 text-center text-cream-50 transition-colors hover:border-amber-400 hover:text-amber-400`}
            >
              Book tickets
            </a>
          )}
        </div>

        {/* Poster */}
        <div className="min-h-[22rem] overflow-hidden lg:min-h-0">
          <Poster show={show} />
        </div>
      </div>
    </article>
  )
}

/* ------------------------------------------------------------- export ---- */

export default function Calendar({
  shows,
  teams,
  rsvps,
  loading,
  offline,
  toggleRsvp,
  teamFilter,
  onTeamFilter,
}: Props) {
  const reduced = useReducedMotion()

  const [city, setCity] = useState<string>('all')
  const [type, setType] = useState<EventType | 'all'>('all')
  const [selected, setSelected] = useState<string | null>(null)
  const backRef = useRef<HTMLButtonElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)

  const visible = useMemo(
    () =>
      shows.filter(
        (s) =>
          (city === 'all' || s.city === city) &&
          (type === 'all' || s.eventType === type) &&
          (teamFilter === 'all' || s.teamSlug === teamFilter),
      ),
    [shows, city, type, teamFilter],
  )

  const byDate = useMemo(() => {
    const map = new Map<string, Show[]>()
    for (const s of visible) {
      const k = istDateKey(s.startsAt)
      const list = map.get(k)
      if (list) list.push(s)
      else map.set(k, [s])
    }
    return map
  }, [visible])

  // Only months that actually contain shows — no paging into empty months.
  const months = useMemo(() => {
    const set = new Set<string>()
    for (const s of shows) set.add(istDateKey(s.startsAt).slice(0, 7))
    return [...set].sort()
  }, [shows])

  const [monthIdx, setMonthIdx] = useState(0)
  const cursor = months[Math.min(monthIdx, months.length - 1)]
  const [year, month] = cursor
    ? [Number(cursor.slice(0, 4)), Number(cursor.slice(5, 7)) - 1]
    : [new Date().getFullYear(), new Date().getMonth()]

  // Pure calendar maths in UTC so the local timezone can't shift the grid.
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay()
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()

  const cities = useMemo(() => [...new Set(shows.map((s) => s.city))].sort(), [shows])

  const monthCount = useMemo(
    () => visible.filter((s) => istDateKey(s.startsAt).slice(0, 7) === cursor).length,
    [visible, cursor],
  )

  const goToMonth = (i: number) => {
    setMonthIdx(i)
    setSelected(null)
  }

  // Cheap enough to just compute — at most 31 map lookups per render, and
  // memoizing it defeats the React Compiler on derived month values.
  let firstShowKey: string | null = null
  for (let d = 1; d <= daysInMonth && !firstShowKey; d++) {
    const k = keyOf(year, month, d)
    if (byDate.has(k)) firstShowKey = k
  }

  useEffect(() => {
    const el = stripRef.current
    if (!el) return
    const key = selected ?? firstShowKey
    if (!key) return
    const target = el.querySelector<HTMLElement>(`[data-daykey="${key}"]`)
    if (!target) return
    // scrollLeft, not scrollIntoView — the latter drags the whole page.
    el.scrollLeft = target.offsetLeft - el.clientWidth / 2 + target.clientWidth / 2
  }, [selected, firstShowKey])

  const selectedShows = selected ? (byDate.get(selected) ?? []) : []
  const zoom = reduced ? '' : 'u-zoom'

  return (
    <section
      id="shows"
      aria-labelledby="shows-heading"
      className="scroll-mt-16 border-t u-rule bg-navy-950 text-cream-50"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-8 sm:py-28">
        <header className="mb-8">
          <h2 id="shows-heading" className="font-display text-section leading-[0.95]">
            Aage kahan baj rahe hain
          </h2>
          <p className="mt-3 max-w-lg font-sans text-[0.95rem] leading-relaxed text-cream-400">
            Pick a date to see who&rsquo;s playing. Café nights are open to
            anyone — private and community dates are listed so you know where we
            are.
          </p>
        </header>

        {loading ? (
          <p className={`${LABEL} py-20 text-cream-400`}>Loading dates…</p>
        ) : months.length === 0 ? (
          <p className="py-20 font-display text-2xl text-cream-400">
            No dates up yet. Check back soon.
          </p>
        ) : (
          <>
            {/* ------------------------------------------------ day strip -- */}
            <div className="mb-2 flex justify-end sm:mb-3">
              <div className={`${BOX} flex items-center gap-4 px-4 py-2.5`}>
                <button
                  type="button"
                  onClick={() => goToMonth(Math.max(0, monthIdx - 1))}
                  disabled={monthIdx === 0}
                  aria-label="Previous month"
                  className={`${LABEL} px-1 text-amber-400 disabled:opacity-25`}
                >
                  ←
                </button>
                <span className={`${LABEL} whitespace-nowrap text-cream-50`}>
                  {MONTH_NAMES[month]} {year}
                </span>
                <button
                  type="button"
                  onClick={() => goToMonth(Math.min(months.length - 1, monthIdx + 1))}
                  disabled={monthIdx >= months.length - 1}
                  aria-label="Next month"
                  className={`${LABEL} px-1 text-amber-400 disabled:opacity-25`}
                >
                  →
                </button>
              </div>
            </div>

            <div ref={stripRef} className={`${BOX} u-noscrollbar overflow-x-auto`}>
              <ol className="flex min-w-max sm:min-w-0">
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const k = keyOf(year, month, day)
                  const has = byDate.has(k)
                  const isSel = selected === k
                  const wd = WD2[new Date(Date.UTC(year, month, day)).getUTCDay()]

                  return (
                    <li
                      key={k}
                      className="shrink-0 border-r border-amber-400/30 last:border-r-0 sm:min-w-0 sm:flex-1 sm:shrink"
                    >
                      <button
                        type="button"
                        disabled={!has}
                        onClick={() => setSelected(isSel ? null : k)}
                        aria-pressed={isSel}
                        data-daykey={k}
                        aria-label={
                          has
                            ? `${day} ${MONTH_NAMES[month]}: ${byDate
                                .get(k)!
                                .map((s) => s.venue)
                                .join(', ')}`
                            : `${day} ${MONTH_NAMES[month]}, no show`
                        }
                        className={`flex w-[2.9rem] flex-col items-center gap-0.5 px-0.5 py-2.5 transition-colors sm:w-full ${
                          isSel
                            ? 'bg-amber-400 text-navy-950'
                            : has
                              ? 'text-cream-50 hover:bg-amber-400/20'
                              : 'cursor-default text-cream-50/30'
                        }`}
                      >
                        <span
                          className={`font-sans text-[0.58rem] uppercase tracking-[0.12em] ${
                            isSel ? '' : 'opacity-70'
                          }`}
                        >
                          {wd}
                        </span>
                        <span className="font-sans text-[0.9rem] tabular-nums">
                          {pad(day)}
                        </span>
                        <span
                          aria-hidden="true"
                          className={`h-0.5 w-3.5 ${
                            has && !isSel ? 'bg-amber-400' : 'bg-transparent'
                          }`}
                        />
                      </button>
                    </li>
                  )
                })}
              </ol>
            </div>

            {/* --------------------------------------------------- filters -- */}
            <div className="mt-2 flex flex-col gap-2 sm:mt-3 sm:flex-row sm:gap-3">
              <FilterBox
                label="Team"
                value={teamFilter}
                onChange={(v) => onTeamFilter(v)}
                options={[
                  { value: 'all', label: 'All teams' },
                  ...teams.map((t) => ({ value: t.slug, label: t.name })),
                ]}
              />
              <FilterBox
                label="City"
                value={city}
                onChange={setCity}
                options={[
                  { value: 'all', label: 'All cities' },
                  ...cities.map((c) => ({ value: c, label: c })),
                ]}
              />
              <FilterBox
                label="Type"
                value={type}
                onChange={(v) => setType(v as EventType | 'all')}
                options={[
                  { value: 'all', label: 'All types' },
                  ...(Object.keys(EVENT_TYPE_LABEL) as EventType[]).map((t) => ({
                    value: t,
                    label: EVENT_TYPE_LABEL[t],
                  })),
                ]}
              />
            </div>

            {/* ------------------------------------------ grid or event ---- */}
            {selected ? (
              <div key={selected} className={`mt-2 sm:mt-3 ${zoom}`}>
                <button
                  ref={backRef}
                  type="button"
                  onClick={() => setSelected(null)}
                  className={`${LABEL} ${BOX} group mb-2 inline-flex items-center gap-2 px-4 py-3 text-cream-50 transition-colors hover:border-amber-400 hover:text-amber-400 sm:mb-3`}
                >
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:-translate-x-1"
                  >
                    ←
                  </span>
                  Back to {MONTH_NAMES[month]}
                </button>

                <div className="space-y-2 sm:space-y-3">
                  {selectedShows.map((show) => (
                    <EventCard
                      key={show.id}
                      show={show}
                      rsvp={rsvps[show.id] ?? { count: 0, going: false }}
                      onRsvp={() => toggleRsvp(show.id)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div key={cursor} className={`mt-2 sm:mt-3 ${zoom}`}>
                <div className={`${BOX} grid grid-cols-7`}>
                  {WEEKDAY_INITIALS.map((d, i) => (
                    <div
                      key={i}
                      aria-hidden="true"
                      className={`${LABEL} border-b border-amber-400/30 py-2 text-center text-amber-400/50`}
                    >
                      {d}
                    </div>
                  ))}

                  {Array.from({ length: firstWeekday }).map((_, i) => (
                    <div
                      key={`blank-${i}`}
                      className="min-h-[3.5rem] border-b border-r border-amber-400/25 sm:min-h-[5.25rem]"
                    />
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const k = keyOf(year, month, day)
                    const dayShows = byDate.get(k)

                    if (!dayShows) {
                      return (
                        <div
                          key={k}
                          className="min-h-[3.5rem] border-b border-r border-amber-400/25 p-1.5 sm:min-h-[5.25rem] sm:p-2"
                        >
                          <span className="font-sans text-[0.85rem] tabular-nums text-cream-50/35">
                            {pad(day)}
                          </span>
                        </div>
                      )
                    }

                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setSelected(k)}
                        aria-label={`${day} ${MONTH_NAMES[month]}: ${
                          dayShows.length
                        } ${dayShows.length === 1 ? 'show' : 'shows'}, ${dayShows
                          .map((s) => s.venue)
                          .join(', ')}`}
                        className="group relative min-h-[3.5rem] border-b border-r border-amber-400/25 p-1.5 text-left transition-colors hover:bg-amber-400 sm:min-h-[5.25rem] sm:p-2"
                      >
                        <span className="font-sans text-[0.85rem] tabular-nums text-amber-400 group-hover:text-navy-950">
                          {pad(day)}
                        </span>

                        <span className="mt-1 flex gap-0.5 sm:hidden" aria-hidden="true">
                          {dayShows.slice(0, 3).map((s) => (
                            <span
                              key={s.id}
                              className="h-1 w-1 rounded-full bg-amber-400 group-hover:bg-navy-950"
                            />
                          ))}
                        </span>

                        <span
                          aria-hidden="true"
                          className="mt-1 hidden text-[0.66rem] leading-tight sm:block"
                        >
                          <span className="line-clamp-2 font-sans text-cream-400 group-hover:text-navy-950">
                            {dayShows[0].venue}
                          </span>
                          {dayShows.length > 1 && (
                            <span className="font-sans text-cream-400/60 group-hover:text-navy-950/70">
                              +{dayShows.length - 1} more
                            </span>
                          )}
                        </span>
                      </button>
                    )
                  })}

                  {Array.from({
                    length: (7 - ((firstWeekday + daysInMonth) % 7)) % 7,
                  }).map((_, i) => (
                    <div
                      key={`tail-${i}`}
                      className="min-h-[3.5rem] border-b border-r border-amber-400/25 sm:min-h-[5.25rem]"
                    />
                  ))}
                </div>

                <p className="mt-3 font-sans text-[0.78rem] text-cream-400/80">
                  {monthCount} {monthCount === 1 ? 'date' : 'dates'} in{' '}
                  {MONTH_NAMES[month]}
                  {visible.length !== monthCount &&
                    ` · ${visible.length} upcoming in total`}
                  {offline && ' · sample data, database not connected'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
