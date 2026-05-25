import { useEffect, useMemo, useState } from 'react'
import {
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Pause,
  Play,
  Sparkles,
} from 'lucide-react'

const slides = [
  {
    image:
      'https://static-images.vnncdn.net/files/publish/2022/7/27/ha-long-bay-1-852.jpg',
    title: 'Ha Long Bay',
    description:
      'Cruise between limestone islands, sunrise decks, and boutique stays crafted for memorable escapes.',
    badge: 'UNESCO Wonder',
  },
  {
    image:
      'https://phunugioi.com/wp-content/uploads/2021/10/Hinh-anh-Hoi-An-1.jpg',
    title: 'Hoi An',
    description:
      'Lantern streets, riverside cafés, and tailor-made experiences wrapped in heritage charm.',
    badge: 'Heritage Town',
  },
  {
    image:
      'https://img4.thuthuatphanmem.vn/uploads/2020/12/26/anh-phong-nha-ke-bang-huyen-ao_101202393.jpg',
    title: 'Phong Nha Cave',
    description:
      'Adventure-filled journeys through underground rivers, caves, and untouched green landscapes.',
    badge: 'Adventure Escape',
  },
  {
    image:
      'https://haycafe.vn/wp-content/uploads/2022/01/Hinh-anh-Da-Lat-canh-suong-mu-ban-dem.jpg',
    title: 'Da Lat',
    description:
      'Cool weather, dreamy pine hills, and cozy stays perfect for couples and slow travel lovers.',
    badge: 'Romantic Retreat',
  },
]

function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  useEffect(() => {
    if (!isAutoPlay) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      setCurrentIndex((previousIndex) => (previousIndex + 1) % slides.length)
    }, 4500)

    return () => window.clearInterval(intervalId)
  }, [isAutoPlay])

  const currentSlide = useMemo(() => slides[currentIndex], [currentIndex])

  const goToPrevious = () => {
    setCurrentIndex((previousIndex) => (previousIndex - 1 + slides.length) % slides.length)
  }

  const goToNext = () => {
    setCurrentIndex((previousIndex) => (previousIndex + 1) % slides.length)
  }

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-24 lg:pt-10">
      <div className="hero-blob right-[-120px] top-[10%] h-80 w-80 bg-gradient-end opacity-25" />
      <div className="hero-blob left-[-120px] top-[45%] h-96 w-96 bg-gradient-start opacity-20" />

      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_1.2fr] lg:items-center">
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-4 py-2 text-sm font-medium text-primary shadow-sm backdrop-blur">
            <Sparkles className="h-4 w-4" />
            Build smarter trips with Wanderly
          </div>

          <div className="space-y-4">
            <h1 className="font-display text-4xl font-bold leading-tight text-on-surface sm:text-5xl lg:text-6xl">
              Discover stays, plan journeys, and travel with more confidence.
            </h1>
            <p className="max-w-xl text-base leading-7 text-on-surface-variant sm:text-lg">
              From tropical beaches to hidden mountain retreats, Wanderly helps you find the right place,
              organize your itinerary, and keep every booking in one seamless flow.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="#destinations"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-gradient-start to-button-gradient-pink px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-container/30 transition hover:scale-[1.02]"
            >
              Explore destinations
            </a>
            <a
              href="#planner"
              className="inline-flex items-center justify-center rounded-2xl border border-outline-variant bg-white px-6 py-3.5 text-sm font-semibold text-on-surface transition hover:border-primary/30 hover:text-primary"
            >
              Start planning
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="glass-card rounded-3xl p-4 shadow-sm">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-on-surface">2K+</p>
              <p className="text-sm text-on-surface-variant">Destinations curated for travelers</p>
            </div>
            <div className="glass-card rounded-3xl p-4 shadow-sm">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                <CalendarRange className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-on-surface">24/7</p>
              <p className="text-sm text-on-surface-variant">Trip planning support and booking access</p>
            </div>
            <div className="glass-card rounded-3xl p-4 shadow-sm">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-tertiary/10 text-tertiary">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-on-surface">10K+</p>
              <p className="text-sm text-on-surface-variant">Travelers discovering better stays</p>
            </div>
          </div>
        </div>

        <div id="destinations" className="relative z-10">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-white/50 shadow-2xl shadow-primary/10 backdrop-blur-sm">
            <div className="absolute inset-x-0 top-0 z-20 h-1 bg-white/30">
              <div
                key={currentIndex}
                className="h-full animate-[fill_4.5s_linear_forwards] bg-gradient-to-r from-gradient-start via-button-gradient-pink to-gradient-end"
              />
            </div>

            <div className="absolute left-4 right-4 top-4 z-20 flex items-center justify-between">
              <div className="flex gap-2">
                {slides.map((slide, index) => (
                  <button
                    key={slide.title}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={[
                      'h-3 rounded-full transition-all',
                      index === currentIndex ? 'w-10 bg-white shadow' : 'w-3 bg-white/45 hover:bg-white/70',
                    ].join(' ')}
                    aria-label={`Go to ${slide.title}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsAutoPlay((value) => !value)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-black/25 text-white backdrop-blur transition hover:bg-black/35"
                aria-label={isAutoPlay ? 'Pause slideshow' : 'Play slideshow'}
              >
                {isAutoPlay ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
              </button>
            </div>

            <div className="relative h-[520px] w-full overflow-hidden sm:h-[620px]">
              {slides.map((slide, index) => (
                <div
                  key={slide.title}
                  className={[
                    'absolute inset-0 bg-cover bg-center transition-opacity duration-500',
                    index === currentIndex ? 'opacity-100' : 'pointer-events-none opacity-0',
                  ].join(' ')}
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
              ))}

              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 z-20 p-5 sm:p-8">
                <div className="mb-4 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
                  {currentSlide.badge}
                </div>
                <h2 className="mb-3 font-display text-3xl font-bold text-white sm:text-4xl">
                  {currentSlide.title}
                </h2>
                <p className="max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                  {currentSlide.description}
                </p>
              </div>

              <button
                type="button"
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-black/25 text-white backdrop-blur transition hover:scale-105 hover:bg-black/35"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goToNext}
                className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-black/25 text-white backdrop-blur transition hover:scale-105 hover:bg-black/35"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 border-t border-white/40 bg-white/75 p-3 sm:p-4">
              {slides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => setCurrentIndex(index)}
                  className={[
                    'overflow-hidden rounded-2xl border-2 text-left transition-all',
                    index === currentIndex
                      ? 'border-white shadow-lg shadow-primary/20'
                      : 'border-transparent opacity-80 hover:opacity-100',
                  ].join(' ')}
                >
                  <div className="h-20 bg-cover bg-center sm:h-24" style={{ backgroundImage: `url(${slide.image})` }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
