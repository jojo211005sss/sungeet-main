import { useState } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import ScrollWalkthrough from './components/ScrollWalkthrough'
import Calendar from './components/Calendar'
import Teams from './components/Teams'
import Rooms from './components/Rooms'
import Community from './components/Community'
import MemberArea from './components/MemberArea'
import JoinUs from './components/JoinUs'
import Footer from './components/Footer'
import { useLenis } from './lib/useLenis'
import { useReducedMotion } from './lib/useMediaQuery'
import { useSiteData } from './lib/useSiteData'
import { useHashView } from './lib/useHashView'

export default function App() {
  const reduced = useReducedMotion()
  const hash = useHashView()
  const inMemberArea = hash === '#member'

  // Lenis is for the long scrolling page; the member area is a plain document.
  useLenis(!reduced && !inMemberArea)

  const data = useSiteData()

  // Shared between the teams grid and the calendar: picking a team from either
  // filters the other.
  const [teamFilter, setTeamFilter] = useState<string | 'all'>('all')

  // Which team a "Book them" press was for, so the enquiry arrives prefilled.
  const [enquiryTeam, setEnquiryTeam] = useState<string | null>(null)

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    // Not scrollIntoView — it fights Lenis and misbehaves in embedded frames.
    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY,
      behavior: reduced ? 'auto' : 'smooth',
    })
  }

  const bookTeam = (slug: string) => {
    const team = data.teams.find((t) => t.slug === slug)
    setEnquiryTeam(team?.name ?? null)
    scrollTo('book')
  }

  const pickTeamAndScroll = (slug: string) => {
    setTeamFilter((current) => (current === slug ? 'all' : slug))
    scrollTo('shows')
  }

  if (inMemberArea) return <MemberArea />

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
          onBookTeam={bookTeam}
        />
        <Rooms
          enquiryTeam={enquiryTeam}
          onClearEnquiry={() => setEnquiryTeam(null)}
        />
        <Community />
        <JoinUs />
      </main>
      <Footer />
    </>
  )
}
