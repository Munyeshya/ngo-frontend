import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  HandCoins,
  Search,
  SlidersHorizontal,
  TrendingUp,
  UserRound,
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

function getCountFromResponse(payload, fallbackArray = []) {
  if (typeof payload?.count === 'number') return payload.count
  if (typeof payload?.data?.count === 'number') return payload.data.count
  return fallbackArray.length
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

function getProjectName(donation) {
  return donation?.project?.title || donation?.project_title || 'Project Donation'
}

function getProjectId(donation) {
  return donation?.project?.id || donation?.project_id || donation?.project || null
}

function getDonorName(donation) {
  if (donation?.is_anonymous) return 'Anonymous Donor'

  return (
    donation?.donor_name ||
    donation?.donor?.full_name ||
    donation?.donor?.username ||
    donation?.user?.username ||
    'Unknown Donor'
  )
}

function DonationsPage() {
  const [donations, setDonations] = useState([])
  const [donationsCount, setDonationsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [sortBy, setSortBy] = useState('latest')

  useEffect(() => {
    let active = true

    async function loadDonations() {
      try {
        setLoading(true)
        setError('')

        const response = await api.get(endpoints.donations)
        if (!active) return

        const list = normalizeListResponse(response.data)
        setDonations(list)
        setDonationsCount(getCountFromResponse(response.data, list))
      } catch (err) {
        if (!active) return

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            'Failed to load donations.'
        )
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadDonations()

    return () => {
      active = false
    }
  }, [])

  const paymentMethods = useMemo(() => {
    const methods = new Set(
      donations.map((item) => String(item?.payment_method || '').toLowerCase()).filter(Boolean)
    )
    return Array.from(methods)
  }, [donations])

  const filteredDonations = useMemo(() => {
    let items = [...donations]

    if (search.trim()) {
      const query = search.trim().toLowerCase()

      items = items.filter((item) => {
        const donor = getDonorName(item).toLowerCase()
        const project = getProjectName(item).toLowerCase()
        const message = String(item?.message || '').toLowerCase()
        const paymentMethod = String(item?.payment_method || '').toLowerCase()

        return (
          donor.includes(query) ||
          project.includes(query) ||
          message.includes(query) ||
          paymentMethod.includes(query)
        )
      })
    }

    if (paymentFilter !== 'all') {
      items = items.filter(
        (item) => String(item?.payment_method || '').toLowerCase() === paymentFilter
      )
    }

    items.sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b?.created_at || b?.date || 0) - new Date(a?.created_at || a?.date || 0)
      }

      if (sortBy === 'oldest') {
        return new Date(a?.created_at || a?.date || 0) - new Date(b?.created_at || b?.date || 0)
      }

      if (sortBy === 'highest') {
        return Number(b?.amount || 0) - Number(a?.amount || 0)
      }

      if (sortBy === 'lowest') {
        return Number(a?.amount || 0) - Number(b?.amount || 0)
      }

      return 0
    })

    return items
  }, [donations, search, paymentFilter, sortBy])

  const stats = useMemo(() => {
    const totalAmount = donations.reduce((sum, item) => sum + Number(item?.amount || 0), 0)

    const anonymousCount = donations.filter((item) => Boolean(item?.is_anonymous)).length

    const uniqueProjects = new Set(
      donations.map((item) => getProjectId(item)).filter(Boolean)
    ).size

    return {
      totalAmount,
      anonymousCount,
      uniqueProjects,
    }
  }, [donations])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Donations</h1>
          <p className="mt-2 text-gray-600">Loading donation records...</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="p-5">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="mt-4 h-8 w-20 animate-pulse rounded bg-gray-200" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Donations</h1>
          <p className="mt-2 text-gray-600">Review and monitor donation activity.</p>
        </div>

        <Card className="border border-red-200 p-6">
          <p className="text-lg font-semibold text-gray-900">Unable to load donations</p>
          <p className="mt-2 text-sm leading-7 text-red-600">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Donations</h1>
          <p className="mt-2 text-gray-600">
            Review donor activity, contribution amounts, and project funding support.
          </p>
        </div>

        <div className="inline-flex items-center rounded-2xl bg-green-50 px-4 py-2 text-sm font-medium text-green-800">
          <HandCoins size={16} className="mr-2" />
          Total Records: {donationsCount}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-[24px] p-5">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-green-100 p-3 text-green-800">
              <HandCoins size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Count</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">All Donations</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{donationsCount}</p>
        </Card>

        <Card className="rounded-[24px] p-5">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-emerald-100 p-3 text-green-800">
              <TrendingUp size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Amount</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Total Amount</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {formatCurrency(stats.totalAmount)}
          </p>
        </Card>

        <Card className="rounded-[24px] p-5">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-lime-100 p-3 text-green-800">
              <UserRound size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Private</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Anonymous Donations</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.anonymousCount}</p>
        </Card>

        <Card className="rounded-[24px] p-5">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-green-100 p-3 text-green-800">
              <CalendarDays size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Coverage</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Supported Projects</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.uniqueProjects}</p>
        </Card>
      </div>

      <Card className="rounded-[24px] p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Donation Directory</h2>
            <p className="mt-1 text-sm text-gray-500">
              Search and review all donation records visible to your role.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3 xl:min-w-[760px]">
            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search donor, project, message"
                className="h-12 w-full rounded-2xl border border-gray-300 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
              />
            </div>

            <div className="relative">
              <HandCoins
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="h-12 w-full appearance-none rounded-2xl border border-gray-300 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
              >
                <option value="all">All payment methods</option>
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method.charAt(0).toUpperCase() + method.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <SlidersHorizontal
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-12 w-full appearance-none rounded-2xl border border-gray-300 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
              >
                <option value="latest">Latest first</option>
                <option value="oldest">Oldest first</option>
                <option value="highest">Highest amount</option>
                <option value="lowest">Lowest amount</option>
              </select>
            </div>
          </div>
        </div>

        {filteredDonations.length === 0 ? (
          <div className="mt-8 rounded-[24px] bg-[#F8F8F6] p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-green-800 shadow-sm">
              <HandCoins size={24} />
            </div>
            <p className="mt-4 text-lg font-semibold text-gray-900">No donations found</p>
            <p className="mt-2 text-sm leading-7 text-gray-500">
              Try changing your search or filter settings.
            </p>
          </div>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="text-left">
                  <th className="pb-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                    Donor
                  </th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                    Project
                  </th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                    Amount
                  </th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                    Payment
                  </th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                    Date
                  </th>
                  <th className="pb-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredDonations.map((donation) => {
                  const projectId = getProjectId(donation)

                  return (
                    <tr key={donation.id}>
                      <td className="py-4 pr-4 align-top">
                        <p className="text-sm font-semibold text-gray-900">
                          {getDonorName(donation)}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {donation?.is_anonymous ? 'Identity hidden publicly' : 'Visible donor'}
                        </p>
                      </td>

                      <td className="py-4 pr-4 align-top">
                        <p className="text-sm font-semibold text-gray-900">
                          {getProjectName(donation)}
                        </p>
                        <p className="mt-1 max-w-xs text-xs text-gray-500">
                          {donation?.message || 'No donor message provided.'}
                        </p>
                      </td>

                      <td className="py-4 pr-4 align-top text-sm font-semibold text-green-800">
                        {formatCurrency(donation?.amount)}
                      </td>

                      <td className="py-4 pr-4 align-top">
                        <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold capitalize text-green-800">
                          {donation?.payment_method || 'N/A'}
                        </span>
                      </td>

                      <td className="py-4 pr-4 align-top text-sm text-gray-600">
                        {formatDate(donation?.created_at || donation?.date)}
                      </td>

                      <td className="py-4 align-top">
                        {projectId ? (
                          <Link
                            to={`/projects/${projectId}`}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[#166534] transition hover:text-[#0F4D27]"
                          >
                            View Project
                            <ArrowRight size={15} />
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-400">Unavailable</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

export default DonationsPage