import { useState } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import ScrollWalkthrough from './components/ScrollWalkthrough'
import Calendar from './components/Calendar'
import Teams from './components/Teams'
import Rooms from './components/Rooms'
import JoinUs from './components/JoinUs'
import Footer from './components/Footer'
import { useLenis } from './lib/useLenis'
import { useReducedMotion } from './lib/useMediaQuery'
import { useSiteData } from './lib/useSiteData'

export default function App() {
  const reduced = useReducedMotion()
  useLenis(!reduced)

  const data = useSiteData()

  // Shared between the teams grid and the calendar: picking a team from either
  // filters the other.
  const [teamFilter, setTeamFilter] = useState<string | 'all'>('all')

  const pickTeamAndScroll = (slug: string) => {
    setTeamFilter((current) => (current === slug ? 'all' : slug))
    const shows = document.getElementById('shows')
    if (shows) {
      // Not scrollIntoView — it fights Lenis and misbehaves in embedded frames.
      window.scrollTo({
        top: shows.getBoundingClientRect().top + window.scrollY,
        behavior: reduced ? 'auto' : 'smooth',
      })
    }
  }

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ScrollWalkthrough />
        <Calendar {...data} teamFilter={teamFilter} onTeamFilter={setTeamFilter} />
        <Teams
          teams={data.teams}
          activeSlug={teamFilter}
          onPickTeam={pickTeamAndScroll}
        />
        <Rooms />
        <JoinUs />
      </main>
      <Footer />
    </>
  )
}
