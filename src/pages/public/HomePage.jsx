import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeDollarSign,
  HandHeart,
  HeartPulse,
  Lightbulb,
  ShieldCheck,
  Users,
} from 'lucide-react'
import HeroSlider from '../../components/home/HeroSlider'
import SectionTitle from '../../components/common/SectionTitle'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const impactStats = [
  { label: 'Projects supported', value: '50+' },
  { label: 'Active donors', value: '1,200+' },
  { label: 'Communities reached', value: '30+' },
  { label: 'Lives impacted', value: '15,000+' },
]

const features = [
  {
    icon: ShieldCheck,
    title: 'Transparent donation flow',
    text: 'Follow funding progress and see how support connects to visible project outcomes.',
  },
  {
    icon: HandHeart,
    title: 'Public impact visibility',
    text: 'Visitors can discover projects, beneficiaries, and updates without unnecessary friction.',
  },
  {
    icon: BadgeDollarSign,
    title: 'Better accountability',
    text: 'Organizations can communicate progress clearly and strengthen donor trust.',
  },
]

const focusAreas = [
  {
    icon: HeartPulse,
    title: 'Health Support',
    text: 'Helping communities access treatment, outreach, and essential care.',
  },
  {
    icon: Users,
    title: 'Community Empowerment',
    text: 'Supporting families, youth, and vulnerable groups through direct impact programs.',
  },
  {
    icon: Lightbulb,
    title: 'Education & Awareness',
    text: 'Promoting long-term change through knowledge, materials, and opportunity.',
  },
]

const featuredProjects = [
  {
    title: 'Community Health Outreach',
    location: 'Kigali, Rwanda',
    progress: 72,
    text: 'Improving access to preventive healthcare services for vulnerable families.',
    image:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1000&q=80',
  },
  {
    title: 'Back to School Support',
    location: 'Huye, Rwanda',
    progress: 48,
    text: 'Providing school materials and support for children from low-income households.',
    image:
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80',
  },
  {
    title: 'Women Empowerment Initiative',
    location: 'Musanze, Rwanda',
    progress: 63,
    text: 'Supporting women through skills development, mentorship, and community programs.',
    image:
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1000&q=80',
  },
]

function HomePage() {
  return (
    <div className="bg-white">
      <HeroSlider />

      <section className="border-y border-green-100 bg-green-50/60">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {impactStats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-green-100 bg-white p-6 text-center shadow-sm">
              <p className="text-3xl font-bold text-green-800">{item.value}</p>
              <p className="mt-2 text-sm text-gray-600">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
        <SectionTitle
          badge="Why this platform matters"
          title="A better public experience for trust, giving, and measurable impact"
          text="The NGO platform should help people discover initiatives, understand progress, and support causes confidently through a modern and transparent interface."
          center
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon

            return (
              <Card key={feature.title} className="rounded-3xl p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-800">
                  <Icon size={24} />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-600">{feature.text}</p>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="bg-gray-50">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-18 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionTitle
              badge="About the platform"
              title="Built to connect donations with real project outcomes"
              text="This system is designed around accountability, project visibility, donor trust, and beneficiary-centered storytelling."
            />

            <div className="mt-8 space-y-5">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="font-semibold text-gray-900">Donation transparency</p>
                <p className="mt-2 text-sm leading-7 text-gray-600">
                  Every contribution should help tell a clearer story of funding, progress, and impact.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="font-semibold text-gray-900">Project-focused communication</p>
                <p className="mt-2 text-sm leading-7 text-gray-600">
                  Visitors can explore projects, follow updates, and understand what support achieves.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="font-semibold text-gray-900">NGO-friendly management</p>
                <p className="mt-2 text-sm leading-7 text-gray-600">
                  Staff and admins work from secure dashboards while donors keep a simpler user experience.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <Link to="/about">
                <Button variant="secondary">
                  Read More About Us <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {focusAreas.map((item) => {
              const Icon = item.icon

              return (
                <Card key={item.title} className="rounded-3xl p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-800">
                    <Icon size={22} />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-600">{item.text}</p>
                </Card>
              )
            })}

            <div className="rounded-3xl bg-green-800 p-6 text-white shadow-lg sm:col-span-2">
              <p className="text-sm font-medium text-green-100">Responsive by design</p>
              <h3 className="mt-3 text-2xl font-semibold">Clean on desktop, tablet, and mobile</h3>
              <p className="mt-3 text-sm leading-7 text-green-50/90">
                The public pages, hero section, navigation, cards, and CTAs are designed to adapt smoothly across screen sizes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle
            badge="Featured projects"
            title="Explore causes that need support now"
            text="These highlighted initiatives show how funding progress and project storytelling can work together."
          />

          <Link to="/projects">
            <Button variant="outline">View All Projects</Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {featuredProjects.map((project) => (
            <Card key={project.title} className="overflow-hidden rounded-3xl">
              <img src={project.image} alt={project.title} className="h-56 w-full object-cover" />

              <div className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold text-gray-900">{project.title}</h3>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                    {project.location}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-7 text-gray-600">{project.text}</p>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-gray-500">Funding progress</span>
                    <span className="font-semibold text-green-800">{project.progress}%</span>
                  </div>

                  <div className="h-2.5 rounded-full bg-gray-200">
                    <div
                      className="h-2.5 rounded-full bg-green-800"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <Button className="w-full">View Project</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-green-900">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-16 text-center sm:px-6 lg:flex-row lg:px-8 lg:text-left">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-green-200">
              Support transparent change
            </p>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
              Help fund projects that deliver visible community impact
            </h2>
            <p className="mt-4 text-base leading-7 text-green-100">
              Explore public projects, follow updates, and contribute to initiatives that matter.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 lg:justify-end">
            <Link to="/projects">
              <Button className="bg-white text-green-900 hover:bg-green-50">Browse Projects</Button>
            </Link>
            <Link to="/contact">
              <Button variant="secondary" className="border border-white/20 bg-white/10 text-white hover:bg-white/20">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage