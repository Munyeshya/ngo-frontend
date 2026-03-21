import { HeartHandshake, Eye, ShieldCheck } from 'lucide-react'
import SectionTitle from '../../components/common/SectionTitle'

const items = [
  {
    icon: HeartHandshake,
    title: 'Our Mission',
    text: 'To make donation flows more transparent and impactful by helping people discover projects, understand funding progress, and follow visible community outcomes.',
  },
  {
    icon: Eye,
    title: 'Our Vision',
    text: 'A stronger public digital experience for NGOs where trust, accountability, and measurable social change are clearly visible to donors and communities.',
  },
  {
    icon: ShieldCheck,
    title: 'Our Values',
    text: 'Transparency, trust, community-centered design, responsible stewardship, and a commitment to making support more meaningful and visible.',
  },
]

function AboutPage() {
  return (
    <div className="bg-[#F8F8F6]">
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionTitle
            badge="About us"
            title="About our organization"
            text="A public NGO platform designed to present projects, donations, updates, and community impact with more clarity and trust."
            center
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              About our Organization
            </h2>

            <div className="mt-10 space-y-8">
              {items.map((item) => {
                const Icon = item.icon

                return (
                  <div key={item.title} className="flex gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-700 text-white shadow-md">
                      <Icon size={22} />
                    </div>

                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900">{item.title}</h3>
                      <p className="mt-3 max-w-2xl text-sm leading-8 text-gray-600 sm:text-base">
                        {item.text}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="overflow-hidden rounded-[28px]">
              <img
                src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=900&q=80"
                alt="NGO impact"
                className="h-[420px] w-full object-cover sm:h-[520px]"
              />
            </div>

            <div className="overflow-hidden rounded-[28px] pt-10 sm:pt-14">
              <img
                src="https://images.unsplash.com/photo-1593113598332-cd59a93d7c2b?auto=format&fit=crop&w=900&q=80"
                alt="Community support"
                className="h-[420px] w-full object-cover sm:h-[520px]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-black">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 text-white sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-green-300">
              Why this matters
            </p>
            <h3 className="mt-4 text-3xl font-bold sm:text-4xl">
              Better visibility creates stronger donor confidence
            </h3>
          </div>

          <p className="text-base leading-8 text-white/70">
            This platform is not just about collecting donations. It is about helping NGOs communicate real progress, helping donors understand where support goes, and building a public digital space where impact can be followed with confidence.
          </p>
        </div>
      </section>
    </div>
  )
}

export default AboutPage