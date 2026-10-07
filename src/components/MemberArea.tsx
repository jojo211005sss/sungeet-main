import { useRef, useState } from 'react'
import { useMember, type PortalContent } from '../lib/useMember'
import type { Team } from '../data/teams'
import { ArtistRoster } from './ArtistRoster'

const BOX = 'border border-amber-400/40'
const LABEL = 'font-sans text-[0.66rem] uppercase tracking-[0.2em]'

/* ------------------------------------------------------------- sign in ---- */

function SignIn({
  onSignIn,
}: {
  onSignIn: (username: string, password: string) => Promise<string | null>
}) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  return (
    <div className="mx-auto flex min-h-[70svh] max-w-md flex-col justify-center px-5 py-16">
      <a href="#community" className={`${LABEL} text-amber-400 hover:underline`}>
        ← Back to the site
      </a>

      <h1 className="mt-8 font-display text-[2.6rem] leading-[0.95] text-cream-50">
        Member sign-in
      </h1>
      <p className="mt-4 font-sans text-[0.92rem] leading-relaxed text-cream-400">
        For people who&rsquo;ve been let into the community section.
      </p>

      <form
        className="mt-10 flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault()
          if (sending) return
          setSending(true)
          setError(await onSignIn(username, password))
          setSending(false)
        }}
      >
        <label className="flex flex-col gap-2">
          <span className={`${LABEL} text-amber-400/70`}>Username</span>
          <input
            type="text"
            required
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`${BOX} bg-navy-950 px-4 py-3 font-sans text-[0.95rem] text-cream-50 placeholder:text-cream-50/25`}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className={`${LABEL} text-amber-400/70`}>Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${BOX} bg-navy-950 px-4 py-3 font-sans text-[0.95rem] text-cream-50 placeholder:text-cream-50/25`}
          />
        </label>

        {error && (
          <p role="alert" className="font-sans text-[0.85rem] text-rust-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className={`${LABEL} mt-3 bg-amber-400 px-6 py-3.5 text-navy-950 transition-opacity hover:opacity-90 disabled:opacity-50`}
        >
          {sending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-8 font-sans text-[0.85rem] text-cream-400">
        Not in yet?{' '}
        <a
          href="#community"
          className="text-cream-50 underline decoration-amber-400 underline-offset-4"
        >
          Ask for a login
        </a>
      </p>
    </div>
  )
}

/* -------------------------------------------------------------- portal ---- */

/*
 * Backstage. One loud thing — the laminated pass on its lanyard — and the
 * rest borrowed quietly from what's actually lying around after a show:
 * masking tape, a film contact sheet, album liner notes, a taped setlist.
 */

type Tab = 'clips' | 'cast' | 'origin' | 'artists'

const TABS: { id: Tab; label: string; tilt: string }[] = [
  { id: 'clips', label: 'Behind the scenes', tilt: '-2deg' },
  { id: 'cast', label: 'Meet the cast', tilt: '1.5deg' },
  { id: 'origin', label: 'How it started', tilt: '-1deg' },
  { id: 'artists', label: 'Book artists', tilt: '2deg' },
]

const HAND = 'font-hand font-semibold'

function Pass({ name, username }: { name: string; username: string }) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
    el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
  }

  return (
    <div aria-label={`Member pass for ${name}`} role="img" className="u-pass-swing flex flex-col items-center">
      {/* Lanyard: woven strap with stitched edges, running off the top of the page. */}
      <div
        aria-hidden="true"
        className="h-20 w-5 sm:h-36"
        style={{
          background:
            'linear-gradient(90deg, #a86a2f 0 2px, var(--color-amber-400) 2px calc(100% - 2px), #a86a2f calc(100% - 2px)), var(--color-amber-400)',
        }}
      />
      <div aria-hidden="true" className="-mt-px h-4 w-9 rounded-[3px] bg-gradient-to-b from-cream-200 to-cream-400" />

      <div
        ref={ref}
        onPointerMove={onMove}
        className="relative -mt-1 w-52 -rotate-3 overflow-hidden rounded-[14px] bg-cream-50 text-navy-950 shadow-[0_34px_60px_-18px_rgba(0,0,0,0.85)] sm:w-60"
      >
        {/* Punched slot for the clip. */}
        <div aria-hidden="true" className="absolute left-1/2 top-2.5 z-10 h-2 w-12 -translate-x-1/2 rounded-full bg-navy-950" />

        <div className="bg-amber-400 px-5 pb-3 pt-7">
          <div className="flex items-center gap-2.5">
            <img src="/brand/sunggeet-mark.png" alt="" width={30} height={30} className="h-7 w-7 rounded-full" />
            <span className="font-display text-[1.15rem] leading-none">Sung Sungeet</span>
          </div>
        </div>

        <div className="px-5 pb-5 pt-4">
          <p className="font-display text-[2.6rem] italic leading-[0.85]">Backstage</p>
          <p className="mt-1 font-sans text-[0.72rem] text-navy-800/70">Members only</p>

          {/* Written on in marker, like every pass that's ever been handed out. */}
          <p className={`${HAND} mt-4 -rotate-2 text-[2rem] leading-none text-navy-800`}>{name}</p>
          <div aria-hidden="true" className="mt-1 h-px bg-navy-950/25" />
          <p className="mt-1.5 font-sans text-[0.7rem] text-navy-800/60">@{username}</p>

          <div
            aria-hidden="true"
            className="mt-4 h-8"
            style={{
              background:
                'repeating-linear-gradient(90deg, #050c19 0 2px, transparent 2px 4px, #050c19 4px 7px, transparent 7px 8px, #050c19 8px 9px, transparent 9px 12px)',
            }}
          />
        </div>

        <div aria-hidden="true" className="u-holo pointer-events-none absolute inset-0" />
      </div>
    </div>
  )
}

function Tabs({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <div role="tablist" aria-label="Members sections" className="flex flex-wrap gap-x-4 gap-y-3">
      {TABS.map((t) => {
        const on = tab === t.id
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={on}
            aria-controls={`panel-${t.id}`}
            onClick={() => onTab(t.id)}
            style={{ rotate: on ? '0deg' : t.tilt }}
            className={`u-tape px-6 py-2.5 text-[1.55rem] leading-none text-navy-950 transition-[rotate,opacity,translate] duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400 ${HAND} ${
              on ? 'opacity-100' : '-translate-y-0.5 opacity-55 hover:opacity-85'
            }`}
          >
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

/** Contact sheet: each clip a frame of film, the keeper circled in grease pencil. */
function ContactSheet({ clips }: { clips: PortalContent['clips'] }) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {clips.map((clip, i) => (
        <li key={clip.id} className="bg-black">
          <div className="u-sprockets" aria-hidden="true" />
          <div className="relative px-3">
            <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-navy-800">
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, #f7f4ef 0 1px, transparent 1px 11px)',
                }}
              />
              <span
                aria-hidden="true"
                className="relative flex h-12 w-12 items-center justify-center rounded-full border border-cream-50/60 text-cream-50/80"
              >
                <span className="ml-0.5 text-sm">▶</span>
              </span>
              <span className={`${HAND} absolute bottom-1.5 right-2.5 text-[1.35rem] text-amber-300`}>
                {clip.duration}
              </span>
            </div>
            {i === 0 && (
              // Grease-pencil circle round the take that made the reel.
              <svg
                aria-hidden="true"
                viewBox="0 0 200 120"
                preserveAspectRatio="none"
                className="pointer-events-none absolute -inset-x-1 -inset-y-2 h-[calc(100%+1rem)] w-[calc(100%+0.5rem)]"
              >
                <path
                  d="M24 18 C 70 2, 160 4, 188 30 C 204 60, 184 104, 120 112 C 60 118, 8 104, 6 66 C 4 40, 20 22, 52 12"
                  fill="none"
                  stroke="var(--color-rust-500)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            )}
          </div>
          <div className="u-sprockets" aria-hidden="true" />
          <div className="flex items-baseline justify-between gap-3 px-3 pb-4 pt-2">
            <div>
              <h3 className="font-sans text-[0.95rem] font-medium text-cream-50">{clip.title}</h3>
              <p className="mt-0.5 font-sans text-[0.8rem] text-cream-400">{clip.context}</p>
            </div>
            {/* Edge print: film frame numbering. */}
            <span aria-hidden="true" className="shrink-0 font-sans text-[0.68rem] text-amber-400/70">
              {i + 1}A
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Liner notes: names set big, staggered down the page like an album insert. */
function LinerNotes({ cast }: { cast: PortalContent['cast'] }) {
  return (
    <div className="grid gap-x-16 gap-y-16 md:grid-cols-2">
      {cast.map((p, i) => (
        <article key={p.name} className={i % 2 ? 'md:mt-28' : ''}>
          <p className={`${HAND} -rotate-2 text-[1.6rem] leading-none text-amber-400`}>{p.role}</p>
          <h3 className="mt-1 font-display text-[clamp(3.2rem,8vw,5.75rem)] leading-[0.85] text-cream-50">
            {p.name}
          </h3>
          <blockquote className="mt-6 border-l border-amber-400/60 pl-5 font-display text-[1.45rem] italic leading-snug text-cream-200">
            &ldquo;{p.pull}&rdquo;
          </blockquote>
          <p className="mt-4 max-w-md font-sans text-[0.92rem] leading-relaxed text-cream-400">{p.body}</p>
        </article>
      ))}
    </div>
  )
}

/** The story as a setlist: marker on paper, taped down at the corners. */
function Setlist({ origin }: { origin: PortalContent['origin'] }) {
  return (
    <div className="relative mx-auto max-w-2xl px-2 pt-4">
      <div
        className="relative -rotate-1 bg-cream-50 px-7 py-10 text-navy-950 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.9)] sm:px-14 sm:py-14"
      >
        <span aria-hidden="true" className="u-tape absolute -left-5 -top-3 h-8 w-28 -rotate-[24deg]" />
        <span aria-hidden="true" className="u-tape absolute -right-5 -top-3 h-8 w-28 rotate-[20deg]" />

        <p className={`${HAND} text-[1.7rem] leading-none text-rust-500`}>How it started</p>

        <ol className="mt-6">
          {origin.map((beat, i) => (
            <li key={beat.title} className="grid grid-cols-[2.4rem_1fr] gap-x-2 py-3.5">
              <span className={`${HAND} text-[2.3rem] leading-none text-navy-700`}>{i + 1}.</span>
              <div>
                <p className={`${HAND} text-[2.3rem] leading-none`}>
                  {beat.title}
                  {beat.year !== '—' && (
                    <span className="ml-3 text-[1.4rem] text-rust-500">{beat.year}</span>
                  )}
                </p>
                <p className="mt-2 max-w-md font-sans text-[0.88rem] leading-relaxed text-navy-800/80">
                  {beat.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

function Portal({
  name,
  username,
  content,
  teams,
  onSignOut,
}: {
  name: string
  username: string
  content: PortalContent
  teams: Team[]
  onSignOut: () => void
}) {
  const [tab, setTab] = useState<Tab>('clips')
  const first = name.split(' ')[0]

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 sm:px-10">
      <nav className="flex items-center justify-between py-5 font-sans text-[0.85rem]">
        <a href="#community" className="text-cream-400 hover:text-cream-50">
          ← Back to the site
        </a>
        <button
          type="button"
          onClick={onSignOut}
          className="border border-cream-50/25 px-4 py-2 text-cream-50 transition-colors hover:border-amber-400 hover:text-amber-400"
        >
          Sign out
        </button>
      </nav>

      <header className="grid items-start gap-6 md:grid-cols-[1fr_auto] md:gap-16">
        {/* The pass hangs from the very top edge, so pull it up under the bar. */}
        <div className="order-first -mt-20 flex justify-center md:order-last md:-mt-[5.25rem] md:mr-6">
          <Pass name={name} username={username} />
        </div>
        <div className="md:pt-24">
          <h1 className="font-display text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.9] text-cream-50">
            Welcome backstage, {first}.
          </h1>
          <p className="mt-5 max-w-md font-sans text-[0.98rem] leading-relaxed text-cream-400">
            The bits that never make the reel. Pick a strip of tape.
          </p>
          <div className="mt-10">
            <Tabs tab={tab} onTab={setTab} />
          </div>
        </div>
      </header>

      <section
        key={tab}
        id={`panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        className="mt-16 animate-[fadeIn_0.3s_ease-out]"
      >
        {tab === 'clips' && <ContactSheet clips={content.clips} />}
        {tab === 'cast' && <LinerNotes cast={content.cast} />}
        {tab === 'origin' && <Setlist origin={content.origin} />}
        {tab === 'artists' && <ArtistRoster teams={teams} />}
      </section>
    </div>
  )
}

/* -------------------------------------------------------------- export ---- */

export default function MemberArea({ teams }: { teams: Team[] }) {
  const { session, checking, signIn, signOut } = useMember()

  return (
    <div className="min-h-svh overflow-x-clip bg-navy-950">
      {checking ? (
        <p className={`${LABEL} py-32 text-center text-cream-400`}>Checking your sign-in…</p>
      ) : session ? (
        <Portal
          name={session.member.name}
          username={session.member.username}
          content={session.content}
          teams={teams}
          onSignOut={() => {
            void signOut()
            window.location.hash = '#community'
          }}
        />
      ) : (
        <SignIn onSignIn={signIn} />
      )}
    </div>
  )
}
