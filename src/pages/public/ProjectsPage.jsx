import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Search,
  SlidersHorizontal,
  MapPin,
  Users,
  HandCoins,
  HeartPulse,
  GraduationCap,
  Sprout,
} from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import SectionTitle from '../../components/common/SectionTitle'
import AnimatedBackground from '../../components/common/AnimatedBackground'

const projectCategories = ['All', 'Health', 'Education', 'Community', 'Environment']

const projects = [
  {
    id: 1,
    slug: 'community-health-outreach',
    title: 'Community Health Outreach',
    category: 'Health',
    location: 'Kigali, Rwanda',
    progress: 72,
    raised: '$36,000',
    goal: '$50,000',
    beneficiaries: '1,200+',
    status: 'Active',
    description:
      'Improving access to preventive healthcare, screenings, and medical outreach services for vulnerable families.',
    image:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
    icon: HeartPulse,
  },
  {
    id: 2,
    slug: 'back-to-school-support',
    title: 'Back to School Support',
    category: 'Education',
    location: 'Huye, Rwanda',
    progress: 48,
    raised: '$24,000',
    goal: '$50,000',
    beneficiaries: '850+',
    status: 'Active',
    description:
      'Providing school materials, learning kits, and support for children from low-income households.',
    image:
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    icon: GraduationCap,
  },
  {
    id: 3,
    slug: 'women-empowerment-initiative',
    title: 'Women Empowerment Initiative',
    category: 'Community',
    location: 'Musanze, Rwanda',
    progress: 63,
    raised: '$31,500',
    goal: '$50,000',
    beneficiaries: '600+',
    status: 'Active',
    description:
      'Supporting women through skills development, mentorship, and income-generating community programs.',
    image:
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80',
    icon: Users,
  },
  {
    id: 4,
    slug: 'green-village-restoration',
    title: 'Green Village Restoration',
    category: 'Environment',
    location: 'Nyagatare, Rwanda',
    progress: 81,
    raised: '$40,500',
    goal: '$50,000',
    beneficiaries: '2,000+',
    status: 'Almost Funded',
    description:
      'Restoring degraded areas through tree planting, awareness campaigns, and community-based environmental action.',
    image:
      'https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1200&q=80',
    icon: Sprout,
  },
  {
    id: 5,
    slug: 'nutrition-for-families',
    title: 'Nutrition for Families',
    category: 'Health',
    location: 'Rubavu, Rwanda',
    progress: 37,
    raised: '$18,500',
    goal: '$50,000',
    beneficiaries: '500+',
    status: 'Active',
    description:
      'Delivering nutrition support, education, and targeted assistance to families facing food insecurity.',
    image:
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
    icon: HandCoins,
  },
  {
    id: 6,
    slug: 'youth-skills-lab',
    title: 'Youth Skills Lab',
    category: 'Education',
    location: 'Kigali, Rwanda',
    progress: 54,
    raised: '$27,000',
    goal: '$50,000',
    beneficiaries: '300+',
    status: 'Active',
    description:
      'Helping young people gain practical digital and entrepreneurial skills for long-term opportunity.',
    image:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    icon: GraduationCap,
  },
]

function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesCategory =
        selectedCategory === 'All' || project.category === selectedCategory

      const matchesSearch =
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesCategory && matchesSearch
    })
  }, [searchTerm, selectedCategory])

  return (
    <div className="bg-[#F8F8F6]">
      <section className="relative overflow-hidden bg-black">
        <AnimatedBackground variant="dark" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-green-200 backdrop-blur">
                Active causes and transparent support
              </span>

              <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                Discover projects that need support and create visible impact
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
                Explore meaningful NGO initiatives, track progress, and support causes that improve
                health, education, empowerment, and community wellbeing.
              </p>

              <div className="mt-8 flex flex-wrap gap-6 text-white">
                <div>
                  <p className="text-3xl font-bold text-green-400">50+</p>
                  <p className="mt-1 text-sm text-white/70">Projects launched</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-400">15,000+</p>
                  <p className="mt-1 text-sm text-white/70">Lives impacted</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-400">$1.2M+</p>
                  <p className="mt-1 text-sm text-white/70">Funds mobilized</p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-3 backdrop-blur">
              <img
                src="https://images.unsplash.com/photo-1593113598332-cd59a93d7c2b?auto=format&fit=crop&w=1200&q=80"
                alt="Featured NGO projects"
                className="h-[280px] w-full rounded-[22px] object-cover sm:h-[360px] lg:h-[420px]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-gray-200 bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_auto]">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search projects, causes, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-[#F8F8F6] py-3 pl-11 pr-4 outline-none transition focus:border-green-700"
              />
            </div>

            <div className="relative">
              <SlidersHorizontal
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-gray-200 bg-[#F8F8F6] py-3 pl-11 pr-4 outline-none transition focus:border-green-700"
              >
                {projectCategories.map((category) => (
                  <option key={category} value={category}>
                    {category} Causes
                  </option>
                ))}
              </select>
            </div>

            <Button variant="primary" className="w-full lg:w-auto">
              Search Projects
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {projectCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${selectedCategory === category
                    ? 'bg-green-800 text-white'
                    : 'bg-green-50 text-green-800 hover:bg-green-100'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle
            badge="Available projects"
            title="Support ongoing initiatives with confidence"
            text="Each project card highlights the cause, beneficiaries, location, and current funding progress."
          />

          <div className="rounded-2xl bg-white px-5 py-3 text-sm text-gray-600 shadow-sm">
            Showing <span className="font-semibold text-gray-900">{filteredProjects.length}</span>{' '}
            project{filteredProjects.length !== 1 ? 's' : ''}
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
            <p className="text-2xl font-semibold text-gray-900">No projects found</p>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              Try changing the search term or selected category to view more projects.
            </p>
          </div>
        ) : (
          <div className="grid items-stretch gap-7 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => {
              const Icon = project.icon

              return (
                <Card
                  key={project.id}
                  className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.10)]"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="h-60 w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    <div className="absolute left-4 top-4 flex items-center gap-2">
                      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 backdrop-blur">
                        {project.category}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur ${project.status === 'Almost Funded'
                            ? 'bg-amber-100/90 text-amber-800'
                            : 'bg-green-100/90 text-green-800'
                          }`}
                      >
                        {project.status}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/60 text-white backdrop-blur">
                      <Icon size={22} />
                    </div>
                  </div>

                  <div className="flex h-full flex-col p-6">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-2xl font-semibold leading-snug text-gray-900">
                        {project.title}
                      </h2>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-green-700" />
                        <span>{project.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-green-700" />
                        <span>{project.beneficiaries}</span>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-gray-600">
                      {project.description}
                    </p>

                    <div className="mt-6 rounded-2xl bg-[#F8F8F6] p-4">
                      <div className="mb-3 flex items-center justify-between text-sm">
                        <span className="text-gray-500">Funding progress</span>
                        <span className="font-semibold text-green-800">{project.progress}%</span>
                      </div>

                      <div className="h-2.5 rounded-full bg-gray-200">
                        <div
                          className="h-2.5 rounded-full bg-green-800"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>

                      <div className="mt-4 flex items-center justify-between text-sm">
                        <div>
                          <p className="text-gray-500">Raised</p>
                          <p className="font-semibold text-gray-900">{project.raised}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-500">Goal</p>
                          <p className="font-semibold text-gray-900">{project.goal}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center gap-3 pt-6">
                      <Link
                        to={`/projects/${project.slug || project.id}`}
                        className="flex-1 min-w-0"
                      >
                        <Button className="w-full whitespace-nowrap">
                          View Project <ArrowRight size={16} className="ml-2 shrink-0" />
                        </Button>
                      </Link>

                      <Link to={`/donate/${project.slug || project.id}`} className="shrink-0">
                        <Button
                          variant="outline"
                          className="whitespace-nowrap px-5"
                        >
                          <HandCoins size={16} className="mr-2 shrink-0" />
                          Donate
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default ProjectsPage