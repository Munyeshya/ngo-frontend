import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  Filter,
  HandCoins,
  Search,
  SlidersHorizontal,
} from 'lucide-react'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'

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

function getProjectName(donation) {
  return donation?.project?.title || donation?.project_title || 'Project Donation'
}

function getProjectId(donation) {
  return donation?.project?.id || donation?.project_id || donation?.project || null
}

function DonorDonationHistoryPage() {
  const [donations, setDonations] = useState([])
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

        const response = await api.get(endpoints.myDonations)

        if (!active) return
        setDonations(normalizeListResponse(response.data))
      } catch (err) {
        if (!active) return

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            'Failed to load your donation history.'
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
        const projectName = getProjectName(item).toLowerCase()
        const message = String(item?.message || '').toLowerCase()
        const paymentMethod = String(item?.payment_method || '').toLowerCase()

        return (
          projectName.includes(query) ||
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
    const totalCount = donations.length
    const totalAmount = donations.reduce((sum, item) => sum + Number(item?.amount || 0), 0)

    const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0

    const supportedProjects = new Set(
      donations.map((item) => getProjectId(item)).filter(Boolean)
    ).size

    return {
      totalCount,
      totalAmount,
      averageAmount,
      supportedProjects,
    }
  }, [donations])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 sm:p-8">
          <p className="text-2xl font-bold text-gray-900">Loading donation history...</p>
          <p className="mt-2 text-sm text-gray-500">
            We are preparing your personal contribution records.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[28px] border border-red-200 bg-white p-6 sm:p-8">
        <p className="text-2xl font-bold text-gray-900">Unable to load donations</p>
        <p className="mt-3 text-sm leading-7 text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-[#166534]">My Donations</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              Donation History
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500">
              Review every contribution you have made, track supported projects, and understand
              your overall giving impact.
            </p>
          </div>

          <Link
            to="/projects"
            className="inline-flex items-center justify-center rounded-2xl bg-[#166534] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0F4D27]"
          >
            Donate Again
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[26px] border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-green-100 p-3 text-[#166534]">
              <HandCoins size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Count</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Total Donations</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{stats.totalCount}</p>
        </div>

        <div className="rounded-[26px] border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-emerald-100 p-3 text-[#166534]">
              <HandCoins size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Value</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Total Amount</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {formatCurrency(stats.totalAmount)}
          </p>
        </div>

        <div className="rounded-[26px] border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-lime-100 p-3 text-[#166534]">
              <CalendarDays size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Average</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Average Donation</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {formatCurrency(stats.averageAmount)}
          </p>
        </div>

        <div className="rounded-[26px] border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-green-100 p-3 text-[#166534]">
              <ArrowRight size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Projects</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Supported Projects</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{stats.supportedProjects}</p>
        </div>
      </section>

      <section className="rounded-[28px] border border-gray-200 bg-white p-6 sm:p-7">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">All Contributions</h3>
            <p className="mt-1 text-sm text-gray-500">
              Search, filter, and review your full donation history.
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
                placeholder="Search by project or message"
                className="h-12 w-full rounded-2xl border border-gray-300 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
              />
            </div>

            <div className="relative">
              <Filter
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
          <div className="mt-8 rounded-[24px] bg-[#F6F8F4] p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#166534] shadow-sm">
              <HandCoins size={24} />
            </div>
            <p className="mt-4 text-lg font-semibold text-gray-900">No matching donations found</p>
            <p className="mt-2 text-sm leading-7 text-gray-500">
              Try changing your search or filters, or make your first contribution to a project.
            </p>
            <Link
              to="/projects"
              className="mt-5 inline-flex items-center justify-center rounded-2xl bg-[#166534] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0F4D27]"
            >
              Explore Projects
            </Link>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-[24px] border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#F8F8F6]">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                      Project
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                      Amount
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                      Payment
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                      Anonymous
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                      Date
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredDonations.map((donation) => {
                    const projectId = getProjectId(donation)

                    return (
                      <tr key={donation.id}>
                        <td className="px-5 py-4 align-top">
                          <p className="text-sm font-semibold text-gray-900">
                            {getProjectName(donation)}
                          </p>
                          <p className="mt-1 max-w-md text-xs leading-6 text-gray-500">
                            {donation?.message || 'No donation message provided.'}
                          </p>
                        </td>

                        <td className="px-5 py-4 align-top text-sm font-semibold text-[#166534]">
                          {formatCurrency(donation?.amount)}
                        </td>

                        <td className="px-5 py-4 align-top">
                          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold capitalize text-green-800">
                            {donation?.payment_method || 'N/A'}
                          </span>
                        </td>

                        <td className="px-5 py-4 align-top text-sm text-gray-600">
                          {donation?.is_anonymous ? 'Yes' : 'No'}
                        </td>

                        <td className="px-5 py-4 align-top text-sm text-gray-600">
                          {formatDate(donation?.created_at || donation?.date)}
                        </td>

                        <td className="px-5 py-4 align-top">
                          {projectId ? (
                            <Link
                              to={`/projects/${projectId}`}
                              className="inline-flex items-center gap-2 text-sm font-semibold text-[#166534] transition hover:text-[#0F4D27]"
                            >
                              View project
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
          </div>
        )}
      </section>
    </div>
  )
}

export default DonorDonationHistoryPage