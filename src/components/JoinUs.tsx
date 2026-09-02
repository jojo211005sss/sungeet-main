const MAIL = 'join@sungsungeet.example'

const SUBJECT = encodeURIComponent('I want to join Sung Sungeet')
const BODY = encodeURIComponent(
  `Naam:\n` +
    `What you play (or sing):\n` +
    `Where you're based:\n` +
    `A link to you playing something (Instagram / YouTube / anything):\n` +
    `Anything else:\n`,
)

/**
 * "Just an email link" per the brief — no form, no backend. The mailto is
 * prefilled so the person doesn't have to work out what to write, which is the
 * main reason mailto links go unanswered.
 */
export default function JoinUs() {
  return (
    <section
      id="join"
      aria-labelledby="join-heading"
      className="scroll-mt-16 relative overflow-hidden border-t u-rule bg-navy-900"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-[10%] top-[-40%] h-[60vh] w-[60vh] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(212,141,70,0.35) 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-10 sm:py-28">
        <div className="grid gap-10 sm:grid-cols-2 sm:gap-16">
          <div>
            <p className="font-sans text-[0.78rem] tracking-[0.24em] text-amber-400">
              Join us
            </p>
            <h2
              id="join-heading"
              className="mt-4 font-display text-section leading-[0.95] text-cream-50"
            >
              Tumhare paas talent h?
            </h2>
          </div>

          <div>
            <p className="font-sans text-[0.98rem] leading-relaxed text-cream-200">
              We&rsquo;re a community before we&rsquo;re a band. If you sing, or
              play something, or want to run sound and light for a night —
              write in. No audition tape required, no fee to join.
            </p>
            <p className="mt-4 font-sans text-[0.9rem] leading-relaxed text-cream-400">
              Easiest way in is to just turn up to a Tuesday open jam and put
              your name down. But if you&rsquo;d rather say hello first:
            </p>

            <a
              href={`mailto:${MAIL}?subject=${SUBJECT}&body=${BODY}`}
              className="mt-8 inline-block border border-amber-400 px-6 py-3 font-sans text-[0.88rem] text-amber-400 transition-colors hover:bg-amber-400 hover:text-navy-950"
            >
              Write to us
            </a>

            <p className="mt-4 font-sans text-[0.8rem] text-cream-400">
              or email{' '}
              <a
                href={`mailto:${MAIL}`}
                className="underline decoration-amber-400 underline-offset-4 hover:text-cream-50"
              >
                {MAIL}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
