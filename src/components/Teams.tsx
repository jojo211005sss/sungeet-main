import { monogram, type Team } from '../data/teams'

type Props = {
  teams: Team[]
  activeSlug: string | 'all'
  onPickTeam: (slug: string) => void
}

/**
 * Media slot. Real photo/video when the staff backend supplies a URL; until
 * then a designed placeholder that says what's missing rather than faking it.
 * See README → team media.
 */
function TeamMedia({ team }: { team: Team }) {
  if (team.photoUrl) {
    return (
      <img
        src={team.photoUrl}
        alt={team.name}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
    )
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-navy-900">
      <span
        aria-hidden="true"
        className="font-display text-[4.5rem] leading-none text-cream-50/85 sm:text-[6rem]"
      >
        {monogram(team.name)}
      </span>
      <span
        aria-hidden="true"
        className="absolute bottom-6 left-6 font-sans text-[0.68rem] tracking-[0.18em] text-cream-50/40"
      >
        photo pending
      </span>
    </div>
  )
}

export default function Teams({ teams, activeSlug, onPickTeam }: Props) {
  if (teams.length === 0) return null

  return (
    <section
      id="teams"
      aria-labelledby="teams-heading"
      className="scroll-mt-16 border-t u-rule bg-navy-950 text-cream-50"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-10 sm:py-28">
        <header className="max-w-2xl">
          <h2 id="teams-heading" className="font-display text-section leading-[0.95]">
            Kaun baja raha hai
          </h2>
          <p className="mt-4 font-sans text-[0.95rem] leading-relaxed text-cream-400">
            Not one fixed band. Depending on the room, a different lineup goes
            out — and the calendar tells you which one is playing your date.
          </p>
        </header>

        <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team, i) => {
            const active = activeSlug === team.slug
            return (
              <article key={team.slug} className="flex flex-col">
                <div
                  className={`relative aspect-[4/5] overflow-hidden transition-shadow ${
                    active ? 'ring-2 ring-amber-400' : ''
                  }`}
                >
                  <TeamMedia team={team} />

                  <span
                    aria-hidden="true"
                    className="absolute left-4 top-4 font-sans text-[0.72rem] tracking-[0.22em] text-amber-400"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  {team.videoUrl ? (
                    <a
                      href={team.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute bottom-4 right-4 flex items-center gap-2 border border-cream-50/40 bg-navy-950/60 px-3 py-1.5 font-sans text-[0.75rem] text-cream-50 backdrop-blur transition-colors hover:border-amber-400 hover:text-amber-400"
                    >
                      <span aria-hidden="true">▶</span> Showreel
                    </a>
                  ) : (
                    <span className="absolute bottom-4 right-4 border border-cream-50/15 px-3 py-1.5 font-sans text-[0.7rem] text-cream-50/35">
                      showreel pending
                    </span>
                  )}
                </div>

                <h3 className="mt-5 font-display text-[1.7rem] leading-tight">
                  {team.name}
                </h3>
                {team.tagline && (
                  <p className="mt-1 font-display text-[1.05rem] italic text-amber-400">
                    {team.tagline}
                  </p>
                )}
                {team.blurb && (
                  <p className="mt-3 font-sans text-[0.9rem] leading-relaxed text-cream-400">
                    {team.blurb}
                  </p>
                )}

                <ul className="mt-5 border-t u-rule pt-4">
                  {team.members.map((m) => (
                    <li
                      key={m.name + m.role}
                      className="flex items-baseline justify-between gap-4 py-1.5 font-sans text-[0.86rem]"
                    >
                      <span className="text-cream-50">{m.name}</span>
                      <span className="text-right text-cream-400">{m.role}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => onPickTeam(team.slug)}
                  className="mt-5 self-start border border-amber-400 px-4 py-2 font-sans text-[0.82rem] text-amber-400 transition-colors hover:bg-amber-400 hover:text-navy-950"
                >
                  {active ? 'Showing their dates' : 'See their dates'}
                </button>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
