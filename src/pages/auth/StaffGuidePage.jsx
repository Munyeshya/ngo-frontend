import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, FolderKanban, MailCheck, ShieldCheck } from 'lucide-react'

import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

const steps = [
  {
    icon: MailCheck,
    title: 'Apply for staff access',
    text: 'Register as staff from the create-account page using your real work email address.',
  },
  {
    icon: ShieldCheck,
    title: 'Wait for admin approval',
    text: 'An admin reviews your request. You will receive an email when your staff account becomes active.',
  },
  {
    icon: FolderKanban,
    title: 'Log in and manage projects',
    text: 'Once approved, sign in and start creating and updating projects, beneficiaries, and progress updates.',
  },
]

function StaffGuidePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F6F8F4] px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-10 top-10 h-56 w-56 rounded-full bg-green-200/50 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-emerald-100/70 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <Card className="w-full rounded-[28px] border border-[#DDE5DB] bg-[#F3F4F1] p-5 shadow-[0_24px_80px_rgba(16,24,40,0.12)] sm:p-6">
          <Link
            to="/register"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-700 transition hover:text-green-700"
          >
            <ArrowLeft size={16} />
            Back to registration
          </Link>

          <div className="rounded-[24px] bg-[#0b1a13] px-5 py-6 text-white">
            <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85">
              Staff onboarding
            </span>
            <h1 className="mt-4 text-[1.9rem] font-bold sm:text-[2.2rem]">
              How staff access works
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/80">
              Staff accounts are reviewed by an admin before they can log in. This keeps project
              creation and management access controlled while still giving applicants a clear path
              into the platform.
            </p>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon

              return (
                <div
                  key={step.title}
                  className="rounded-[22px] border border-gray-200 bg-white p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-100 text-green-800">
                      <Icon size={17} />
                    </div>
                    <span className="text-xs font-semibold text-gray-400">Step {index + 1}</span>
                  </div>

                  <h2 className="mt-4 text-base font-bold text-gray-900">{step.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{step.text}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-5 rounded-[22px] border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-green-700" />
              <div>
                <p className="text-sm font-semibold text-green-900">After approval</p>
                <p className="mt-1 text-sm leading-6 text-green-800">
                  Use the login page to access the management portal. If you are still seeing a
                  pending approval message after being approved, contact your administrator.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/register">
              <Button className="px-4 py-2.5">Apply as staff</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="px-4 py-2.5">Go to login</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default StaffGuidePage
