import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Search, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import Card from '../../components/ui/Card'

const REPORTS_PER_PAGE = 7

function normalizeListResponse(payload) {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.results)) return payload.results
  if (Array.isArray(payload?.data)) return payload.data
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

function statusTone(status) {
  const normalized = String(status || '').toLowerCase()
  if (normalized === 'clear') return 'bg-green-100 text-green-800'
  if (normalized === 'under_review') return 'bg-amber-100 text-amber-800'
  if (normalized === 'taken_down') return 'bg-red-100 text-red-700'
  if (normalized === 'open') return 'bg-green-100 text-green-800'
  if (normalized === 'frozen') return 'bg-red-100 text-red-700'
  return 'bg-[#F3F5F0] text-gray-700'
}

function AdminReportsPage() {
  const [reports, setReports] = useState([])
  const [projects, setProjects] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function initialize() {
      try {
        setLoading(true)
        setError('')
        const [reportsResponse, projectsResponse] = await Promise.all([
          api.get(endpoints.projectReports),
          api.get(endpoints.projects),
        ])

        if (!active) return

        setReports(normalizeListResponse(reportsResponse.data))
        setProjects(normalizeListResponse(projectsResponse.data))
      } catch (err) {
        if (!active) return
        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            'Failed to load reported projects.'
        )
      } finally {
        if (active) setLoading(false)
      }
    }

    initialize()
    return () => {
      active = false
    }
  }, [])

  const groupedProjects = useMemo(() => {
    const reportsByProject = reports.reduce((acc, report) => {
      if (!acc[report.project]) acc[report.project] = []
      acc[report.project].push(report)
      return acc
    }, {})

    return Object.entries(reportsByProject)
      .map(([projectId, projectReports]) => {
        const project = projects.find((item) => String(item.id) === String(projectId))
        if (!project) return null

        const reasonCounts = projectReports.reduce((acc, report) => {
          const reason = report.reason_type || 'other'
          acc[reason] = (acc[reason] || 0) + 1
          return acc
        }, {})

        return {
          project,
          reports: projectReports.sort(
            (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
          ),
          uniqueReasons: Object.keys(reasonCounts).length,
        }
      })
      .filter(Boolean)
      .sort((a, b) => b.reports.length - a.reports.length)
  }, [projects, reports])

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return groupedProjects

    return groupedProjects.filter(({ project, reports: projectReports }) => {
      const haystack = [
        project.title,
        project.location,
        project.created_by,
        ...projectReports.map((report) => report.reason_type),
        ...projectReports.map((report) => report.claim_text),
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [groupedProjects, search])

  const pageCount = Math.max(1, Math.ceil(filteredProjects.length / REPORTS_PER_PAGE))
  const safePage = Math.min(page, pageCount)

  const paginatedProjects = useMemo(() => {
    const startIndex = (safePage - 1) * REPORTS_PER_PAGE
    return filteredProjects.slice(startIndex, startIndex + REPORTS_PER_PAGE)
  }, [filteredProjects, safePage])

  useEffect(() => {
    setPage(1)
  }, [search])

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reported Projects</h1>
          <p className="mt-1 text-sm text-gray-600">Loading moderation queue...</p>
        </div>
        <Card className="p-4">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          <div className="mt-4 h-24 animate-pulse rounded-2xl bg-gray-100" />
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reported Projects</h1>
          <p className="mt-1 text-sm text-gray-600">Moderation and risk review.</p>
        </div>
        <Card className="border border-red-200 p-4">
          <p className="text-sm font-semibold text-gray-900">Unable to load reports</p>
          <p className="mt-2 text-sm leading-6 text-red-600">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Reported Projects</h1>
          <p className="mt-1 text-sm text-gray-600">
            Open a project to inspect its claims, review the risk, and take moderation action.
          </p>
        </div>
        <div className="inline-flex items-center rounded-2xl bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800">
          <ShieldAlert size={15} className="mr-2" />
          Flagged Projects: {filteredProjects.length}
        </div>
      </div>

      <Card className="rounded-[22px] p-4">
        <div className="relative max-w-sm">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search reported projects"
            className="h-9 w-full rounded-xl border border-gray-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
          />
        </div>

        {filteredProjects.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-[#F8F8F6] p-4 text-xs text-gray-600">
            No reported projects are waiting in the moderation queue right now.
          </div>
        ) : (
          <>
            <div className="mt-4 space-y-3">
              {paginatedProjects.map(({ project, reports: projectReports, uniqueReasons }) => (
                <div
                  key={project.id}
                  className="rounded-[22px] border border-gray-200 bg-[#FCFCFB] p-4"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {project.title}
                        </p>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusTone(project.moderation_status)}`}
                        >
                          {String(project.moderation_status || '').replace(/_/g, ' ')}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusTone(project.funding_status)}`}
                        >
                          Funding {String(project.funding_status || '').replace(/_/g, ' ')}
                        </span>
                      </div>

                      <p className="mt-1 text-[11px] text-gray-500">
                        {project.location || 'No location'} • Owner: {project.created_by || 'N/A'}
                      </p>

                      <p className="mt-2 text-xs leading-6 text-gray-600">
                        Latest claim: {projectReports[0]?.claim_text || 'No claim details provided.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <div className="rounded-2xl bg-[#F8F8F6] px-3 py-2">
                        <p className="text-[10px] uppercase tracking-[0.08em] text-gray-500">
                          Reports
                        </p>
                        <p className="mt-1 text-sm font-bold text-gray-900">
                          {projectReports.length}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[#F8F8F6] px-3 py-2">
                        <p className="text-[10px] uppercase tracking-[0.08em] text-gray-500">
                          Reasons
                        </p>
                        <p className="mt-1 text-sm font-bold text-gray-900">{uniqueReasons}</p>
                      </div>
                      <div className="rounded-2xl bg-[#F8F8F6] px-3 py-2">
                        <p className="text-[10px] uppercase tracking-[0.08em] text-gray-500">
                          Raised
                        </p>
                        <p className="mt-1 text-sm font-bold text-gray-900">
                          {formatCurrency(project.total_donated)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[#F8F8F6] px-3 py-2">
                        <p className="text-[10px] uppercase tracking-[0.08em] text-gray-500">
                          Latest Report
                        </p>
                        <p className="mt-1 text-sm font-bold text-gray-900">
                          {formatDate(projectReports[0]?.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Link
                      to={`/dashboard/reports/${project.id}`}
                      className="inline-flex items-center gap-2 rounded-2xl bg-green-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0f4d27]"
                    >
                      <span className="text-white">Open Report</span>
                      <ArrowRight size={14} className="text-white" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1">
              <p className="text-xs text-gray-500">
                Page {safePage} of {pageCount}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(1, safePage - 1))}
                  disabled={safePage <= 1}
                  className="rounded-full bg-[#F3F5F0] px-3 py-1.5 text-[11px] font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage(Math.min(pageCount, safePage + 1))}
                  disabled={safePage >= pageCount}
                  className="rounded-full bg-[#F3F5F0] px-3 py-1.5 text-[11px] font-semibold text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

export default AdminReportsPage
