import Card from '../../components/ui/Card'

const areaRows = [
  {
    area: 'Public site',
    route: '/',
    who: 'Everyone',
    details:
      'Shows the public experience only. Public project browsing always uses public reads, even when someone is logged in.',
  },
  {
    area: 'Frontend guide',
    route: '/frontend-guide',
    who: 'Everyone',
    details:
      'Explains the frontend product behavior, role access, and business conditions across the platform.',
  },
  {
    area: 'Donor portal',
    route: '/donor/*',
    who: 'Donor',
    details:
      'Supports profile editing, profile image upload, personal donations, subscriptions, and public-to-donor account transition.',
  },
  {
    area: 'Staff portal',
    route: '/dashboard/*',
    who: 'Approved staff',
    details:
      'Project-centered workspace for own projects only, with Overview, Funds, Beneficiaries, Donations, Impact, and Updates.',
  },
  {
    area: 'Admin portal',
    route: '/dashboard/*',
    who: 'Admin',
    details:
      'Oversight UI for users, staff verification, reported projects, partners, platform analytics, and moderation decisions.',
  },
]

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
      'Sees moderation notices only when admin has put a project under review or stronger restriction.',
    ],
  },
  {
    title: 'Donor',
    abilities: [
      'Everything a public visitor can do.',
      'Report projects from the public project details page.',
      'Claim a donor account later with a six-digit email OTP.',
      'View own donations, own subscriptions, and own profile area.',
    ],
    conditions: [
      'Anonymous donations hide donor identity from public-facing contexts.',
      'Claim flow requires an email used for a completed guest donation or active project subscription, plus the emailed OTP.',
      'Donor profile can be updated from the donor portal, including profile image upload.',
    ],
  },
  {
    title: 'Staff',
    abilities: [
      'Maintain own profile and staff verification documents.',
      'Work only inside own project workspace in the dashboard.',
      'Create and manage own projects, beneficiaries, updates, and cashout requests once approved.',
      'Publish formatted updates with image and PDF evidence.',
      'Define impact targets, record dated measurements, and generate printable transparency reports.',
      'See only own project donations and track pending, approved, or rejected cashout requests.',
    ],
    conditions: [
      'Can register and log in before approval.',
      'Cannot create projects until staff verification is approved.',
      'New projects remain private until admin approves the project submission.',
      'Cannot change project moderation or funding controls.',
      'Cashout requests require a clear project with open funding and enough currently available balance.',
      'Document uploads and profile management live in the staff account menu.',
    ],
  },
  {
    title: 'Admin',
    abilities: [
      'Oversee users, staff applications, partners, analytics, and reported projects.',
      'Review and preview staff documents inside the app.',
      'Review staff cashout requests and approve or reject them with an admin note.',
      'Review reported projects and set moderation and funding decisions.',
      'Approve projects, request project changes, or reject submissions without editing staff content.',
      'See platform-wide data across users, projects, donations, and reports.',
    ],
    conditions: [
      'Admin UI focuses on oversight rather than day-to-day staff project operations.',
      'Direct full CRUD still remains available in Django admin and backend where needed.',
      'Admin can suspend users, review staff documents, manage partners, and control project moderation and funding state.',
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
    who: 'Staff request, admin decides',
    details: 'Staff submits itemized requests only for owned projects. Pending requests do not reserve funds; admin approval rechecks restrictions and the live balance before any spending is recorded.',
  },
  {
    feature: 'Cashout transparency',
    who: 'Public, donor, staff, admin',
    details: 'Only an admin-approved cashout counts as spent and becomes a normal public project update. Rejected and pending requests stay private.',
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
    details: 'Staff manage projects from a project-centered workspace with Overview, Funds, Beneficiaries, Donations, Impact, and Updates tabs.',
  },
  {
    feature: 'Project approval',
    who: 'Staff and admin',
    details: 'Staff submit projects for review. Only admin-approved projects become public and accept donations or cashouts.',
  },
  {
    feature: 'Evidence-backed updates',
    who: 'Staff and public',
    details: 'Updates support formatted text, images, and PDF receipts or evidence, with unsafe markup removed by the backend.',
  },
  {
    feature: 'Structured spending',
    who: 'Staff and public',
    details: 'Every request requires expense lines whose amounts equal its total. The table becomes public only after admin approval.',
  },
  {
    feature: 'Impact monitoring',
    who: 'Staff and public',
    details: 'Staff define outcome targets and record cumulative dated measurements; public pages show current progress and history.',
  },
  {
    feature: 'Transparency report',
    who: 'Public, staff, admin',
    details: 'A live project report combines funding, spending, updates, evidence, beneficiaries, and impact and can be printed or saved as PDF.',
  },
  {
    feature: 'Toast feedback',
    who: 'All signed-in users',
    details: 'Short success and error feedback uses timed toast messages with compact styling instead of large inline alerts.',
  },
  {
    feature: 'Document preview',
    who: 'Staff and admin',
    details: 'Uploaded staff verification images and PDFs can be previewed in-app during submission and review.',
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
          <p className="mt-3 text-xs leading-6 text-gray-500">
            Final frontend state for the end of development: the public site, donor portal, staff
            workspace, and admin oversight UI now follow the current backend rules and product flow.
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
        <Card className="mb-4 rounded-[24px] border border-gray-200 p-4 sm:p-5">
          <h2 className="text-base font-bold text-gray-900">Frontend Areas</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="text-left">
                  <th className="pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    Area
                  </th>
                  <th className="pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    Route
                  </th>
                  <th className="pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    Who
                  </th>
                  <th className="pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {areaRows.map((row) => (
                  <tr key={row.area}>
                    <td className="py-3 pr-4 text-sm font-semibold text-gray-900">{row.area}</td>
                    <td className="py-3 pr-4 text-xs text-gray-600">{row.route}</td>
                    <td className="py-3 pr-4 text-xs text-gray-600">{row.who}</td>
                    <td className="py-3 text-xs leading-6 text-gray-600">{row.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

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
