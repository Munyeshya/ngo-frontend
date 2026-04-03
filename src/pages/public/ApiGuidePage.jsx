import Card from '../../components/ui/Card'

const roleCards = [
  {
    title: 'Public Visitor',
    abilities: [
      'Browse all public projects, project details, partners, beneficiaries, and updates.',
      'Donate without creating an account first.',
      'Subscribe to project updates by email.',
      'View cashout activity when it appears as a public project update.',
    ],
    conditions: [
      'Cannot report a project until logged in.',
      'Cannot access donor or staff/admin portal pages.',
    ],
  },
  {
    title: 'Donor',
    abilities: [
      'Everything a public visitor can do.',
      'Report projects from the public project details page.',
      'Claim a donor account later through the email token flow.',
      'View own donations, own subscriptions, and own profile area.',
    ],
    conditions: [
      'Anonymous donations hide donor identity from public-facing contexts.',
      'Claim flow requires the emailed token before account activation.',
    ],
  },
  {
    title: 'Staff',
    abilities: [
      'Maintain own profile and staff verification documents.',
      'Work only inside own project workspace in the dashboard.',
      'Create and manage own projects, beneficiaries, updates, and cashouts once approved.',
      'See only own project donations and own cashout history in dashboard space.',
    ],
    conditions: [
      'Can register and log in before approval.',
      'Cannot create projects until staff verification is approved.',
      'Cannot change project moderation or funding controls.',
      'Cashout works only when project funding is open and the project is not under review.',
    ],
  },
  {
    title: 'Admin',
    abilities: [
      'Oversee users, staff applications, partners, analytics, and reported projects.',
      'Review and preview staff documents inside the app.',
      'Review reported projects and set moderation and funding decisions.',
      'See platform-wide data across users, projects, donations, and reports.',
    ],
    conditions: [
      'Admin UI focuses on oversight rather than day-to-day staff project operations.',
      'Direct full CRUD still remains available in Django admin and backend where needed.',
    ],
  },
]

const featureRows = [
  {
    feature: 'Project browsing',
    who: 'Public, donor, staff, admin',
    details: 'Public pages always use public project reads so all platform projects remain visible there even when logged in.',
  },
  {
    feature: 'Project reporting',
    who: 'Logged-in users',
    details: 'Reports move a project into review visibility for admin, but a single complaint does not stop donations by itself.',
  },
  {
    feature: 'Donation restriction',
    who: 'System-controlled',
    details: 'Donations stop only when admin freezes funding or takes a project down.',
  },
  {
    feature: 'Cashout restriction',
    who: 'Staff and admin',
    details: 'Cashout is stricter than donations and requires a clear project with open funding and enough available balance.',
  },
  {
    feature: 'Cashout transparency',
    who: 'Public, donor, staff, admin',
    details: 'Each cashout is also published as a normal project update so money usage details appear on public project pages.',
  },
  {
    feature: 'Staff verification',
    who: 'Staff and admin',
    details: 'Staff uploads individual or group documents, admin can reject only a document or the whole application, and updates can send the application back into review.',
  },
  {
    feature: 'Anonymous donations',
    who: 'Donor, admin',
    details: 'Anonymous donations hide identity in public-facing contexts while still preserving donation records.',
  },
  {
    feature: 'Project workspace',
    who: 'Approved staff',
    details: 'Staff manage projects from a project-centered workspace with Overview, Funds, Beneficiaries, Donations, and Updates tabs.',
  },
]

function ApiGuidePage() {
  return (
    <div className="bg-[#F8F8F6]">
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <Card className="rounded-[28px] border border-gray-200 bg-white p-5 sm:p-6 lg:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-green-800">
            Frontend Guide
          </p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
            Platform Features And Access Rules
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600">
            This page explains what the frontend exposes, who can use each area, and the business
            conditions that affect actions like project creation, reporting, donations, moderation,
            and cashout.
          </p>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {roleCards.map((item) => (
            <Card key={item.title} className="rounded-[24px] border border-gray-200 p-4">
              <h2 className="text-base font-bold text-gray-900">{item.title}</h2>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                Can do
              </p>
              <ul className="mt-2 space-y-2 text-xs leading-6 text-gray-600">
                {item.abilities.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                Conditions
              </p>
              <ul className="mt-2 space-y-2 text-xs leading-6 text-gray-600">
                {item.conditions.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8 lg:pb-12">
        <Card className="rounded-[24px] border border-gray-200 p-4 sm:p-5">
          <h2 className="text-lg font-bold text-gray-900">Feature Conditions</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="text-left">
                  <th className="pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    Feature
                  </th>
                  <th className="pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    Who
                  </th>
                  <th className="pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    Conditions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {featureRows.map((row) => (
                  <tr key={row.feature}>
                    <td className="py-3 pr-4 text-sm font-semibold text-gray-900">{row.feature}</td>
                    <td className="py-3 pr-4 text-xs text-gray-600">{row.who}</td>
                    <td className="py-3 text-xs leading-6 text-gray-600">{row.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  )
}

export default ApiGuidePage
