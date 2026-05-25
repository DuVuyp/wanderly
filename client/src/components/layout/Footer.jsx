import { Compass, Mail, MapPin, Phone } from 'lucide-react'

const footerLinks = {
  Product: ['Explore stays', 'Trip planner', 'Provider tools'],
  Company: ['About Wanderly', 'Travel guides', 'Support center'],
  Resources: ['FAQs', 'Terms of service', 'Privacy policy'],
}

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gradient-start to-gradient-end text-white shadow-lg shadow-black/20">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold">Wanderly</p>
              <p className="text-sm text-white/65">Travel platform for modern explorers</p>
            </div>
          </div>

          <p className="max-w-xl text-sm leading-7 text-white/70">
            Find places to stay, manage travel plans, and keep your booking journey organized from search to
            arrival.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/80">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <MapPin className="h-4 w-4" />
              Vietnam-first travel experiences
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <Mail className="h-4 w-4" />
              hello@wanderly.local
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <Phone className="h-4 w-4" />
              +84 123 456 789
            </div>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">{section}</h3>
              <ul className="space-y-3 text-sm text-white/65">
                {links.map((link) => (
                  <li key={link}>
                    <a href="/home" className="transition hover:text-white">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-5 border-t border-white/10 pt-6 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 Wanderly. All rights reserved.</p>
        <div className="flex items-center gap-3">
          {[Mail, MapPin, Phone].map((Icon, index) => (
            <a
              key={index}
              href="/home"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-white/10 hover:text-white"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default Footer
