-- Sample rows so the calendar has something to render. Replace with real dates.
insert into shows (starts_at, venue, city, event_type, set_name, note, ticket_url) values
  ('2026-09-12 20:30+05:30', 'Depot48',              'New Delhi', 'cafe',      'Jazz standards, Sufi second set', 'Two sets, no cover. Kitchen open till late.', null),
  ('2026-09-19 21:00+05:30', 'The Piano Man',        'New Delhi', 'cafe',      'Late-night trio',                 'Doors at 20:00. Seating is first come.',     'https://example.com/tickets/piano-man'),
  ('2026-09-27 18:00+05:30', 'Private residence',    'Gurugram',  'private',   'Wedding sangeet',                 'Closed event — listed so you know where we are.', null),
  ('2026-10-04 19:30+05:30', 'Sufi night, Nizamuddin', 'New Delhi', 'community', 'Qawwali-led set',               'Community gathering. Free entry, seating on the floor.', null),
  ('2026-10-11 20:00+05:30', 'Cafe Lota',            'New Delhi', 'cafe',      'Bollywood, reworked',             'One long set, 20:00 to 22:30.',             null),
  ('2026-10-18 17:30+05:30', 'Corporate offsite',    'Noida',     'private',   'Acoustic duo',                    'Closed event.',                              null),
  ('2026-10-25 19:00+05:30', 'Sector 29 amphitheatre', 'Gurugram', 'community', 'Diwali mela set',                'Open air. Bring something to sit on.',       null),
  ('2026-11-07 21:00+05:30', 'Summer House Cafe',    'New Delhi', 'cafe',      'Full band',                       'Cover charge at the door, redeemable.',      'https://example.com/tickets/summer-house'),
  ('2026-11-15 18:30+05:30', 'Gurudwara langar hall', 'Faridabad', 'community', 'Shabad kirtan',                  'Community event. All welcome.',              null);
