import { db, hasDb, json } from './_db'

/**
 * GET /api/shows — published, upcoming, chronological, with team + lineup.
 *
 * Cached for 24 hours at the edge. The staff backend owns writes to these
 * tables; this endpoint deliberately serves stale-while-revalidate so a manager
 * editing a date sees it propagate on the next daily rotation rather than
 * hammering the database on every page view. To publish sooner, purge the
 * Vercel cache or redeploy.
 *
 * RSVP counts are NOT here — they'd be frozen for a day. See /api/rsvp-state.
 */
const DAY = 86400

export default async function handler(request: Request) {
  if (request.method !== 'GET') return json({ error: 'method not allowed' }, 405)

  // A demo deployment has no database. Answer with a clear, non-error status so
  // this doesn't fill the Vercel logs with 500s that look like real faults —
  // the client falls back to its seed data either way.
  if (!hasDb()) return json({ code: 'no_database', error: 'no database configured' }, 503)

  try {
    const sql = db()
    const rows = await sql`
      select
        s.id,
        s.starts_at,
        s.venue,
        s.city,
        s.event_type,
        s.set_name,
        s.note,
        s.ticket_url,
        s.poster_url,
        t.slug as team_slug,
        t.name as team_name,
        -- Per-date override if show_lineup has rows for this show, otherwise
        -- the team's default roster.
        coalesce(
          (
            select json_agg(json_build_object('name', m.name, 'role', m.role)
                            order by m.sort_order)
            from show_lineup sl
            join team_members m on m.id = sl.member_id
            where sl.show_id = s.id
          ),
          (
            select json_agg(json_build_object('name', m.name, 'role', m.role)
                            order by m.sort_order)
            from team_members m
            where m.team_id = t.id
          ),
          '[]'::json
        ) as lineup,
        exists (select 1 from show_lineup sl where sl.show_id = s.id) as lineup_is_override
      from shows s
      left join teams t on t.id = s.team_id
      where s.is_published
        and s.starts_at >= now() - interval '4 hours'
      order by s.starts_at asc
      limit 200
    `

    return json(
      {
        shows: rows.map((r) => ({
          id: String(r.id),
          startsAt: new Date(r.starts_at as string).toISOString(),
          venue: r.venue,
          city: r.city,
          eventType: r.event_type,
          setName: r.set_name,
          note: r.note,
          ticketUrl: r.ticket_url,
          posterUrl: r.poster_url,
          teamSlug: r.team_slug,
          teamName: r.team_name,
          lineup: r.lineup ?? [],
          lineupIsOverride: Boolean(r.lineup_is_override),
        })),
      },
      200,
      DAY,
    )
  } catch (err) {
    console.error('[api/shows]', err)
    return json({ error: 'could not load shows' }, 500)
  }
}
