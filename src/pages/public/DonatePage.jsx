import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  HandCoins,
  HeartPulse,
  GraduationCap,
  Users,
  Sprout,
  MapPin,
} from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import AnimatedBackground from '../../components/common/AnimatedBackground'

const projects = [
  {
    id: 1,
    slug: 'community-health-outreach',
    title: 'Community Health Outreach',
    category: 'Health',
    location: 'Kigali, Rwanda',
    raised: '$36,000',
    goal: '$50,000',
    progress: 72,
    image:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1600&q=80',
    icon: HeartPulse,
  },
  {
    id: 2,
    slug: 'back-to-school-support',
    title: 'Back to School Support',
    category: 'Education',
    location: 'Huye, Rwanda',
    raised: '$24,000',
    goal: '$50,000',
    progress: 48,
    image:
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80',
    icon: GraduationCap,
  },
  {
    id: 3,
    slug: 'women-empowerment-initiative',
    title: 'Women Empowerment Initiative',
    category: 'Community',
    location: 'Musanze, Rwanda',
    raised: '$31,500',
    goal: '$50,000',
    progress: 63,
    image:
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80',
    icon: Users,
  },
  {
    id: 4,
    slug: 'green-village-restoration',
    title: 'Green Village Restoration',
    category: 'Environment',
    location: 'Nyagatare, Rwanda',
    raised: '$40,500',
    goal: '$50,000',
    progress: 81,
    image:
      'https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1600&q=80',
    icon: Sprout,
  },
]

function DonatePage() {
  const { projectId } = useParams()

  const project = useMemo(() => {
    return projects.find(
      (item) => String(item.id) === projectId || item.slug === projectId
    )
  }, [projectId])

  if (!project) {
    return (
      <div className="bg-[#F8F8F6]">
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <Card className="rounded-[28px] p-10 text-center">
            <p className="text-3xl font-bold text-gray-900">Project not found</p>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              The project you want to support is not available.
            </p>
            <div className="mt-6">
              <Link to="/projects">
                <Button>Back to Projects</Button>
              </Link>
            </div>
          </Card>
        </section>
      </div>
    )
  }

  const Icon = project.icon

  return (
    <div className="bg-[#F8F8F6]">
      <section className="relative overflow-hidden bg-black">
        <AnimatedBackground variant="dark" />
        <div className="absolute inset-0">
          <img
            src={project.image}
            alt={project.title}
            className="h-full w-full object-cover opacity-25"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/50" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <Link
            to={`/projects/${project.slug || project.id}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur transition hover:bg-white/15"
          >
            <ArrowLeft size={16} />
            Back to Project
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
            <div>
              <span className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
                {project.category}
              </span>

              <h1 className="mt-5 text-4xl font-bold leading-tight text-white sm:text-5xl">
                Donate to {project.title}
              </h1>

              <div className="mt-5 flex flex-wrap gap-4 text-sm text-white/75">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-green-400" />
                  <span>{project.location}</span>
                </div>
              </div>

              <p className="mt-6 max-w-2xl text-base leading-8 text-white/70">
                Your contribution supports this project directly and helps move it closer to its funding goal.
              </p>
            </div>

            <Card className="rounded-[28px] border border-white/10 bg-white/10 p-6 text-white backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm text-white/70">Current progress</p>
                  <p className="text-2xl font-bold">{project.progress}% funded</p>
                </div>
              </div>

              <div className="mt-6 h-3 rounded-full bg-white/15">
                <div
                  className="h-3 rounded-full bg-green-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>

              <div className="mt-5 flex items-center justify-between text-sm">
                <div>
                  <p className="text-white/65">Raised</p>
                  <p className="font-semibold text-white">{project.raised}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/65">Goal</p>
                  <p className="font-semibold text-white">{project.goal}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <Card className="rounded-[28px] p-7 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-800">
                <HandCoins size={22} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Donation form</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Complete the form below to support this project.
                </p>
              </div>
            </div>

            <form className="mt-8 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter first name"
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-700"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter last name"
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-700"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-700"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter phone number"
                    className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-700"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Donation Amount
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  rows="5"
                  placeholder="Optional message"
                  className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none transition focus:border-green-700"
                />
              </div>

              <Button className="w-full sm:w-auto">
                <HandCoins size={16} className="mr-2" />
                Submit Donation
              </Button>
            </form>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-[28px] p-6">
              <h3 className="text-2xl font-bold text-gray-900">Donation summary</h3>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-[#F8F8F6] p-4">
                  <p className="text-sm text-gray-500">Project</p>
                  <p className="mt-1 font-semibold text-gray-900">{project.title}</p>
                </div>

                <div className="rounded-2xl bg-[#F8F8F6] p-4">
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="mt-1 font-semibold text-gray-900">{project.category}</p>
                </div>

                <div className="rounded-2xl bg-[#F8F8F6] p-4">
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="mt-1 font-semibold text-gray-900">{project.location}</p>
                </div>
              </div>
            </Card>

            <Card className="rounded-[28px] p-6">
              <h3 className="text-2xl font-bold text-gray-900">Quick amounts</h3>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[10, 25, 50, 100].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm font-semibold text-gray-800 transition hover:border-green-700 hover:text-green-800"
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

export default DonatePage