import { useEffect, useRef, useState } from 'react'
import type { Team } from '../data/teams'
import { ArtistPass, useScrollSwing, type PassMedia } from './Teams'
import { ARTIST_CLIPS, SOLO_ARTISTS } from '../data/artists'

/*
 * Every artist across every lineup, picked like a shopping list: add the
 * people you want, then send one enquiry for all of them. Not linked from the
 * menu — reached from the lineups section and from inside the members area.
 */

export type Artist = { name: string; role: string; photoUrl: string | null; teams: string[]; media: PassMedia | null }

/**
 * One entry per name, across all teams plus the solo artists: roles and
 * lineups merged, first photo wins, and their team's showreel is what plays
 * when the badge is flipped.
 */
export function rosterFrom(teams: Team[]): Artist[] {
  type Acc = { roles: Set<string>; photoUrl: string | null; teams: string[]; media: PassMedia | null }
  const byName = new Map<string, Acc>()
  const get = (name: string) => byName.get(name) ?? { roles: new Set<string>(), photoUrl: null, teams: [], media: null }
  for (const t of teams) {
    const reel = t.media.find((x) => x.kind === 'video' && x.src)?.src
    for (const m of t.members) {
      const a = get(m.name)
      m.role.split(',').forEach((r) => a.roles.add(r.trim()))
      a.photoUrl ??= m.photoUrl ?? null
      a.media ??= reel ? { kind: 'video', src: reel } : null
      if (!a.teams.includes(t.name)) a.teams.push(t.name)
      byName.set(m.name, a)
    }
  }
  for (const solo of SOLO_ARTISTS) {
    const a = get(solo.name)
    solo.role.split(',').forEach((r) => a.roles.add(r.trim()))
    a.photoUrl ??= solo.photoUrl
    a.media = solo.media ?? a.media
    byName.set(solo.name, a)
  }
  return [...byName]
    .map(([name, a]) => ({ name, role: [...a.roles].join(', '), photoUrl: a.photoUrl, teams: a.teams, media: ARTIST_CLIPS[name] ?? a.media }))
    .sort((x, y) => Number(!x.photoUrl) - Number(!y.photoUrl) || x.name.localeCompare(y.name))
}

const KEY = 'sunggeet.bookingList'

/** The list survives a refresh in this browser; storage failing just means it doesn't. */
function useBookingList() {
  const [list, setList] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]
    } catch {
      return []
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(list))
    } catch {
      /* private mode */
    }
  }, [list])

  const toggle = (name: string) =>
    setList((l) => (l.includes(name) ? l.filter((n) => n !== name) : [...l, name]))
  return { list, toggle, clear: () => setList([]) }
}

const FIELD =
  'w-full border border-cream-50/20 bg-navy-950 px-3.5 py-2.5 font-sans text-[0.92rem] text-cream-50 placeholder:text-cream-50/30 focus:border-amber-400 focus:outline-none'
const LABEL = 'mb-1.5 block font-sans text-[0.78rem] text-cream-400'

function EnquiryDialog({
  dialog,
  list,
  onRemove,
  onSent,
}: {
  dialog: React.RefObject<HTMLDialogElement | null>
  list: string[]
  onRemove: (name: string) => void
  onSent: () => void
}) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (state === 'sending') return
    const f = new FormData(e.currentTarget)
    const val = (k: string) => String(f.get(k) ?? '').trim()
    setState('sending')
    setError(null)
    try {
      const res = await fetch('/api/booking-enquiry', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: val('name'),
          email: val('email'),
          phone: val('phone'),
          eventDate: val('eventDate'),
          city: val('city'),
          eventType: val('eventType'),
          guests: val('guests'),
          message: val('message'),
          artists: list,
        }),
      })
      const body = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) throw new Error(body?.error ?? `Something went wrong (${res.status})`)
      setState('sent')
      onSent()
    } catch (err) {
      setState('idle')
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const close = () => {
    dialog.current?.close()
    if (state === 'sent') setState('idle')
  }

  return (
    <dialog
      ref={dialog}
      onClose={() => state === 'sent' && setState('idle')}
      className="m-auto w-[min(40rem,calc(100vw-2rem))] max-h-[calc(100svh-2rem)] overflow-y-auto border border-amber-400/40 bg-navy-900 p-0 text-cream-50 backdrop:bg-navy-950/80 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-start justify-between gap-4 border-b border-cream-50/10 px-6 py-5">
        <div>
          <h2 className="font-display text-[2rem] leading-none">
            {state === 'sent' ? 'Enquiry sent' : 'Your booking list'}
          </h2>
          {state !== 'sent' && (
            <p className="mt-2 font-sans text-[0.85rem] text-cream-400">
              One enquiry for everyone below. We reply with availability and a quote.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="-mr-2 px-2 font-sans text-[1.4rem] leading-none text-cream-400 hover:text-cream-50"
        >
          ×
        </button>
      </div>

      {state === 'sent' ? (
        <div className="px-6 py-8">
          <p className="max-w-md font-sans text-[0.95rem] leading-relaxed text-cream-200">
            We&rsquo;ve got it. Someone from the team will get back to you with
            who&rsquo;s free on your date and what it would cost.
          </p>
          <button
            type="button"
            onClick={close}
            className="mt-6 bg-amber-400 px-5 py-2.5 font-sans text-[0.88rem] text-navy-950 hover:opacity-90"
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="px-6 py-6">
          <ul className="flex flex-wrap gap-2">
            {list.map((name) => (
              <li
                key={name}
                className="flex items-center gap-2 border border-amber-400/60 py-1 pl-3 pr-1 font-sans text-[0.85rem]"
              >
                {name}
                <button
                  type="button"
                  onClick={() => onRemove(name)}
                  aria-label={`Remove ${name}`}
                  className="px-1.5 text-cream-400 hover:text-amber-400"
                >
                  ×
                </button>
              </li>
            ))}
            {list.length === 0 && (
              <li className="font-sans text-[0.88rem] text-cream-400">
                Your list is empty. Close this and add some artists.
              </li>
            )}
          </ul>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className={LABEL}>Your name</span>
              <input name="name" required maxLength={120} autoComplete="name" className={FIELD} />
            </label>
            <label>
              <span className={LABEL}>Email</span>
              <input name="email" type="email" maxLength={200} autoComplete="email" className={FIELD} />
            </label>
            <label>
              <span className={LABEL}>Phone</span>
              <input name="phone" type="tel" maxLength={40} autoComplete="tel" className={FIELD} />
            </label>
            <label>
              <span className={LABEL}>Date of the event</span>
              <input name="eventDate" type="date" className={`${FIELD} [color-scheme:dark]`} />
            </label>
            <label>
              <span className={LABEL}>City</span>
              <input name="city" maxLength={80} placeholder="Delhi, Gurugram, Noida…" className={FIELD} />
            </label>
            <label>
              <span className={LABEL}>Kind of event</span>
              <select name="eventType" defaultValue="" className={FIELD}>
                <option value="">Choose one</option>
                <option>Wedding or sangeet</option>
                <option>Private party</option>
                <option>Corporate event</option>
                <option>Café or club night</option>
                <option>Something else</option>
              </select>
            </label>
            <label>
              <span className={LABEL}>Roughly how many guests</span>
              <input name="guests" type="number" min={1} max={99999} inputMode="numeric" className={FIELD} />
            </label>
            <label className="sm:col-span-2">
              <span className={LABEL}>Anything else we should know</span>
              <textarea name="message" rows={3} maxLength={1000} className={FIELD} />
            </label>
          </div>

          <p className="mt-3 font-sans text-[0.78rem] text-cream-400">
            Leave an email or a phone number, whichever you&rsquo;d rather we use.
          </p>

          {error && (
            <p role="alert" className="mt-4 font-sans text-[0.88rem] text-rust-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={state === 'sending' || list.length === 0}
            className="mt-6 w-full bg-amber-400 px-5 py-3 font-sans text-[0.92rem] font-medium text-navy-950 transition-opacity hover:opacity-90 disabled:opacity-40 sm:w-auto"
          >
            {state === 'sending'
              ? 'Sending…'
              : `Send enquiry for ${list.length} artist${list.length === 1 ? '' : 's'}`}
          </button>
        </form>
      )}
    </dialog>
  )
}

/** The roster, the floating list bar and the enquiry dialog. Used on its own page and inside the members area. */
export function ArtistRoster({ teams }: { teams: Team[] }) {
  const artists = rosterFrom(teams)
  const { list, toggle, clear } = useBookingList()
  const dialog = useRef<HTMLDialogElement>(null)
  const grid = useRef<HTMLUListElement>(null)
  useScrollSwing(grid)

  // Names that are no longer on the roster (renamed, removed) drop off the list.
  const picked = list.filter((n) => artists.some((a) => a.name === n))

  return (
    <>
      <ul ref={grid} className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
        {artists.map((a, i) => {
          const on = picked.includes(a.name)
          return (
            <li key={a.name} className="flex flex-col">
              <ArtistPass m={a} n={i} selected={on} media={a.media} />
              <p className="mt-4 font-sans text-[0.78rem] leading-snug text-cream-400">
                {a.teams.length ? `Plays with ${a.teams.join(', ')}` : 'Solo artist'}
              </p>
              <button
                type="button"
                onClick={() => toggle(a.name)}
                aria-pressed={on}
                className={`mt-3 px-4 py-2.5 font-sans text-[0.85rem] transition-colors ${
                  on
                    ? 'bg-amber-400 text-navy-950 hover:opacity-90'
                    : 'border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-navy-950'
                }`}
              >
                {on ? 'On your list, remove' : 'Add to booking'}
              </button>
            </li>
          )
        })}
      </ul>

      {/* The basket: follows you down the page once something's in it. */}
      {picked.length > 0 && (
        <div className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-xl items-center gap-4 border border-amber-400/50 bg-navy-900/95 px-5 py-3.5 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.9)] backdrop-blur">
          <div className="min-w-0 flex-1">
            <p className="font-sans text-[0.9rem] text-cream-50">
              {picked.length} artist{picked.length === 1 ? '' : 's'} on your list
            </p>
            <p className="truncate font-sans text-[0.78rem] text-cream-400">{picked.join(', ')}</p>
          </div>
          <button
            type="button"
            onClick={() => dialog.current?.showModal()}
            className="shrink-0 bg-amber-400 px-4 py-2.5 font-sans text-[0.85rem] font-medium text-navy-950 hover:opacity-90"
          >
            Send enquiry
          </button>
        </div>
      )}

      <EnquiryDialog dialog={dialog} list={picked} onRemove={toggle} onSent={clear} />
    </>
  )
}

/** The standalone page at #artists. */
export default function ArtistsPage({ teams }: { teams: Team[] }) {
  return (
    <div className="min-h-svh bg-navy-950 text-cream-50">
      <div className="mx-auto max-w-6xl px-5 pb-40 pt-6 sm:px-10">
        <a href="#teams" className="font-sans text-[0.85rem] text-cream-400 hover:text-cream-50">
          ← Back to the site
        </a>
        <header className="mt-10 max-w-2xl">
          <h1 className="font-display text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.9]">Our artists</h1>
          <p className="mt-5 font-sans text-[0.98rem] leading-relaxed text-cream-400">
            Pick who you&rsquo;d like at your event. Add them to your list, then send
            one enquiry for all of them and we&rsquo;ll come back with availability
            and a quote.
          </p>
        </header>
        <div className="mt-16">
          <ArtistRoster teams={teams} />
        </div>
      </div>
    </div>
  )
}
