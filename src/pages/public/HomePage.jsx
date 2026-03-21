import { Link } from 'react-router-dom'
import { ArrowRight, HandHelping, Heart, ShieldCheck } from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

function HomePage() {
  return (
    <div>
      <section className="bg-gradient-to-b from-green-50 to-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
              Make impact with transparency
            </span>

            <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
              Support meaningful NGO projects with confidence
            </h1>

            <p className="mt-5 max-w-xl text-lg text-gray-600">
              Discover projects, track progress, donate securely, and stay updated on real impact.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/projects">
                <Button>
                  Explore Projects <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary">Login</Button>
              </Link>
            </div>
          </div>

          <Card className="p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-green-50 p-4">
                <Heart className="mb-3 text-green-800" size={22} />
                <p className="font-semibold text-gray-900">Trusted Giving</p>
                <p className="mt-2 text-sm text-gray-600">Simple and transparent donations.</p>
              </div>
              <div className="rounded-2xl bg-green-50 p-4">
                <HandHelping className="mb-3 text-green-800" size={22} />
                <p className="font-semibold text-gray-900">Real Impact</p>
                <p className="mt-2 text-sm text-gray-600">Support beneficiaries through active projects.</p>
              </div>
              <div className="rounded-2xl bg-green-50 p-4">
                <ShieldCheck className="mb-3 text-green-800" size={22} />
                <p className="font-semibold text-gray-900">Secure Access</p>
                <p className="mt-2 text-sm text-gray-600">Role-based access for staff and administrators.</p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default HomePage