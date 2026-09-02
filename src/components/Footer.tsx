export default function Footer() {
  return (
    <footer className="border-t u-rule bg-navy-950 text-cream-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <div className="flex items-center gap-4">
          <img
            src="/brand/sunggeet-mark.png"
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 rounded-full ring-1 ring-cream-50/15"
          />
          <div>
            <p className="font-display text-xl text-cream-50">Sung Sungeet</p>
            <p className="mt-0.5 font-sans text-[0.82rem]">
              Delhi NCR · open jamming, private events, stage shows
            </p>
          </div>
        </div>

        <ul className="flex flex-wrap gap-6 font-sans text-[0.85rem]">
          <li>
            <a
              href="https://www.instagram.com/sungsungeet"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-amber-400 underline-offset-4 hover:text-cream-50"
            >
              @sungsungeet
            </a>
          </li>
          <li>
            <a
              href="mailto:bookings@sungsungeet.example"
              className="underline decoration-amber-400 underline-offset-4 hover:text-cream-50"
            >
              bookings@sungsungeet.example
            </a>
          </li>
        </ul>
      </div>
    </footer>
  )
}
