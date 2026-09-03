import { db, json } from './_db'

/** GET /api/teams — active teams with their default roster. Cached 24h. */
const DAY = 86400

export default async function handler(request: Request) {
  if (request.method !== 'GET') return json({ error: 'method not allowed' }, 405)

  try {
    const sql = db()
    const rows = await sql`
      select
        t.slug,
        t.name,
        t.tagline,
        t.blurb,
        t.photo_url,
        t.video_url,
        t.media,
        coalesce(
          (
            select json_agg(json_build_object('name', m.name, 'role', m.role,
                                              'photoUrl', m.photo_url)
                            order by m.sort_order)
            from team_members m
            where m.team_id = t.id
          ),
          '[]'::json
        ) as members
      from teams t
      where t.is_active
      order by t.sort_order asc, t.name asc
    `

    return json(
      {
        teams: rows.map((r) => ({
          slug: r.slug,
          name: r.name,
          tagline: r.tagline,
          blurb: r.blurb,
          // `media` is the new shape: an ordered list of slots, showreel
          // first. photo_url / video_url are kept as a fallback so an older
          // row still renders something.
          media:
            (r.media as unknown[] | null)?.length
              ? r.media
              : [
                  { kind: 'video', src: r.video_url, poster: r.photo_url, label: 'Showreel' },
                  { kind: 'photo', src: r.photo_url, label: 'Team photo' },
                ],
          members: r.members ?? [],
        })),
      },
      200,
      DAY,
    )
  } catch (err) {
    console.error('[api/teams]', err)
    return json({ error: 'could not load teams' }, 500)
  }
}
