import { Globe, HeartHandshake, ShieldCheck, Target } from 'lucide-react'
import SectionTitle from '../../components/common/SectionTitle'
import Card from '../../components/ui/Card'

const values = [
  {
    icon: ShieldCheck,
    title: 'Transparency',
    text: 'We believe donations and project outcomes should be visible, understandable, and easy to follow.',
  },
  {
    icon: HeartHandshake,
    title: 'Trust',
    text: 'The platform is designed to strengthen donor confidence through clearer reporting and public visibility.',
  },
  {
    icon: Target,
    title: 'Impact',
    text: 'Projects, updates, and beneficiary records help communicate the real value of support.',
  },
  {
    icon: Globe,
    title: 'Accessibility',
    text: 'Public pages are built to make project discovery and engagement simple across devices.',
  },
]

function AboutPage() {
  return (
    <div className="bg-white">
      <section className="bg-gradient-to-b from-green-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
          <SectionTitle
            badge="About us"
            title="A modern NGO platform focused on accountability and public trust"
            text="This platform supports transparent donation tracking, project storytelling, and better visibility into social impact."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Who we are</h3>
            <p className="mt-4 text-base leading-8 text-gray-600">
              The NGO platform is built to help organizations manage projects more clearly while giving donors and the public a better view of progress, funding, and beneficiary impact.
            </p>
            <p className="mt-4 text-base leading-8 text-gray-600">
              It combines public project discovery with secure internal dashboards for staff and administrators, allowing both transparency and operational control in one system.
            </p>
          </div>

          <div className="rounded-[30px] border border-green-100 bg-green-50 p-8">
            <h3 className="text-2xl font-bold text-gray-900">What we aim to improve</h3>
            <ul className="mt-5 space-y-4 text-sm leading-7 text-gray-700">
              <li>Clearer donation visibility from contribution to project support</li>
              <li>Better public communication through project and beneficiary stories</li>
              <li>Improved confidence for donors, partners, and communities</li>
              <li>Responsive tools for NGO teams managing real operations</li>
            </ul>
          </div>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {values.map((item) => {
            const Icon = item.icon

            return (
              <Card key={item.title} className="rounded-3xl p-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-800">
                  <Icon size={24} />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-gray-600">{item.text}</p>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}

export default AboutPage