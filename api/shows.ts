import { db, json } from './_db'

/** GET /api/shows — published, upcoming, chronological, with RSVP counts. */
export default async function handler(request: Request) {
  if (request.method !== 'GET') return json({ error: 'method not allowed' }, 405)

  const visitorId = new URL(request.url).searchParams.get('visitor')

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
        count(r.visitor_id)::int as rsvp_count,
        bool_or(r.visitor_id::text = ${visitorId}) as going
      from shows s
      left join rsvps r on r.show_id = s.id
      where s.is_published
        and s.starts_at >= now() - interval '4 hours'
      group by s.id
      order by s.starts_at asc
      limit 60
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
          rsvpCount: r.rsvp_count,
          going: Boolean(r.going),
        })),
      },
      200,
      60,
    )
  } catch (err) {
    console.error('[api/shows]', err)
    return json({ error: 'could not load shows' }, 500)
  }
}
