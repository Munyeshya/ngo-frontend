import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Users,
  HandCoins,
  HeartPulse,
  GraduationCap,
  Sprout,
  CalendarDays,
  BadgeCheck,
  Clock3,
  Mail,
  Phone,
  ArrowRight,
} from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import AnimatedBackground from '../../components/common/AnimatedBackground'
import SectionTitle from '../../components/common/SectionTitle'

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
    duration: 'Jan 2026 - Dec 2026',
    donorCount: '480+',
    organization: 'Hope Care Initiative',
    contactEmail: 'health@ngo-platform.org',
    contactPhone: '+250 788 000 001',
    description:
      'Community Health Outreach is a targeted initiative focused on improving access to preventive healthcare services for vulnerable families. The project supports screening events, mobile outreach, health education, and referrals to nearby facilities. It is designed to reduce delays in care and improve early identification of health issues among underserved communities.',
    longDescription:
      'The project works with local partners, health workers, and community structures to deliver sustainable outreach programs in areas where access to basic services remains limited. Through periodic health camps, awareness campaigns, and support for vulnerable households, the initiative creates stronger links between communities and essential healthcare systems. Funds contribute to outreach logistics, medical materials, awareness activities, volunteer support, and beneficiary follow-up.',
    image:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1600&q=80',
    icon: HeartPulse,
    stats: [
      { label: 'Medical outreach events', value: '24' },
      { label: 'Community volunteers', value: '60' },
      { label: 'Partner facilities', value: '8' },
      { label: 'Families supported', value: '1,200+' },
    ],
    goals: [
      'Expand access to preventive healthcare services in vulnerable communities.',
      'Increase early health screening and referral pathways for at-risk families.',
      'Improve health awareness through consistent community education.',
      'Strengthen local collaboration between NGOs and healthcare actors.',
    ],
    beneficiariesList: [
      'Low-income families',
      'Children requiring health screening',
      'Pregnant women and caregivers',
      'Community members needing awareness and referral support',
    ],
    gallery: [
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1580281658629-7e8c9f6f8f9c?auto=format&fit=crop&w=1200&q=80',
    ],
    updates: [
      {
        title: 'January community screening completed',
        date: '2026-01-22',
        text: 'The first outreach round reached over 300 beneficiaries and identified priority referral cases.',
      },
      {
        title: 'Health education materials distributed',
        date: '2026-02-14',
        text: 'Awareness materials focusing on hygiene, early symptoms, and clinic follow-up were shared in local sectors.',
      },
      {
        title: 'Volunteer training session held',
        date: '2026-03-02',
        text: 'Community volunteers received updated training for household engagement and beneficiary follow-up.',
      },
    ],
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
    duration: 'Feb 2026 - Nov 2026',
    donorCount: '310+',
    organization: 'Bright Futures Network',
    contactEmail: 'education@ngo-platform.org',
    contactPhone: '+250 788 000 002',
    description:
      'Back to School Support helps children from low-income households access essential learning materials and school support.',
    longDescription:
      'The project focuses on reducing barriers to education by providing school kits, uniforms where needed, academic support materials, and outreach to families. It helps children remain in school with dignity and adequate tools for learning.',
    image:
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80',
    icon: GraduationCap,
    stats: [
      { label: 'School kits prepared', value: '900' },
      { label: 'Partner schools', value: '12' },
      { label: 'Volunteers engaged', value: '35' },
      { label: 'Children supported', value: '850+' },
    ],
    goals: [
      'Improve access to school materials.',
      'Reduce dropout risk among vulnerable children.',
      'Support dignity and confidence in learning environments.',
      'Strengthen family engagement around education continuity.',
    ],
    beneficiariesList: [
      'Children from low-income families',
      'Students lacking basic supplies',
      'Parents and guardians needing support coordination',
    ],
    gallery: [
      'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80',
    ],
    updates: [
      {
        title: 'First batch of school materials procured',
        date: '2026-02-12',
        text: 'The project completed initial procurement of books, bags, and stationery supplies.',
      },
      {
        title: 'Community registration drive completed',
        date: '2026-02-28',
        text: 'Families and students were registered in coordination with local leaders and schools.',
      },
    ],
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
    duration: 'Jan 2026 - Oct 2026',
    donorCount: '275+',
    organization: 'Community Rise Collective',
    contactEmail: 'women@ngo-platform.org',
    contactPhone: '+250 788 000 003',
    description:
      'Supporting women through skills development, mentorship, and income-generating community programs.',
    longDescription:
      'This initiative helps women build confidence, learn practical skills, and access mentorship and community-based support. The project is designed to strengthen long-term self-reliance and improve social and economic opportunities.',
    image:
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80',
    icon: Users,
    stats: [
      { label: 'Training groups', value: '18' },
      { label: 'Mentors involved', value: '22' },
      { label: 'Workshops delivered', value: '30' },
      { label: 'Women supported', value: '600+' },
    ],
    goals: [
      'Expand practical skills and enterprise readiness.',
      'Strengthen confidence and mentorship access.',
      'Support women-led local initiatives.',
      'Improve long-term livelihood opportunities.',
    ],
    beneficiariesList: [
      'Women in vulnerable households',
      'Young mothers',
      'Women-led local groups',
    ],
    gallery: [
      'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
    ],
    updates: [
      {
        title: 'Mentorship groups launched',
        date: '2026-01-16',
        text: 'Small mentorship circles were created to support participant growth and accountability.',
      },
      {
        title: 'Skills workshop series completed',
        date: '2026-02-20',
        text: 'The first round of practical workshops focused on business basics and group savings strategies.',
      },
    ],
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
    duration: 'Mar 2026 - Dec 2026',
    donorCount: '620+',
    organization: 'Green Earth Action',
    contactEmail: 'environment@ngo-platform.org',
    contactPhone: '+250 788 000 004',
    description:
      'Restoring degraded areas through tree planting, awareness campaigns, and community environmental action.',
    longDescription:
      'Green Village Restoration works to rebuild damaged ecosystems while involving communities directly in conservation efforts. The project supports planting campaigns, environmental education, and practical local restoration efforts.',
    image:
      'https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1600&q=80',
    icon: Sprout,
    stats: [
      { label: 'Trees planted target', value: '10,000' },
      { label: 'Community groups', value: '14' },
      { label: 'Restoration zones', value: '6' },
      { label: 'People reached', value: '2,000+' },
    ],
    goals: [
      'Restore degraded local environments.',
      'Promote awareness and shared environmental responsibility.',
      'Increase community participation in conservation.',
      'Strengthen long-term ecosystem recovery efforts.',
    ],
    beneficiariesList: [
      'Rural households',
      'Youth environmental clubs',
      'Farming communities',
    ],
    gallery: [
      'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
    ],
    updates: [
      {
        title: 'Community tree nursery established',
        date: '2026-03-05',
        text: 'A nursery was launched to support local tree growth and restoration targets.',
      },
      {
        title: 'Awareness campaign started',
        date: '2026-03-18',
        text: 'The first public education sessions were delivered with local groups and schools.',
      },
    ],
  },
]

function ProjectDetailsPage() {
  const { projectId } = useParams()

  const project = useMemo(() => {
    return projects.find(
      (item) => String(item.id) === projectId || item.slug === projectId
    )
  }, [projectId])

  if (!project) {
    return (
      <div className="bg-[#F8F8F6]">
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Card className="rounded-[28px] p-10 text-center">
            <p className="text-3xl font-bold text-gray-900">Project not found</p>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              The project you are looking for does not exist or is not available.
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
            className="h-full w-full object-cover opacity-30"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/45" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur transition hover:bg-white/15"
          >
            <ArrowLeft size={16} />
            Back to Projects
          </Link>

          <div className="mt-8 grid items-end gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-800">
                  {project.category}
                </span>
                <span
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    project.status === 'Almost Funded'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-white/90 text-gray-900'
                  }`}
                >
                  {project.status}
                </span>
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                {project.title}
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-white/70 sm:text-lg">
                {project.description}
              </p>

              <div className="mt-7 flex flex-wrap gap-5 text-sm text-white/75">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-green-400" />
                  <span>{project.location}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Users size={16} className="text-green-400" />
                  <span>{project.beneficiaries} beneficiaries</span>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarDays size={16} className="text-green-400" />
                  <span>{project.duration}</span>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/10 p-6 text-white backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm text-white/70">Funding status</p>
                  <p className="text-2xl font-bold">{project.progress}% funded</p>
                </div>
              </div>

              <div className="mt-6 h-3 rounded-full bg-white/15">
                <div
                  className="h-3 rounded-full bg-green-500"
                  style={{ width: `${project.progress}%` }}
                />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-white/65">Raised</p>
                  <p className="mt-2 text-2xl font-bold">{project.raised}</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-white/65">Goal</p>
                  <p className="mt-2 text-2xl font-bold">{project.goal}</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-white/65">Donors</p>
                  <p className="mt-2 text-2xl font-bold">{project.donorCount}</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-white/65">Beneficiaries</p>
                  <p className="mt-2 text-2xl font-bold">{project.beneficiaries}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Button className="w-full">Donate Now</Button>
                <Button variant="darkOutline" className="w-full">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            <Card className="rounded-[28px] p-7">
              <SectionTitle
                badge="Project overview"
                title="About this project"
                text={project.longDescription}
              />
            </Card>

            <Card className="rounded-[28px] p-7">
              <h2 className="text-3xl font-bold text-gray-900">Objectives</h2>
              <div className="mt-6 grid gap-4">
                {project.goals.map((goal) => (
                  <div
                    key={goal}
                    className="flex gap-3 rounded-2xl bg-[#F8F8F6] p-4"
                  >
                    <BadgeCheck size={20} className="mt-0.5 shrink-0 text-green-700" />
                    <p className="text-sm leading-7 text-gray-700">{goal}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-[28px] p-7">
              <h2 className="text-3xl font-bold text-gray-900">Who benefits</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {project.beneficiariesList.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-gray-200 bg-white p-5"
                  >
                    <p className="font-semibold text-gray-900">{item}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-[28px] p-7">
              <h2 className="text-3xl font-bold text-gray-900">Project gallery</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {project.gallery.map((image, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-[22px]"
                  >
                    <img
                      src={image}
                      alt={`${project.title} gallery ${index + 1}`}
                      className="h-64 w-full object-cover transition duration-500 hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-[28px] p-7">
              <h2 className="text-3xl font-bold text-gray-900">Latest updates</h2>
              <div className="mt-8 space-y-6">
                {project.updates.map((update, index) => (
                  <div key={`${update.title}-${index}`} className="flex gap-4">
                    <div className="flex w-10 shrink-0 justify-center">
                      <div className="mt-1 h-4 w-4 rounded-full bg-green-700" />
                    </div>

                    <div className="flex-1 border-l border-gray-200 pl-5 pb-6">
                      <p className="text-sm font-medium text-green-800">{update.date}</p>
                      <h3 className="mt-2 text-xl font-semibold text-gray-900">
                        {update.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-gray-600">
                        {update.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="rounded-[28px] p-6">
              <h3 className="text-2xl font-bold text-gray-900">Quick stats</h3>

              <div className="mt-6 grid gap-4">
                {project.stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl bg-[#F8F8F6] p-4"
                  >
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-[28px] p-6">
              <h3 className="text-2xl font-bold text-gray-900">Project organization</h3>

              <div className="mt-6 space-y-5">
                <div className="rounded-2xl bg-[#F8F8F6] p-4">
                  <p className="text-sm text-gray-500">Managed by</p>
                  <p className="mt-2 font-semibold text-gray-900">{project.organization}</p>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Mail size={17} className="text-green-700" />
                  <span>{project.contactEmail}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Phone size={17} className="text-green-700" />
                  <span>{project.contactPhone}</span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Clock3 size={17} className="text-green-700" />
                  <span>Support and coordination available during business hours</span>
                </div>
              </div>
            </Card>

            <Card className="rounded-[28px] overflow-hidden bg-black text-white">
              <div className="relative overflow-hidden p-6">
                <AnimatedBackground variant="dark" />

                <div className="relative z-10">
                  <p className="text-sm uppercase tracking-[0.18em] text-green-300">
                    Support this cause
                  </p>
                  <h3 className="mt-3 text-2xl font-bold">
                    Help this project move closer to its goal
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-white/70">
                    Contribute directly, follow updates, or contact the team for more information.
                  </p>

                  <div className="mt-6 grid gap-3">
                    <Button className="w-full">
                      Donate Now <ArrowRight size={16} className="ml-2" />
                    </Button>
                    <Button variant="darkOutline" className="w-full">
                      Subscribe for Updates
                    </Button>
                    <Link to="/contact">
                      <Button variant="darkOutline" className="w-full">
                        Contact Us
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProjectDetailsPage