import Footer from '../components/layout/Footer'
import Header from '../components/layout/Header'
import HeroSection from '../components/home/HeroSection'
import ServiceSection from '../components/home/ServiceSection'

function Home() {
  return (
    <div className="min-h-screen bg-surface-bright text-on-surface">
      <Header />
      <HeroSection />

      <section id="planner" className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-outline-variant bg-gradient-to-r from-primary/5 via-white to-tertiary/5 p-8 shadow-sm lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.9fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-primary/15 bg-white px-4 py-2 text-sm font-medium text-primary">
                Ready for the next phase
              </div>
              <h2 className="font-display text-3xl font-bold text-on-surface sm:text-4xl">
                This home page is now integrated into the current client app.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-on-surface-variant">
                The structure is ready for you to continue with search, booking, itinerary, and provider flows.
                It is intentionally built as a clean foundation instead of copying the old CSS file-by-file.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-primary">Traveler flow</p>
                <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                  After login, travelers can land on `/home` and continue into search and booking screens.
                </p>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-secondary">Provider flow</p>
                <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                  Providers are routed separately so later you can attach property management pages cleanly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ServiceSection />
      <Footer />
    </div>
  )
}

export default Home
