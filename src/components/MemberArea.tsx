import { useState } from 'react'
import { CAST, CLIPS, ORIGIN } from '../data/portal'
import { useMockMember } from '../lib/useMockMember'

const BOX = 'border border-amber-400/40'
const LABEL = 'font-sans text-[0.66rem] uppercase tracking-[0.2em]'

const DEMO_EMAIL = 'demo@sungsungeet.example'

/** Sits at the top of every member screen. Non-dismissible on purpose. */
function PrototypeBanner() {
  return (
    <div className="border-b border-rust-500/50 bg-rust-500/15 px-5 py-2.5 text-center sm:px-10">
      <p className={`${LABEL} text-cream-50`}>
        Prototype — this sign-in checks nothing and everything below is
        placeholder
      </p>
    </div>
  )
}

/* ------------------------------------------------------------- sign in ---- */

function SignIn({ onSignIn }: { onSignIn: (email: string) => void }) {
  const [email, setEmail] = useState('')

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
        onSubmit={(e) => {
          e.preventDefault()
          onSignIn(email.trim() || DEMO_EMAIL)
        }}
      >
        <label className="flex flex-col gap-2">
          <span className={`${LABEL} text-amber-400/70`}>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={DEMO_EMAIL}
            className={`${BOX} bg-navy-950 px-4 py-3 font-sans text-[0.95rem] text-cream-50 placeholder:text-cream-50/25`}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className={`${LABEL} text-amber-400/70`}>Password</span>
          <input
            type="password"
            placeholder="anything at all"
            className={`${BOX} bg-navy-950 px-4 py-3 font-sans text-[0.95rem] text-cream-50 placeholder:text-cream-50/25`}
          />
        </label>

        <button
          type="submit"
          className={`${LABEL} mt-3 bg-amber-400 px-6 py-3.5 text-navy-950 transition-opacity hover:opacity-90`}
        >
          Sign in
        </button>
      </form>

      {/* Printed on the screen deliberately: nobody should be able to mistake
          this for a working gate. */}
      <div className={`${BOX} mt-8 border-dashed p-4`}>
        <p className={`${LABEL} text-rust-500`}>Demo</p>
        <p className="mt-2 font-sans text-[0.85rem] leading-relaxed text-cream-400">
          Any email and any password will get you in — there&rsquo;s no account
          system yet. Leave it blank to sign in as{' '}
          <span className="text-cream-50">{DEMO_EMAIL}</span>.
        </p>
      </div>

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

type Tab = 'clips' | 'cast' | 'origin'

const TABS: { id: Tab; label: string }[] = [
  { id: 'clips', label: 'Behind the scenes' },
  { id: 'cast', label: 'Meet the cast' },
  { id: 'origin', label: 'How it started' },
]

function Portal({
  name,
  onSignOut,
}: {
  name: string
  onSignOut: () => void
}) {
  const [tab, setTab] = useState<Tab>('clips')

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-10 sm:py-14">
      <header className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <p className={`${LABEL} text-amber-400`}>The community</p>
          <h1 className="mt-3 font-display text-[2.2rem] leading-[0.95] text-cream-50 sm:text-[3rem]">
            Andar aa gaye, {name}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <a href="#community" className={`${LABEL} text-cream-400 hover:text-cream-50`}>
            ← The site
          </a>
          <button
            type="button"
            onClick={onSignOut}
            className={`${LABEL} ${BOX} px-4 py-2.5 text-cream-50 transition-colors hover:border-amber-400 hover:text-amber-400`}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className={`${BOX} mt-10 flex flex-col sm:flex-row`} role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`${LABEL} flex-1 border-b border-amber-400/25 px-5 py-4 transition-colors last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 ${
              tab === t.id
                ? 'bg-amber-400 text-navy-950'
                : 'text-cream-50 hover:bg-amber-400/15'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-10">
        {tab === 'clips' && (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CLIPS.map((clip) => (
              <li key={clip.id}>
                <article className={`${BOX} group h-full bg-navy-900`}>
                  <div className="relative flex aspect-video items-center justify-center overflow-hidden">
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 opacity-[0.07]"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(45deg, #f7f4ef 0 1px, transparent 1px 11px)',
                      }}
                    />
                    <span
                      aria-hidden="true"
                      className="relative flex h-14 w-14 items-center justify-center rounded-full border border-amber-400 text-amber-400 transition-transform group-hover:scale-110 motion-reduce:group-hover:scale-100"
                    >
                      <span className="ml-1">▶</span>
                    </span>
                    <span className={`${LABEL} absolute bottom-3 right-3 text-cream-50/45`}>
                      {clip.duration}
                    </span>
                  </div>
                  <div className="border-t border-amber-400/25 p-4">
                    <h3 className="font-display text-[1.2rem] text-cream-50">
                      {clip.title}
                    </h3>
                    <p className={`${LABEL} mt-2 text-cream-400`}>{clip.context}</p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}

        {tab === 'cast' && (
          <ul className="grid gap-6 sm:grid-cols-2">
            {CAST.map((person) => (
              <li key={person.name}>
                <article className={`${BOX} h-full bg-navy-900 p-6`}>
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-[1.6rem] text-cream-50">
                      {person.name}
                    </h3>
                    <span className={`${LABEL} text-amber-400`}>{person.role}</span>
                  </div>
                  <p className="mt-5 border-l-2 border-amber-400 pl-4 font-display text-[1.15rem] italic leading-snug text-cream-200">
                    {person.pull}
                  </p>
                  <p className="mt-5 font-sans text-[0.88rem] leading-relaxed text-cream-400">
                    {person.body}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        )}

        {tab === 'origin' && (
          <ol className="relative border-l border-amber-400/30 pl-6 sm:pl-10">
            {ORIGIN.map((beat) => (
              <li key={beat.title} className="relative pb-12 last:pb-0">
                <span
                  aria-hidden="true"
                  className="absolute -left-[1.72rem] top-1.5 h-2.5 w-2.5 rounded-full bg-amber-400 sm:-left-[2.72rem]"
                />
                <p className={`${LABEL} text-amber-400`}>{beat.year}</p>
                <h3 className="mt-2 font-display text-[1.7rem] leading-tight text-cream-50">
                  {beat.title}
                </h3>
                <p className="mt-3 max-w-xl font-sans text-[0.92rem] leading-relaxed text-cream-400">
                  {beat.body}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- export ---- */

export default function MemberArea() {
  const { member, signIn, signOut } = useMockMember()

  return (
    <div className="min-h-svh bg-navy-950">
      <PrototypeBanner />
      {member ? (
        <Portal
          name={member.name}
          onSignOut={() => {
            signOut()
            window.location.hash = '#community'
          }}
        />
      ) : (
        <SignIn onSignIn={signIn} />
      )}
    </div>
  )
}
