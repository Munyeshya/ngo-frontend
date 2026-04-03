import { HeartHandshake, Eye, ShieldCheck, ChartColumnIncreasing, MapPinned, FileText } from 'lucide-react'
import SectionTitle from '../../components/common/SectionTitle'
import AnimatedBackground from '../../components/common/AnimatedBackground'
import Card from '../../components/ui/Card'

const principles = [
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

const trustSignals = [
  {
    value: 'Clear',
    label: 'project funding progress',
    icon: ChartColumnIncreasing,
  },
  {
    value: 'Visible',
    label: 'updates and money usage',
    icon: FileText,
  },
  {
    value: 'Public',
    label: 'community impact context',
    icon: MapPinned,
  },
]

const flow = [
  {
    step: '01',
    title: 'Discover',
    text: 'People can browse projects, understand the cause area, and see the funding target before they decide to support it.',
  },
  {
    step: '02',
    title: 'Support',
    text: 'Donors can contribute quickly, either as guests or with an account, while still following project progress later.',
  },
  {
    step: '03',
    title: 'Follow',
    text: 'Updates, beneficiaries, and cashout-linked activity records help make project execution more transparent over time.',
  },
]

function AboutPage() {
  return (
    <div className="bg-[#F8F8F6]">
      <section className="relative overflow-hidden bg-white">
        <AnimatedBackground variant="light" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid items-end gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <SectionTitle
              badge="About us"
              title="Built to make support more visible and easier to trust"
              text="NGO Transparency is designed to help people understand where support goes, how projects move forward, and what kind of public accountability surrounds each initiative."
            />

            <Card className="rounded-[24px] border-gray-200 bg-[#FAF8F2] p-4 sm:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-green-800">
                What this platform does
              </p>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                It combines project discovery, donation visibility, updates, moderation, and
                public-facing progress in one shared space so trust is built through clarity, not
                just promises.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-3 md:grid-cols-3">
          {trustSignals.map((item) => {
            const Icon = item.icon

            return (
              <Card
                key={item.label}
                className="rounded-[22px] border-gray-200 bg-white px-4 py-4 shadow-none"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{item.value}</p>
                    <p className="mt-1 text-xs leading-6 text-gray-600">{item.label}</p>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-800">
                    <Icon size={16} />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="relative overflow-hidden bg-black">
        <AnimatedBackground variant="dark" />

        <div className="relative z-10 mx-auto grid max-w-7xl gap-8 px-4 py-14 text-white sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-16">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-green-300">
              Why this matters
            </p>
            <h3 className="mt-4 text-2xl font-bold sm:text-[2rem]">
              Better visibility creates stronger donor confidence
            </h3>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/70">
              The goal is not only to collect support. It is to make project progress easier to
              understand, make money usage easier to follow, and make public trust easier to grow.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {flow.map((item) => (
              <div
                key={item.step}
                className="rounded-[22px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-green-300">
                  {item.step}
                </p>
                <h4 className="mt-3 text-sm font-semibold text-white">{item.title}</h4>
                <p className="mt-2 text-xs leading-6 text-white/70">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_0.95fr]">
          <div className="space-y-4">
            {principles.map((item) => {
                const Icon = item.icon

                return (
                  <Card
                    key={item.title}
                    className="rounded-[24px] border-gray-200 bg-white px-4 py-4 shadow-none sm:px-5"
                  >
                    <div className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-700 text-white">
                        <Icon size={17} />
                      </div>

                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
                        <p className="mt-2 max-w-2xl text-xs leading-7 text-gray-600 sm:text-sm">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  </Card>
                )
              })}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            <div className="overflow-hidden rounded-[26px]">
              <img
                src="https://t3.ftcdn.net/jpg/10/44/72/10/360_F_1044721046_nx9Pnob1YTuxJYbG1wciR4EMXLBOZ6FF.jpg"
                alt="NGO impact"
                className="h-[340px] w-full object-cover sm:h-[460px]"
              />
            </div>

            <div className="overflow-hidden rounded-[26px] pt-8 sm:pt-12">
              <img
                src="https://images.unsplash.com/photo-1527525443983-6e60c75fff46?auto=format&fit=crop&w=1200&q=80"
                alt="Community support"
                className="h-[340px] w-full object-cover sm:h-[460px]"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
