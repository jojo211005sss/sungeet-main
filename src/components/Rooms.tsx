const ROOMS = [
  {
    n: '01',
    stamp: 'Every Tuesday',
    kind: 'Cafés and open jams',
    body: 'We bring the players, the café brings the room, and anyone who wants the mic gets it. Put your name down at the counter.',
    img: '/rooms/cafes.jpg',
    focal: '50% 55%',
    side: 'left' as const,
    tilt: '-1.6deg',
  },
  {
    n: '02',
    stamp: 'Closed events',
    kind: 'Private events and weddings',
    body: 'Sangeet, cocktail hour, house parties, offices. The setlist gets built around your people, not our catalogue.',
    img: '/rooms/private.jpg',
    focal: '50% 40%',
    side: 'right' as const,
    tilt: '1.3deg',
  },
  {
    n: '03',
    stamp: 'Full PA',
    kind: 'Clubs and stage shows',
    body: 'Six pieces, a proper set, and the volume to match. Awards nights, club dates and festival slots across NCR.',
    img: '/rooms/stage.jpg',
    focal: '55% 45%',
    side: 'left' as const,
    tilt: '-0.9deg',
  },
]

/**
 * Editorial spread rather than three equal columns: each room is a tilted
 * print with a caption card overlapping its corner, an outlined numeral
 * bleeding off the edge, and a rotated stamp. The alternating sides give the
 * section a vertical rhythm a symmetric grid can't.
 */
function RoomPanel({ room }: { room: (typeof ROOMS)[number] }) {
  const imageLeft = room.side === 'left'

  // Both cells are pinned to row 1 and their columns deliberately overlap by
  // one, so the caption sits on the photograph. Without an explicit row,
  // grid auto-placement refuses to overlap and drops the caption underneath.
  const imageCell = imageLeft
    ? 'sm:col-start-1 sm:col-span-8 sm:row-start-1'
    : 'sm:col-start-5 sm:col-span-8 sm:row-start-1'
  const captionCell = imageLeft
    ? 'sm:col-start-8 sm:col-span-5 sm:row-start-1 sm:-ml-8 lg:-ml-12'
    : 'sm:col-start-1 sm:col-span-5 sm:row-start-1 sm:-mr-8 lg:-mr-12'

  return (
    <article className="group relative">
      <div className="grid items-center gap-y-6 sm:grid-cols-12">
        {/* Photograph */}
        <div className={`relative ${imageCell}`}>
          <div
            className="relative overflow-hidden transition-transform duration-700 ease-out group-hover:!rotate-0 motion-reduce:!rotate-0"
            style={{ rotate: room.tilt }}
          >
            <img
              src={room.img}
              alt=""
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
              style={{ objectPosition: room.focal }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-navy-950/25"
            />
          </div>

          {/* Rotated stamp, half on the image, half off it. */}
          <span
            className={`absolute -top-3 z-20 border border-amber-400 bg-navy-950 px-3 py-1.5 font-sans text-[0.62rem] uppercase tracking-[0.22em] text-amber-400 ${
              imageLeft ? 'left-4 sm:left-8' : 'right-4 sm:right-8'
            }`}
            style={{ rotate: imageLeft ? '-3deg' : '3deg' }}
          >
            {room.stamp}
          </span>
        </div>

        {/* Caption card, overlapping the photograph's inner edge. */}
        <div className={`relative z-10 ${captionCell}`}>
          <div className="border u-rule bg-navy-950/95 p-6 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)] sm:p-7">
            <h3 className="font-display text-[1.7rem] leading-[1.05] sm:text-[2.1rem]">
              {room.kind}
            </h3>
            <p className="mt-4 font-sans text-[0.9rem] leading-relaxed text-cream-400">
              {room.body}
            </p>
          </div>
        </div>
      </div>

      {/* Outlined numeral, bleeding off the outer edge. Decorative. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-8 hidden select-none font-display text-[9rem] leading-none text-transparent sm:block lg:text-[12rem] ${
          imageLeft ? '-right-2' : '-left-2'
        }`}
        style={{ WebkitTextStroke: '1px rgba(212,141,70,0.38)' }}
      >
        {room.n}
      </span>
    </article>
  )
}

export default function Rooms() {
  return (
    <section
      id="book"
      aria-labelledby="book-heading"
      className="scroll-mt-16 overflow-hidden border-t u-rule bg-navy-950 text-cream-50"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-10 sm:py-28">
        <header className="max-w-3xl">
          <p className="font-sans text-[0.72rem] uppercase tracking-[0.24em] text-amber-400">
            Where we play
          </p>
          <h2
            id="book-heading"
            className="mt-4 font-display text-section leading-[0.92]"
          >
            Teen tarah ke rooms, <em className="text-amber-400">ek hi band</em>
          </h2>
        </header>

        <div className="mt-20 space-y-24 sm:space-y-32">
          {ROOMS.map((room) => (
            <RoomPanel key={room.kind} room={room} />
          ))}
        </div>

        <div className="mt-24 flex flex-col gap-6 border-t u-rule pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-lg font-display text-[1.6rem] leading-snug sm:text-[2rem]">
            Tell us the room, the date, and roughly how many people. We&rsquo;ll
            send back a set plan and a number.
          </p>
          <a
            href="mailto:bookings@sungsungeet.example?subject=Booking%20enquiry"
            className="shrink-0 border border-amber-400 px-6 py-3 font-sans text-[0.88rem] text-amber-400 transition-colors hover:bg-amber-400 hover:text-navy-950"
          >
            Start an enquiry
          </a>
        </div>
      </div>
    </section>
  )
}
