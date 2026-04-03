import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  FolderKanban,
  HandCoins,
  HeartHandshake,
  MapPin,
  Target,
} from 'lucide-react'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import Card from '../../components/ui/Card'

function unwrapPayload(payload) {
  if (!payload) return payload
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.results)) return payload.results
  if (Array.isArray(payload?.data)) return payload.data
  if (payload?.data && typeof payload.data === 'object') return payload.data
  return payload
}

function normalizeListResponse(payload) {
  const unwrapped = unwrapPayload(payload)

  if (Array.isArray(unwrapped)) return unwrapped
  if (Array.isArray(unwrapped?.results)) return unwrapped.results
  if (Array.isArray(payload?.results)) return payload.results
  if (Array.isArray(payload?.data?.results)) return payload.data.results

  return []
}

function formatCurrency(value) {
  const amount = Number(value || 0)

  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    maximumFractionDigits: 0,
  }).format(Number.isNaN(amount) ? 0 : amount)
}

function formatDate(value) {
  if (!value) return 'N/A'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getDonationDate(donation) {
  return donation?.donated_at || donation?.created_at || donation?.date || null
}

function getUpdateImages(item) {
  if (Array.isArray(item?.images)) return item.images
  if (Array.isArray(item?.project_update_images)) return item.project_update_images
  return []
}

function getBeneficiaryImages(item) {
  if (Array.isArray(item?.images)) return item.images
  if (Array.isArray(item?.beneficiary_images)) return item.beneficiary_images
  return []
}

function getDonorName(donation) {
  if (donation?.is_anonymous) return 'Anonymous Donor'

  return (
    donation?.donor_name ||
    donation?.donor_username ||
    donation?.donor?.username ||
    donation?.user?.username ||
    'Donor'
  )
}

function getStatusTone(status) {
  const normalized = String(status || '').toLowerCase()

  if (normalized === 'active') return 'bg-green-100 text-green-800'
  if (normalized === 'completed') return 'bg-blue-100 text-blue-800'
  if (normalized === 'planning') return 'bg-amber-100 text-amber-800'
  if (normalized === 'on_hold') return 'bg-gray-200 text-gray-700'
  return 'bg-gray-100 text-gray-700'
}

const tabs = [
  { id: 'overview', label: 'Overview', icon: FolderKanban },
  { id: 'beneficiaries', label: 'Beneficiaries', icon: HeartHandshake },
  { id: 'donations', label: 'Donations', icon: HandCoins },
  { id: 'updates', label: 'Updates', icon: Bell },
]

function DashboardProjectWorkspacePage() {
  const { projectId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = tabs.some((tab) => tab.id === searchParams.get('tab'))
    ? searchParams.get('tab')
    : 'overview'

  const [project, setProject] = useState(null)
  const [beneficiaries, setBeneficiaries] = useState([])
  const [donations, setDonations] = useState([])
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadWorkspace() {
      try {
        setLoading(true)
        setError('')

        const [projectResponse, beneficiariesResponse, donationsResponse, updatesResponse] =
          await Promise.allSettled([
            api.get(endpoints.projectDetails(projectId)),
            api.get(endpoints.beneficiaries, { params: { project: projectId } }),
            api.get(endpoints.donations, { params: { project: projectId } }),
            api.get(endpoints.projectUpdates, { params: { project: projectId } }),
          ])

        if (!active) return

        if (projectResponse.status === 'fulfilled') {
          setProject(unwrapPayload(projectResponse.value.data))
        } else {
          throw projectResponse.reason
        }

        setBeneficiaries(
          beneficiariesResponse.status === 'fulfilled'
            ? normalizeListResponse(beneficiariesResponse.value.data)
            : []
        )
        setDonations(
          donationsResponse.status === 'fulfilled'
            ? normalizeListResponse(donationsResponse.value.data)
            : []
        )
        setUpdates(
          updatesResponse.status === 'fulfilled'
            ? normalizeListResponse(updatesResponse.value.data)
            : []
        )
      } catch (err) {
        if (!active) return

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            'Failed to load this project workspace.'
        )
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    if (projectId) {
      loadWorkspace()
    }

    return () => {
      active = false
    }
  }, [projectId])

  const stats = useMemo(() => {
    return {
      beneficiaries: beneficiaries.length,
      donations: donations.length,
      updates: updates.length,
      raised: Number(project?.total_donated || 0),
    }
  }, [beneficiaries, donations, updates, project])

  const sortedDonations = useMemo(() => {
    return [...donations].sort(
      (a, b) => new Date(getDonationDate(b) || 0) - new Date(getDonationDate(a) || 0)
    )
  }, [donations])

  const sortedUpdates = useMemo(() => {
    return [...updates].sort(
      (a, b) => new Date(b?.created_at || 0) - new Date(a?.created_at || 0)
    )
  }, [updates])

  const selectedTab = tabs.find((tab) => tab.id === activeTab) || tabs[0]

  function switchTab(tabId) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('tab', tabId)
    setSearchParams(nextParams)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Workspace</h1>
          <p className="mt-1.5 text-sm text-gray-600">Loading project details...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Workspace</h1>
          <p className="mt-1.5 text-sm text-gray-600">Unable to open this project.</p>
        </div>

        <Card className="border border-red-200 p-5">
          <p className="text-sm text-red-700">{error || 'Project not found.'}</p>
          <Link
            to="/dashboard/projects"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#166534]"
          >
            <ArrowLeft size={15} />
            Back to Projects
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            to="/dashboard/projects"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-green-800"
          >
            <ArrowLeft size={14} />
            Back to Projects
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            {project?.title || 'Project'}
          </h1>
          <p className="mt-1.5 text-sm text-gray-600">
            Project-centered workspace for related records and operational details.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusTone(
              project?.status
            )}`}
          >
            {project?.status || 'Unknown'}
          </span>
          <Link
            to={`/projects/${project.id}`}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-green-300 hover:text-green-800"
          >
            View Public Page
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-[22px] p-4">
          <p className="text-xs text-gray-500">Raised</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{formatCurrency(stats.raised)}</p>
        </Card>
        <Card className="rounded-[22px] p-4">
          <p className="text-xs text-gray-500">Target</p>
          <p className="mt-1 text-xl font-bold text-gray-900">
            {formatCurrency(project?.target_amount)}
          </p>
        </Card>
        <Card className="rounded-[22px] p-4">
          <p className="text-xs text-gray-500">Beneficiaries</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{stats.beneficiaries}</p>
        </Card>
        <Card className="rounded-[22px] p-4">
          <p className="text-xs text-gray-500">Updates</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{stats.updates}</p>
        </Card>
      </div>

      <Card className="rounded-[24px] p-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = tab.id === selectedTab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => switchTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-green-800 text-white'
                    : 'bg-[#F3F5F0] text-gray-700 hover:bg-green-50 hover:text-green-800'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </Card>

      {selectedTab.id === 'overview' && (
        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-[24px] p-5">
            <h2 className="text-base font-bold text-gray-900">Project Details</h2>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              {project?.description || 'No project description available.'}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#F8F8F6] p-3.5">
                <p className="text-xs text-gray-500">Location</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {project?.location || 'Not specified'}
                </p>
              </div>
              <div className="rounded-2xl bg-[#F8F8F6] p-3.5">
                <p className="text-xs text-gray-500">Budget</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {formatCurrency(project?.budget)}
                </p>
              </div>
              <div className="rounded-2xl bg-[#F8F8F6] p-3.5">
                <p className="text-xs text-gray-500">Start Date</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {formatDate(project?.start_date)}
                </p>
              </div>
              <div className="rounded-2xl bg-[#F8F8F6] p-3.5">
                <p className="text-xs text-gray-500">End Date</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {formatDate(project?.end_date)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="rounded-[24px] p-5">
            <h2 className="text-base font-bold text-gray-900">Project Snapshot</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-[#F8F8F6] px-3.5 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={15} />
                  Location
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {project?.location || 'Not set'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[#F8F8F6] px-3.5 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Target size={15} />
                  Progress
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {Number(project?.funding_percentage || 0).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[#F8F8F6] px-3.5 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarDays size={15} />
                  Created
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatDate(project?.created_at)}
                </span>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold text-gray-500">Partners</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {Array.isArray(project?.partners) && project.partners.length > 0 ? (
                  project.partners.map((partner) => (
                    <span
                      key={partner.id}
                      className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800"
                    >
                      {partner.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No partners linked yet.</span>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {selectedTab.id === 'beneficiaries' && (
        <Card className="rounded-[24px] p-5">
          <h2 className="text-base font-bold text-gray-900">Beneficiaries</h2>
          <p className="mt-1 text-sm text-gray-500">All beneficiary records for this project.</p>

          {beneficiaries.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-[#F8F8F6] p-5 text-sm text-gray-600">
              No beneficiaries linked to this project yet.
            </div>
          ) : (
            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {beneficiaries.map((beneficiary) => {
                const images = getBeneficiaryImages(beneficiary)

                return (
                  <div
                    key={beneficiary.id}
                    className="rounded-[22px] border border-gray-200 bg-[#FCFCFB] p-4"
                  >
                    <p className="text-sm font-semibold text-gray-900">{beneficiary.name}</p>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {beneficiary.description || 'No beneficiary description available.'}
                    </p>

                    {images.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-2.5">
                        {images.slice(0, 3).map((image) => (
                          <img
                            key={image?.id || image?.image}
                            src={image?.image}
                            alt={image?.caption || beneficiary?.name || 'Beneficiary image'}
                            className="h-20 w-full rounded-xl object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      )}

      {selectedTab.id === 'donations' && (
        <Card className="rounded-[24px] p-5">
          <h2 className="text-base font-bold text-gray-900">Donations</h2>
          <p className="mt-1 text-sm text-gray-500">Contribution history for this project.</p>

          {sortedDonations.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-[#F8F8F6] p-5 text-sm text-gray-600">
              No donation records are visible for this project yet.
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="text-left">
                    <th className="pb-3 text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">
                      Donor
                    </th>
                    <th className="pb-3 text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">
                      Amount
                    </th>
                    <th className="pb-3 text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">
                      Method
                    </th>
                    <th className="pb-3 text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedDonations.map((donation) => (
                    <tr key={donation.id}>
                      <td className="py-3.5 pr-4">
                        <p className="text-sm font-semibold text-gray-900">
                          {getDonorName(donation)}
                        </p>
                      </td>
                      <td className="py-3.5 pr-4 text-sm font-semibold text-green-800">
                        {formatCurrency(donation?.amount)}
                      </td>
                      <td className="py-3.5 pr-4 text-sm text-gray-600">
                        {donation?.payment_method || 'N/A'}
                      </td>
                      <td className="py-3.5 text-sm text-gray-600">
                        {formatDate(getDonationDate(donation))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {selectedTab.id === 'updates' && (
        <Card className="rounded-[24px] p-5">
          <h2 className="text-base font-bold text-gray-900">Updates</h2>
          <p className="mt-1 text-sm text-gray-500">Recent progress records for this project.</p>

          {sortedUpdates.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-[#F8F8F6] p-5 text-sm text-gray-600">
              No updates published for this project yet.
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {sortedUpdates.map((update) => {
                const images = getUpdateImages(update)

                return (
                  <div
                    key={update.id}
                    className="rounded-[22px] border border-gray-200 bg-[#FCFCFB] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{update.title}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatDate(update?.created_at)}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      {update.description || 'No update description available.'}
                    </p>

                    {images.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-2.5">
                        {images.slice(0, 3).map((image) => (
                          <img
                            key={image?.id || image?.image}
                            src={image?.image}
                            alt={image?.caption || update?.title || 'Update image'}
                            className="h-20 w-full rounded-xl object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

export default DashboardProjectWorkspacePage
