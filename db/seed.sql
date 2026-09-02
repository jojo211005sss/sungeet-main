-- Sample rows so the site renders. Every name, date and venue below is INVENTED.
-- Replace before this goes public — or let the staff backend own it entirely.

insert into teams (slug, name, tagline, blurb, sort_order) values
  ('tuesday-trio', 'The Tuesday Trio', 'The open-jam house band',
   'Three of us hold the room down every Tuesday so anyone who wants the mic can take it. Jazz standards early, whatever the room asks for after.', 1),
  ('sufi-collective', 'Sufi Collective', 'Qawwali-led, harmonium forward',
   'Built for dargahs, gurudwaras and the second half of a long night. Acoustic where the space needs it.', 2),
  ('full-band', 'The Full Band', 'Six pieces, full PA',
   'Club dates, awards nights and weddings that want the volume. Bollywood reworked, jazz heads, and a horn section when the budget allows.', 3);

insert into team_members (team_id, name, role, sort_order)
select id, m.name, m.role, m.ord from teams, (values
  ('Aditya', 'vocals, guitar', 1), ('Rhea', 'vocals', 2), ('Kabir', 'cajon', 3)
) as m(name, role, ord) where slug = 'tuesday-trio';

insert into team_members (team_id, name, role, sort_order)
select id, m.name, m.role, m.ord from teams, (values
  ('Imran', 'lead vocals', 1), ('Sahil', 'harmonium', 2), ('Danish', 'tabla', 3), ('Rhea', 'vocals', 4)
) as m(name, role, ord) where slug = 'sufi-collective';

insert into team_members (team_id, name, role, sort_order)
select id, m.name, m.role, m.ord from teams, (values
  ('Aditya', 'vocals, guitar', 1), ('Rhea', 'vocals', 2), ('Kabir', 'drums', 3),
  ('Naman', 'bass', 4), ('Sahil', 'keys', 5), ('Tara', 'saxophone', 6)
) as m(name, role, ord) where slug = 'full-band';

insert into shows (starts_at, venue, city, event_type, team_id, set_name, note, ticket_url)
select v.starts_at::timestamptz, v.venue, v.city, v.event_type,
       (select id from teams where slug = v.team_slug), v.set_name, v.note, v.ticket_url
from (values
  ('2026-09-08 20:30+05:30', 'Chords & Coffee',        'New Delhi', 'cafe',      'tuesday-trio',    'Open jamming',                    'Every Tuesday. Put your name down at the counter.', null),
  ('2026-09-12 20:30+05:30', 'Depot48',                'New Delhi', 'cafe',      'full-band',       'Jazz standards, Sufi second set',  'Two sets, no cover. Kitchen open till late.', null),
  ('2026-09-15 20:30+05:30', 'Chords & Coffee',        'New Delhi', 'cafe',      'tuesday-trio',    'Open jamming',                    'Every Tuesday. Put your name down at the counter.', null),
  ('2026-09-19 21:00+05:30', 'The Piano Man',          'New Delhi', 'cafe',      'full-band',       'Late-night trio',                 'Doors at 20:00. Seating is first come.', 'https://example.com/tickets/piano-man'),
  ('2026-09-22 20:30+05:30', 'Chords & Coffee',        'New Delhi', 'cafe',      'tuesday-trio',    'Open jamming',                    'Every Tuesday. Put your name down at the counter.', null),
  ('2026-09-27 18:00+05:30', 'Private residence',      'Gurugram',  'private',   'full-band',       'Wedding sangeet',                 'Closed event — listed so you know where we are.', null),
  ('2026-09-29 20:30+05:30', 'Chords & Coffee',        'New Delhi', 'cafe',      'tuesday-trio',    'Open jamming',                    'Every Tuesday. Put your name down at the counter.', null),
  ('2026-10-04 19:30+05:30', 'Sufi night, Nizamuddin', 'New Delhi', 'community', 'sufi-collective', 'Qawwali-led set',                 'Free entry, seating on the floor.', null),
  ('2026-10-11 20:00+05:30', 'Cafe Lota',              'New Delhi', 'cafe',      'full-band',       'Bollywood, reworked',             'One long set, 20:00 to 22:30.', null),
  ('2026-10-18 17:30+05:30', 'Corporate offsite',      'Noida',     'private',   'tuesday-trio',    'Acoustic duo',                    'Closed event.', null),
  ('2026-10-25 19:00+05:30', 'Sector 29 amphitheatre', 'Gurugram',  'community', 'full-band',       'Diwali mela set',                 'Open air. Bring something to sit on.', null),
  ('2026-11-07 21:00+05:30', 'Summer House Cafe',      'New Delhi', 'cafe',      'full-band',       'Full band',                       'Cover charge at the door, redeemable.', 'https://example.com/tickets/summer-house'),
  ('2026-11-15 18:30+05:30', 'Gurudwara langar hall',  'Faridabad', 'community', 'sufi-collective', 'Shabad kirtan',                   'All welcome.', null)
) as v(starts_at, venue, city, event_type, team_slug, set_name, note, ticket_url);

-- Example of a per-date lineup override: Rhea sits out the 19th.
insert into show_lineup (show_id, member_id)
select s.id, tm.id
from shows s
join teams t on t.id = s.team_id
join team_members tm on tm.team_id = t.id
where s.venue = 'The Piano Man' and tm.name <> 'Rhea';
