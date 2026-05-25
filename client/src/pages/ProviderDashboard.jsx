import { Building2, Hotel, PlusCircle } from 'lucide-react'
import Footer from '../components/layout/Footer'
import Header from '../components/layout/Header'

function ProviderDashboard() {
  return (
    <div className="min-h-screen bg-surface-bright text-on-surface">
      <Header />
      <main className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 rounded-[2rem] bg-gradient-to-r from-secondary/10 via-white to-primary/10 p-8 shadow-sm">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex rounded-full border border-secondary/15 bg-white px-4 py-2 text-sm font-medium text-secondary">
                Provider workspace
              </div>
              <h1 className="font-display text-3xl font-bold sm:text-4xl">Manage your properties from one place.</h1>
              <p className="mt-4 text-base leading-7 text-on-surface-variant">
                This is a starter landing page for provider accounts. You can now connect it to property CRUD,
                room type management, and booking moderation flows.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-[1.75rem] bg-white p-6 shadow-sm">
              <Building2 className="mb-4 h-10 w-10 text-primary" />
              <h2 className="text-lg font-semibold">Property management</h2>
              <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                Add and update hotels, homestays, villas, and resorts owned by your provider account.
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-white p-6 shadow-sm">
              <Hotel className="mb-4 h-10 w-10 text-secondary" />
              <h2 className="text-lg font-semibold">Room inventory</h2>
              <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                Organize room types, room numbers, and current availability or maintenance status.
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-white p-6 shadow-sm">
              <PlusCircle className="mb-4 h-10 w-10 text-tertiary" />
              <h2 className="text-lg font-semibold">Next implementation step</h2>
              <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                This route is now ready to become the real provider dashboard for Sprint 2.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default ProviderDashboard
