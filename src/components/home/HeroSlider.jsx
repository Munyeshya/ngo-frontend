import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'

const slides = [
  {
    id: 1,
    image:
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1600&q=80',
    title: 'Give Hope, Support Lives',
    text: 'Help fund meaningful NGO projects and follow transparent progress from donation to community impact.',
    amount: '$1,284,528',
    people: '12,460',
  },
  {
    id: 2,
    image:
      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1600&q=80',
    title: 'Together We Can Change Lives For The Better',
    text: 'Discover active causes, follow project updates, and support organizations making measurable change.',
    amount: '$938,200',
    people: '9,870',
  },
  {
    id: 3,
    image:
      'https://images.unsplash.com/photo-1593113598332-cd59a93d7c2b?auto=format&fit=crop&w=1600&q=80',
    title: 'Transforming Good Intentions Into Real Action',
    text: 'A better public NGO platform for trust, visibility, and impact-focused giving.',
    amount: '$1,762,310',
    people: '18,240',
  },
]

function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 6000)

    return () => clearInterval(timer)
  }, [])

  const currentSlide = slides[currentIndex]

  return (
    <section className="relative min-h-[88vh] overflow-hidden bg-black">
      <img
        src={currentSlide.image}
        alt={currentSlide.title}
        className="absolute inset-0 h-full w-full object-cover opacity-55"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(22,101,52,0.35),_transparent_25%)]" />

      <div className="relative mx-auto flex min-h-[88vh] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-green-200 backdrop-blur">
            Transparent giving for stronger communities
          </span>

          <h1 className="mt-8 max-w-3xl text-5xl font-bold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
            {currentSlide.title}
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-white/70 sm:text-lg">
            {currentSlide.text}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/projects">
              <Button variant="accent" className="px-7 py-3.5">
                Explore Projects
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="darkOutline" className="px-7 py-3.5">
                Learn More
              </Button>
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-8">
            <div>
              <p className="text-3xl font-bold text-green-400">{currentSlide.amount}</p>
              <p className="mt-1 text-sm text-white/70">Donations mobilized</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-400">{currentSlide.people}</p>
              <p className="mt-1 text-sm text-white/70">People helped</p>
            </div>
          </div>

          <div className="mt-10 flex items-center gap-3">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`h-2.5 rounded-full transition-all ${
                  currentIndex === index ? 'w-10 bg-green-500' : 'w-2.5 bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-4 flex gap-2 sm:right-6 lg:right-8">
        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  )
}

export default HeroSlider