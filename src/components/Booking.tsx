const ROOMS = [
  {
    kind: 'Cafés and open jams',
    body: 'The Tuesday format. We bring the players, the café brings the room, and anyone who wants the mic gets it.',
  },
  {
    kind: 'Private events and weddings',
    body: 'Sangeet, cocktail hour, house parties, offices. Setlist built around your people rather than our catalogue.',
  },
  {
    kind: 'Clubs and stage shows',
    body: 'Full band, full PA, a proper set. Awards nights, club dates, festival slots across NCR.',
  },
]

export default function Booking() {
  return (
    <section
      id="book"
      aria-labelledby="book-heading"
      className="border-t u-rule bg-navy-900 text-cream-50"
    >
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
        <h2
          id="book-heading"
          className="max-w-[16ch] font-display text-section leading-[0.95]"
        >
          Teen tarah ke rooms, ek hi band
        </h2>

        <dl className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-3">
          {ROOMS.map((room, i) => (
            <div key={room.kind} className="border-t u-rule pt-5">
              <dt className="font-display text-[1.45rem] text-cream-50">
                <span className="mr-3 font-sans text-[0.75rem] tracking-[0.22em] text-amber-400">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {room.kind}
              </dt>
              <dd className="mt-3 font-sans text-[0.92rem] leading-relaxed text-cream-400">
                {room.body}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-16 flex flex-col gap-6 border-t u-rule pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-lg font-display text-[1.6rem] leading-snug text-cream-50 sm:text-[2rem]">
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
