import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'

const slides = [
  {
    id: 1,
    image:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=80',
    badge: 'Transparent Giving',
    title: 'Support lives, track impact, and build lasting hope',
    text: 'Donate to meaningful NGO projects and follow real progress from funding to community outcomes.',
  },
  {
    id: 2,
    image:
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1400&q=80',
    badge: 'Community Impact',
    title: 'Every contribution should be visible, trusted, and measurable',
    text: 'From donors to beneficiaries, this platform helps connect generosity with clear project results.',
  },
  {
    id: 3,
    image:
      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1400&q=80',
    badge: 'Stronger NGOs',
    title: 'Empowering projects that improve health, education, and dignity',
    text: 'Discover active causes, follow updates, and support the work that matters most across communities.',
  },
]

function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }

  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(22,101,52,0.10),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.08),_transparent_30%)]" />

      <div className="relative mx-auto grid min-h-[88vh] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-16">
        <div className="order-2 lg:order-1">
          <span className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-800">
            <Sparkles size={16} />
            {slides[currentIndex].badge}
          </span>

          <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-tight text-gray-900 sm:text-5xl xl:text-6xl">
            {slides[currentIndex].title}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
            {slides[currentIndex].text}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/projects">
              <Button className="px-6 py-3">Explore Projects</Button>
            </Link>
            <Link to="/about">
              <Button variant="secondary" className="px-6 py-3">
                Learn More
              </Button>
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
              <HeartHandshake className="mb-3 text-green-700" size={20} />
              <p className="text-sm font-semibold text-gray-900">Trusted donations</p>
              <p className="mt-1 text-xs leading-6 text-gray-500">Support causes with confidence.</p>
            </div>

            <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
              <ShieldCheck className="mb-3 text-green-700" size={20} />
              <p className="text-sm font-semibold text-gray-900">Transparent reporting</p>
              <p className="mt-1 text-xs leading-6 text-gray-500">Track progress and outcomes clearly.</p>
            </div>

            <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-sm">
              <Sparkles className="mb-3 text-green-700" size={20} />
              <p className="text-sm font-semibold text-gray-900">Meaningful impact</p>
              <p className="mt-1 text-xs leading-6 text-gray-500">Connect giving to real community change.</p>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative overflow-hidden rounded-[30px] border border-white/40 bg-white shadow-2xl">
            <img
              src={slides[currentIndex].image}
              alt={slides[currentIndex].title}
              className="h-[320px] w-full object-cover sm:h-[420px] lg:h-[560px]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />

            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/30 bg-white/15 p-4 text-white backdrop-blur-md sm:p-5">
              <p className="text-sm font-medium opacity-90">Active support for communities</p>
              <p className="mt-2 text-xl font-semibold leading-snug sm:text-2xl">
                Better visibility for donations, projects, and beneficiary outcomes
              </p>
            </div>

            <div className="absolute bottom-5 right-5 flex gap-2">
              <button
                type="button"
                onClick={goPrev}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`h-2.5 rounded-full transition-all ${
                  currentIndex === index ? 'w-8 bg-green-800' : 'w-2.5 bg-green-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSlider