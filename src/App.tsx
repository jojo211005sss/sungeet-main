import Nav from './components/Nav'
import Hero from './components/Hero'
import ScrollWalkthrough from './components/ScrollWalkthrough'
import Shows from './components/Shows'
import Booking from './components/Booking'
import Footer from './components/Footer'
import { useLenis } from './lib/useLenis'
import { useReducedMotion } from './lib/useMediaQuery'

export default function App() {
  const reduced = useReducedMotion()
  useLenis(!reduced)

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <ScrollWalkthrough />
        <Shows />
        <Booking />
      </main>
      <Footer />
    </>
  )
}
