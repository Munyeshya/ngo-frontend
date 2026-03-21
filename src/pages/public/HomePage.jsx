import { Link } from 'react-router-dom'
import {
  ArrowRight,
  HeartHandshake,
  ShieldCheck,
  HandCoins,
  Users,
  HeartPulse,
  Play,
} from 'lucide-react'
import HeroSlider from '../../components/home/HeroSlider'
import SectionTitle from '../../components/common/SectionTitle'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import AnimatedBackground from '../../components/common/AnimatedBackground'

const features = [
  {
    icon: HeartHandshake,
    title: 'Choose your cause',
    text: 'Browse active NGO projects and explore the causes that matter most.',
  },
  {
    icon: ShieldCheck,
    title: 'Track transparency',
    text: 'Follow visible progress and understand how support connects to results.',
  },
  {
    icon: HandCoins,
    title: 'Donate confidently',
    text: 'Support projects through a cleaner public giving experience.',
  },
  {
    icon: Users,
    title: 'Stay connected',
    text: 'Receive updates and follow how initiatives impact communities.',
  },
]

function HomePage() {
  return (
    <div className="bg-white">
      <HeroSlider />

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
            <div className="overflow-hidden rounded-[28px] shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1527525443983-6e60c75fff46?auto=format&fit=crop&w=1200&q=80"
                alt="Helping communities"
                className="h-[340px] w-full object-cover sm:h-[420px] lg:h-[500px]"
              />
            </div>

            <div>
              <h2 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
                Transforming good intentions into good actions
              </h2>

              <p className="mt-6 text-base leading-8 text-gray-600">
                The platform is designed to help donors, communities, and NGOs connect through
                transparent project visibility, trusted giving, and impact-focused communication.
              </p>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {features.map((item, index) => {
                  const Icon = item.icon

                  return (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-700 text-sm font-bold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{item.title}</p>
                        <p className="mt-1 text-sm leading-7 text-gray-600">{item.text}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F6F6F4]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-20">
          <div>
            <div className="text-6xl font-bold leading-none text-green-700">“</div>
            <h3 className="mt-3 max-w-md text-3xl font-bold leading-tight text-gray-900">
              Together, we can change lives for the better
            </h3>
            <p className="mt-5 max-w-md text-sm leading-8 text-gray-600">
              Transparent digital experiences help people trust what they support. By making
              project progress, updates, and outcomes clearer, NGOs can build stronger and more
              lasting relationships with donors and communities.
            </p>

            <div className="mt-6">
              <p className="font-semibold text-gray-900">NGO Platform</p>
              <p className="text-sm text-gray-500">Public impact experience</p>
            </div>

            <div className="mt-8 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-green-600" />
              <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[24px] shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&w=1200&q=80"
              alt="Story section"
              className="h-[340px] w-full object-cover sm:h-[420px]"
            />
            <div className="absolute inset-0 bg-black/15" />
            <button
              type="button"
              className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition hover:bg-green-700"
            >
              <Play size={22} className="ml-1" />
            </button>
          </div>
        </div>
      </section>
      <section className="relative overflow-hidden bg-black">
        <AnimatedBackground variant="dark" />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-16 text-center sm:px-6 lg:flex-row lg:px-8 lg:text-left">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-green-300">
              Support transparent change
            </p>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
              Help fund projects that deliver visible community impact
            </h2>
            <p className="mt-4 text-base leading-8 text-white/70">
              Explore causes, follow updates, and contribute to meaningful initiatives with
              confidence.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 lg:justify-end">
            <Link to="/projects">
              <Button variant="accent">Browse Projects</Button>
            </Link>
            <Link to="/contact">
              <Button variant="darkOutline">Contact Us</Button>
            </Link>
          </div>
        </div>
      </section>
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionTitle
            badge="Core focus"
            title="Support causes that create visible community change"
            text="Discover how this platform presents impact through projects, beneficiaries, updates, and donations."
            center
          />

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[
              {
                title: 'Health support',
                text: 'Improving access to medical outreach, preventive care, and community health services.',
                icon: HeartPulse,
              },
              {
                title: 'Community care',
                text: 'Helping vulnerable groups through direct support and sustainable local initiatives.',
                icon: Users,
              },
              {
                title: 'Transparent funding',
                text: 'Showing how donations contribute to visible progress and project milestones.',
                icon: HandCoins,
              },
            ].map((item) => {
              const Icon = item.icon

              return (
                <Card key={item.title} className="rounded-[24px] border border-gray-200 p-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-800">
                    <Icon size={24} />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-3 text-sm leading-8 text-gray-600">{item.text}</p>
                </Card>
              )
            })}
          </div>

          <div className="mt-12 text-center">
            <Link to="/projects">
              <Button variant="primary">
                View Projects <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>


    </div>
  )
}

export default HomePage