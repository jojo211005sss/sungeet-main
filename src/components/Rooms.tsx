const ROOMS = [
  {
    n: '01',
    kind: 'Cafés and open jams',
    body: 'The Tuesday format. We bring the players, the café brings the room, and anyone who wants the mic gets it.',
    img: '/rooms/cafes.jpg',
    focal: '50% 55%',
  },
  {
    n: '02',
    kind: 'Private events and weddings',
    body: 'Sangeet, cocktail hour, house parties, offices. Setlist built around your people rather than our catalogue.',
    img: '/rooms/private.jpg',
    focal: '50% 40%',
  },
  {
    n: '03',
    kind: 'Clubs and stage shows',
    body: 'Full band, full PA, a proper set. Awards nights, club dates, festival slots across NCR.',
    img: '/rooms/stage.jpg',
    focal: '55% 45%',
  },
]

/**
 * Full-bleed photo panels — three tall images side by side on desktop, stacked
 * on phones. The type sits on the photograph rather than beside it, so the
 * band's own rooms carry the section instead of a paragraph describing them.
 */
export default function Rooms() {
  return (
    <section
      id="book"
      aria-labelledby="book-heading"
      className="scroll-mt-16 border-t u-rule bg-navy-950 text-cream-50"
    >
      <div className="mx-auto max-w-6xl px-5 pt-20 sm:px-10 sm:pt-28">
        <h2
          id="book-heading"
          className="max-w-[16ch] font-display text-section leading-[0.95]"
        >
          Teen tarah ke rooms, ek hi band
        </h2>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-px bg-cream-50/10 sm:mt-16 sm:grid-cols-3">
        {ROOMS.map((room) => (
          <article
            key={room.kind}
            className="group relative min-h-[26rem] overflow-hidden bg-navy-900 sm:min-h-[34rem] lg:min-h-[40rem]"
          >
            <img
              src={room.img}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              style={{ objectPosition: room.focal }}
            />

            {/* Bottom-weighted scrim: the photo keeps its top half. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/10"
            />

            <div className="relative flex h-full flex-col justify-end p-6 sm:p-7">
              <span
                aria-hidden="true"
                className="font-display text-[3.5rem] leading-none text-amber-400/90 sm:text-[4.5rem]"
              >
                {room.n}
              </span>
              <h3 className="mt-3 font-display text-[1.75rem] leading-tight sm:text-[2rem]">
                {room.kind}
              </h3>
              <p className="mt-3 max-w-sm font-sans text-[0.9rem] leading-relaxed text-cream-200">
                {room.body}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="mx-auto max-w-6xl px-5 pb-20 sm:px-10 sm:pb-28">
        <div className="mt-14 flex flex-col gap-6 border-t u-rule pt-8 sm:flex-row sm:items-center sm:justify-between">
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
