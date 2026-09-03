import { useState } from 'react'

const INSIDE = [
  {
    n: '01',
    title: 'Behind the scenes',
    body: 'Soundcheck, the van, the argument about the setlist, the take that did not make the reel. Cut from shows you were probably at.',
    tilt: '-1.5deg',
  },
  {
    n: '02',
    title: 'Meet the cast',
    body: 'Everyone who plays tells it themselves — where they came from, what they were doing before this, and how they ended up on a Tuesday in a café.',
    tilt: '1.1deg',
  },
  {
    n: '03',
    title: 'How it started',
    body: 'The first jam, the rooms that said no, and how a Tuesday night turned into the thing it is now.',
    tilt: '-0.8deg',
  },
]

type State = 'idle' | 'sending' | 'done' | 'error'

export default function Community() {
  const [state, setState] = useState<State>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (state === 'sending') return

    const form = new FormData(e.currentTarget)
    const payload = {
      name: String(form.get('name') ?? '').trim(),
      email: String(form.get('email') ?? '').trim(),
      phone: String(form.get('phone') ?? '').trim() || null,
      message: String(form.get('message') ?? '').trim() || null,
    }

    setState('sending')
    setError(null)

    try {
      const res = await fetch('/api/community-request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error ?? `Request failed (${res.status})`)
      }
      setState('done')
    } catch (err) {
      // Never claim it worked when it didn't — a silent failure here means
      // someone thinks they've applied and never hears back.
      setState('error')
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <section
      id="community"
      aria-labelledby="community-heading"
      className="scroll-mt-16 overflow-hidden border-t u-rule bg-navy-900 text-cream-50"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-10 sm:py-28">
        <header className="max-w-3xl">
          <p className="font-sans text-[0.72rem] uppercase tracking-[0.24em] text-amber-400">
            The community
          </p>
          <h2
            id="community-heading"
            className="mt-4 font-display text-section leading-[0.92]"
          >
            Andar aana hai?
          </h2>
          <p className="mt-5 max-w-xl font-sans text-[0.98rem] leading-relaxed text-cream-200">
            There&rsquo;s a part of this we don&rsquo;t put on the internet. Ask
            to come in, and once you&rsquo;re approved you get your own login to
            a section that isn&rsquo;t on the menu.
          </p>
        </header>

        {/* What's behind the door — deliberately shown, deliberately locked. */}
        <ul className="mt-16 grid gap-8 sm:grid-cols-3">
          {INSIDE.map((item) => (
            <li key={item.title}>
              <article
                className="group relative h-full border u-rule bg-navy-950 p-6 transition-transform duration-500 ease-out hover:!rotate-0 motion-reduce:!rotate-0"
                style={{ rotate: item.tilt }}
              >
                <div className="flex items-start justify-between">
                  <span
                    aria-hidden="true"
                    className="font-sans text-[0.7rem] tracking-[0.22em] text-amber-400"
                  >
                    {item.n}
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex h-7 w-7 items-center justify-center border border-cream-50/20 text-[0.7rem] text-cream-50/45"
                    title="Members only"
                  >
                    ⌧
                  </span>
                </div>

                <h3 className="mt-5 font-display text-[1.5rem] leading-tight">
                  {item.title}
                </h3>
                <p className="mt-3 font-sans text-[0.88rem] leading-relaxed text-cream-400">
                  {item.body}
                </p>

                <p className="mt-6 font-sans text-[0.66rem] uppercase tracking-[0.2em] text-cream-50/35">
                  Members only
                </p>
              </article>
            </li>
          ))}
        </ul>

        {/* Request form */}
        <div className="mt-20 grid gap-10 border-t u-rule pt-12 sm:grid-cols-2 sm:gap-16">
          <div>
            <h3 className="font-display text-[1.9rem] leading-[1.05] sm:text-[2.4rem]">
              Ask for a login
            </h3>
            <p className="mt-4 max-w-md font-sans text-[0.92rem] leading-relaxed text-cream-400">
              Someone on our side reads every request. If it&rsquo;s a yes,
              we&rsquo;ll send you an ID and a password for the community
              section. We don&rsquo;t charge for it and we don&rsquo;t sell your
              details on.
            </p>
            <p className="mt-6 font-sans text-[0.82rem] text-cream-400">
              Already in?{' '}
              <a
                href="#member"
                className="text-cream-50 underline decoration-amber-400 underline-offset-4 hover:text-amber-400"
              >
                Member sign-in
              </a>
              {' '}
              <span className="text-cream-50/40">
                — prototype, accepts anything
              </span>
            </p>
          </div>

          {state === 'done' ? (
            <div className="border border-amber-400/50 bg-navy-950 p-7">
              <p className="font-display text-[1.5rem] text-cream-50">
                Request received.
              </p>
              <p className="mt-3 font-sans text-[0.9rem] leading-relaxed text-cream-400">
                Someone will look at it and get back to you. If you&rsquo;d
                rather not wait, come to a Tuesday open jam and say hello in
                person.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <Field name="name" label="Your name" required autoComplete="name" />
              <Field
                name="email"
                label="Email"
                type="email"
                required
                autoComplete="email"
              />
              <Field
                name="phone"
                label="Phone (optional)"
                type="tel"
                autoComplete="tel"
              />

              <label className="flex flex-col gap-2">
                <span className="font-sans text-[0.7rem] uppercase tracking-[0.2em] text-amber-400/70">
                  What pulls you in?
                </span>
                <textarea
                  name="message"
                  rows={4}
                  maxLength={800}
                  className="border u-rule bg-navy-950 px-4 py-3 font-sans text-[0.92rem] text-cream-50 placeholder:text-cream-50/30"
                  placeholder="A show you came to, someone you know, or just that you sing in the shower."
                />
              </label>

              {state === 'error' && (
                <p role="alert" className="font-sans text-[0.85rem] text-rust-500">
                  {error} — you can also email{' '}
                  <a
                    href="mailto:join@sungsungeet.example"
                    className="underline underline-offset-4"
                  >
                    join@sungsungeet.example
                  </a>
                  .
                </p>
              )}

              <button
                type="submit"
                disabled={state === 'sending'}
                className="mt-2 self-start border border-amber-400 px-6 py-3 font-sans text-[0.85rem] uppercase tracking-[0.18em] text-amber-400 transition-colors hover:bg-amber-400 hover:text-navy-950 disabled:opacity-50"
              >
                {state === 'sending' ? 'Sending…' : 'Send request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

function Field({
  name,
  label,
  type = 'text',
  required = false,
  autoComplete,
}: {
  name: string
  label: string
  type?: string
  required?: boolean
  autoComplete?: string
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-sans text-[0.7rem] uppercase tracking-[0.2em] text-amber-400/70">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        maxLength={200}
        className="border u-rule bg-navy-950 px-4 py-3 font-sans text-[0.92rem] text-cream-50 placeholder:text-cream-50/30"
      />
    </label>
  )
}
