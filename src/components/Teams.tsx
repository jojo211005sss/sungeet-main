import { monogram, type Team } from '../data/teams'
import MediaStack from './MediaStack'

type Props = {
  teams: Team[]
  activeSlug: string | 'all'
  onPickTeam: (slug: string) => void
  onBookTeam: (slug: string) => void
}

/** Slight, fixed tilts so the cards read as pinned-up prints, not a CSS grid. */
const TILT = ['-1.4deg', '0.9deg', '-0.6deg']

export default function Teams({
  teams,
  activeSlug,
  onPickTeam,
  onBookTeam,
}: Props) {
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
            Flip through each one.
          </p>
        </header>

        <div className="mt-16 grid gap-x-10 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team, i) => {
            const active = activeSlug === team.slug
            return (
              <article key={team.slug} className="flex flex-col">
                <div
                  className="transition-transform duration-500 ease-out hover:!rotate-0 motion-reduce:!rotate-0"
                  style={{ rotate: TILT[i % TILT.length] }}
                >
                  <div className={active ? 'ring-2 ring-amber-400 ring-offset-4 ring-offset-navy-950' : ''}>
                    <MediaStack items={team.media} monogram={monogram(team.name)} />
                  </div>
                </div>

                <div className="mt-6 flex items-baseline gap-3">
                  <span
                    aria-hidden="true"
                    className="font-sans text-[0.72rem] tracking-[0.22em] text-amber-400"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-[1.7rem] leading-tight">
                    {team.name}
                  </h3>
                </div>

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

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => onPickTeam(team.slug)}
                    className="border border-amber-400 px-4 py-2 font-sans text-[0.82rem] text-amber-400 transition-colors hover:bg-amber-400 hover:text-navy-950"
                  >
                    {active ? 'Showing their dates' : 'See their dates'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onBookTeam(team.slug)}
                    className="border border-cream-50/30 px-4 py-2 font-sans text-[0.82rem] text-cream-50 transition-colors hover:border-cream-50 hover:bg-cream-50 hover:text-navy-950"
                  >
                    Book them
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
