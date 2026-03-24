import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  FolderKanban,
  MapPin,
  Search,
  SlidersHorizontal,
  Target,
  TrendingUp,
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

function getStatusTone(status) {
  const normalized = String(status || '').toLowerCase()

  if (normalized === 'active') {
    return 'bg-green-100 text-green-800'
  }

  if (normalized === 'completed') {
    return 'bg-blue-100 text-blue-800'
  }

  if (normalized === 'draft' || normalized === 'planned') {
    return 'bg-amber-100 text-amber-800'
  }

  if (normalized === 'cancelled' || normalized === 'inactive') {
    return 'bg-red-100 text-red-700'
  }

  return 'bg-gray-100 text-gray-700'
}

function DashboardProjectsPage() {
  const [projects, setProjects] = useState([])
  const [projectsCount, setProjectsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('latest')

  useEffect(() => {
    let active = true

    async function loadProjects() {
      try {
        setLoading(true)
        setError('')

        const response = await api.get(endpoints.projects)
        if (!active) return

        const list = normalizeListResponse(response.data)
        setProjects(list)
        setProjectsCount(getCountFromResponse(response.data, list))
      } catch (err) {
        if (!active) return

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            'Failed to load projects.'
        )
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadProjects()

    return () => {
      active = false
    }
  }, [])

  const statusOptions = useMemo(() => {
    const statuses = new Set(
      projects.map((item) => String(item?.status || '').toLowerCase()).filter(Boolean)
    )

    return Array.from(statuses)
  }, [projects])

  const filteredProjects = useMemo(() => {
    let items = [...projects]

    if (search.trim()) {
      const query = search.trim().toLowerCase()

      items = items.filter((item) => {
        const title = String(item?.title || '').toLowerCase()
        const description = String(item?.description || '').toLowerCase()
        const location = String(item?.location || '').toLowerCase()
        const status = String(item?.status || '').toLowerCase()

        return (
          title.includes(query) ||
          description.includes(query) ||
          location.includes(query) ||
          status.includes(query)
        )
      })
    }

    if (statusFilter !== 'all') {
      items = items.filter(
        (item) => String(item?.status || '').toLowerCase() === statusFilter
      )
    }

    items.sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b?.created_at || 0) - new Date(a?.created_at || 0)
      }

      if (sortBy === 'oldest') {
        return new Date(a?.created_at || 0) - new Date(b?.created_at || 0)
      }

      if (sortBy === 'highest-funded') {
        return Number(b?.funding_percentage || 0) - Number(a?.funding_percentage || 0)
      }

      if (sortBy === 'lowest-funded') {
        return Number(a?.funding_percentage || 0) - Number(b?.funding_percentage || 0)
      }

      if (sortBy === 'highest-target') {
        return Number(b?.target_amount || 0) - Number(a?.target_amount || 0)
      }

      if (sortBy === 'lowest-target') {
        return Number(a?.target_amount || 0) - Number(b?.target_amount || 0)
      }

      return 0
    })

    return items
  }, [projects, search, statusFilter, sortBy])

  const stats = useMemo(() => {
    const activeCount = projects.filter(
      (item) => String(item?.status || '').toLowerCase() === 'active'
    ).length

    const completedCount = projects.filter(
      (item) => String(item?.status || '').toLowerCase() === 'completed'
    ).length

    const totalTarget = projects.reduce(
      (sum, item) => sum + Number(item?.target_amount || 0),
      0
    )

    const totalRaised = projects.reduce(
      (sum, item) => sum + Number(item?.total_donated || 0),
      0
    )

    return {
      activeCount,
      completedCount,
      totalTarget,
      totalRaised,
    }
  }, [projects])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="mt-2 text-gray-600">Loading project records...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="mt-2 text-gray-600">Manage and monitor platform projects.</p>
        </div>

        <Card className="border border-red-200 p-6">
          <p className="text-lg font-semibold text-gray-900">Unable to load projects</p>
          <p className="mt-2 text-sm leading-7 text-red-600">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="mt-2 text-gray-600">
            Review project performance, funding progress, and operational status.
          </p>
        </div>

        <div className="inline-flex items-center rounded-2xl bg-green-50 px-4 py-2 text-sm font-medium text-green-800">
          <FolderKanban size={16} className="mr-2" />
          Total Records: {projectsCount}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-[24px] p-5">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-green-100 p-3 text-green-800">
              <FolderKanban size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Projects</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">All Projects</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{projectsCount}</p>
        </Card>

        <Card className="rounded-[24px] p-5">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-emerald-100 p-3 text-green-800">
              <TrendingUp size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Active</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Active Projects</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.activeCount}</p>
        </Card>

        <Card className="rounded-[24px] p-5">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-lime-100 p-3 text-green-800">
              <Target size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Funding</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Combined Target</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {formatCurrency(stats.totalTarget)}
          </p>
        </Card>

        <Card className="rounded-[24px] p-5">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-green-100 p-3 text-green-800">
              <TrendingUp size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Raised</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Combined Raised</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {formatCurrency(stats.totalRaised)}
          </p>
        </Card>
      </div>

      <Card className="rounded-[24px] p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Project Directory</h2>
            <p className="mt-1 text-sm text-gray-500">
              Search, filter, and review project records.
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
                placeholder="Search by title, location, status"
                className="h-12 w-full rounded-2xl border border-gray-300 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
              />
            </div>

            <div className="relative">
              <FilterIcon />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-12 w-full appearance-none rounded-2xl border border-gray-300 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
              >
                <option value="all">All statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
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
                <option value="highest-funded">Highest funded</option>
                <option value="lowest-funded">Lowest funded</option>
                <option value="highest-target">Highest target</option>
                <option value="lowest-target">Lowest target</option>
              </select>
            </div>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="mt-8 rounded-[24px] bg-[#F8F8F6] p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-green-800 shadow-sm">
              <FolderKanban size={24} />
            </div>
            <p className="mt-4 text-lg font-semibold text-gray-900">No projects found</p>
            <p className="mt-2 text-sm leading-7 text-gray-500">
              Try changing your search or filter settings.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 xl:grid-cols-2">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="rounded-[24px] border border-gray-200 bg-[#FCFCFB] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-bold text-gray-900">
                      {project?.title || 'Untitled project'}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={15} />
                        <span>{project?.location || 'Location not specified'}</span>
                      </div>

                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusTone(
                          project?.status
                        )}`}
                      >
                        {project?.status || 'Unknown'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {formatDate(project?.created_at)}
                    </p>
                  </div>
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-7 text-gray-600">
                  {project?.description || 'No description available for this project.'}
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs text-gray-500">Raised</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {formatCurrency(project?.total_donated)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs text-gray-500">Target</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {formatCurrency(project?.target_amount)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-xs text-gray-500">Progress</p>
                    <p className="mt-1 text-sm font-semibold text-green-800">
                      {Number(project?.funding_percentage || 0).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="mt-5 h-2.5 rounded-full bg-gray-200">
                  <div
                    className="h-2.5 rounded-full bg-green-800"
                    style={{
                      width: `${Math.min(Number(project?.funding_percentage || 0), 100)}%`,
                    }}
                  />
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Budget: <span className="font-medium text-gray-800">{formatCurrency(project?.budget)}</span>
                  </div>

                  <Link
                    to={`/projects/${project.id}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#166534] transition hover:text-[#0F4D27]"
                  >
                    View Public Page
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function FilterIcon() {
  return (
    <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
      <Search size={16} className="rotate-90 opacity-0" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Target size={16} />
      </div>
    </div>
  )
}

export default DashboardProjectsPage