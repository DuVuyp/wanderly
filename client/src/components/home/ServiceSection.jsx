import { Building2, CalendarCheck2, MapPinned, ShieldCheck, Stars, WalletCards } from 'lucide-react'

const services = [
  {
    icon: Building2,
    title: 'Stay discovery',
    description: 'Browse hotels, homestays, villas, and resort options tailored to your style and budget.',
  },
  {
    icon: CalendarCheck2,
    title: 'Smart itinerary',
    description: 'Organize destinations, travel dates, and notes into one simple trip planning experience.',
  },
  {
    icon: WalletCards,
    title: 'Clear booking flow',
    description: 'Review room details, availability, and pricing before confirming your reservation.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure account',
    description: 'Authentication and session handling are built for traveler, provider, and admin roles.',
  },
  {
    icon: MapPinned,
    title: 'Map-based planning',
    description: 'Visualize destinations and turn saved properties into a more practical travel route.',
  },
  {
    icon: Stars,
    title: 'Provider-ready platform',
    description: 'Property owners can manage listings, room types, and booking operations in one place.',
  },
]

function ServiceSection() {
  return (
    <section id="services" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-4 inline-flex rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
            What Wanderly helps you do
          </div>
          <h2 className="font-display text-3xl font-bold text-on-surface sm:text-4xl">
            Rebuilt home experience, aligned with the current client app.
          </h2>
          <p className="mt-4 text-base leading-7 text-on-surface-variant">
            I kept the same travel-focused tone from your old template, but rewrote it to fit the current
            React + Tailwind structure and the app flow you already have.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon

            return (
              <article
                key={service.title}
                className="group rounded-[1.75rem] border border-outline-variant bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-tertiary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-on-surface">{service.title}</h3>
                <p className="text-sm leading-7 text-on-surface-variant">{service.description}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ServiceSection
