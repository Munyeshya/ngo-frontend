import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Search, ShieldAlert } from 'lucide-react'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import Card from '../../components/ui/Card'

function normalizeListResponse(payload) {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.results)) return payload.results
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.data?.results)) return payload.data.results
  return []
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

function AdminReportsPage() {
  const [reports, setReports] = useState([])
  const [projects, setProjects] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [savingProjectId, setSavingProjectId] = useState(null)
  const [projectReviewForm, setProjectReviewForm] = useState({})

  async function loadData() {
    const [reportsResponse, projectsResponse] = await Promise.all([
      api.get(endpoints.projectReports),
      api.get(endpoints.projects),
    ])

    setReports(normalizeListResponse(reportsResponse.data))
    setProjects(normalizeListResponse(projectsResponse.data))
  }

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

    const filteredQuery = search.trim().toLowerCase()

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
          reasonCounts,
        }
      })
      .filter(Boolean)
      .filter((item) => {
        if (!filteredQuery) return true
        const haystack = [
          item.project.title,
          item.project.location,
          item.project.created_by,
          ...item.reports.map((report) => report.claim_text),
          ...item.reports.map((report) => report.reason_type),
        ]
          .join(' ')
          .toLowerCase()

        return haystack.includes(filteredQuery)
      })
      .sort((a, b) => b.reports.length - a.reports.length)
  }, [projects, reports, search])

  function getProjectReviewState(project) {
    return (
      projectReviewForm[project.id] || {
        moderation_status: project.moderation_status || 'under_review',
        funding_status: project.funding_status || 'frozen',
        moderation_note: project.moderation_note || '',
      }
    )
  }

  function handleReviewChange(projectId, field, value) {
    setProjectReviewForm((current) => ({
      ...current,
      [projectId]: {
        ...(current[projectId] || {}),
        [field]: value,
      },
    }))
  }

  async function handleProjectDecision(project) {
    const review = getProjectReviewState(project)

    try {
      setSavingProjectId(project.id)
      setActionError('')
      setActionSuccess('')
      await api.patch(endpoints.projectDetails(project.id), review)
      await loadData()
      setActionSuccess('Project moderation decision saved successfully.')
    } catch (err) {
      setActionError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          'Failed to save the project decision.'
      )
    } finally {
      setSavingProjectId(null)
    }
  }

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
            Review claims, freeze funding where needed, and decide which projects stay open.
          </p>
        </div>
        <div className="inline-flex items-center rounded-2xl bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800">
          <ShieldAlert size={15} className="mr-2" />
          Flagged Projects: {groupedProjects.length}
        </div>
      </div>

      {(actionError || actionSuccess) && (
        <Card className={`p-4 ${actionError ? 'border-red-200' : 'border-green-200'}`}>
          <p className={`text-sm ${actionError ? 'text-red-700' : 'text-green-700'}`}>
            {actionError || actionSuccess}
          </p>
        </Card>
      )}

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
            placeholder="Search flagged projects"
            className="h-9 w-full rounded-xl border border-gray-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
          />
        </div>

        {groupedProjects.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-[#F8F8F6] p-4 text-xs text-gray-600">
            No reported projects are waiting in the moderation queue right now.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {groupedProjects.map(({ project, reports: projectReports, reasonCounts }) => {
              const review = getProjectReviewState(project)

              return (
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
                          Raised
                        </p>
                        <p className="mt-1 text-sm font-bold text-gray-900">
                          {formatCurrency(project.total_donated)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[#F8F8F6] px-3 py-2">
                        <p className="text-[10px] uppercase tracking-[0.08em] text-gray-500">
                          Cashouts
                        </p>
                        <p className="mt-1 text-sm font-bold text-gray-900">
                          {formatCurrency(project.total_cashouts)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[#F8F8F6] px-3 py-2">
                        <p className="text-[10px] uppercase tracking-[0.08em] text-gray-500">
                          Balance
                        </p>
                        <p className="mt-1 text-sm font-bold text-gray-900">
                          {formatCurrency(project.available_balance)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                    <div className="space-y-3">
                      <div className="rounded-2xl border border-gray-200 bg-white p-3">
                        <p className="text-[11px] font-semibold text-gray-900">Claims by type</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {Object.entries(reasonCounts).map(([reason, count]) => (
                            <span
                              key={reason}
                              className="rounded-full bg-[#F3F5F0] px-2.5 py-1 text-[10px] font-semibold text-gray-700"
                            >
                              {String(reason).replace(/_/g, ' ')}: {count}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-gray-200 bg-white p-3">
                        <p className="text-[11px] font-semibold text-gray-900">Reported claims</p>
                        <div className="mt-2 space-y-2">
                          {projectReports.slice(0, 5).map((report) => (
                            <div
                              key={report.id}
                              className="rounded-xl bg-[#F8F8F6] px-3 py-2.5 text-xs text-gray-700"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="font-semibold text-gray-900">
                                  {report.reported_by_username || 'User'}
                                </span>
                                <span className="text-[10px] text-gray-500">
                                  {formatDate(report.created_at)}
                                </span>
                              </div>
                              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-amber-800">
                                {String(report.reason_type || '').replace(/_/g, ' ')}
                              </p>
                              <p className="mt-1 leading-5 text-gray-600">
                                {report.claim_text || 'No claim text provided.'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-3.5">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={15} className="text-amber-700" />
                        <p className="text-[11px] font-semibold text-gray-900">
                          Moderation Decision
                        </p>
                      </div>

                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <label className="space-y-1.5">
                          <span className="text-[11px] font-semibold text-gray-700">
                            Project status
                          </span>
                          <select
                            value={review.moderation_status}
                            onChange={(event) =>
                              handleReviewChange(
                                project.id,
                                'moderation_status',
                                event.target.value
                              )
                            }
                            className="h-9 w-full rounded-xl border border-gray-300 bg-white px-3 text-[11px] outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                          >
                            <option value="clear">Clear</option>
                            <option value="under_review">Under review</option>
                            <option value="taken_down">Taken down</option>
                          </select>
                        </label>

                        <label className="space-y-1.5">
                          <span className="text-[11px] font-semibold text-gray-700">
                            Funding status
                          </span>
                          <select
                            value={review.funding_status}
                            onChange={(event) =>
                              handleReviewChange(project.id, 'funding_status', event.target.value)
                            }
                            className="h-9 w-full rounded-xl border border-gray-300 bg-white px-3 text-[11px] outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                          >
                            <option value="open">Open</option>
                            <option value="frozen">Frozen</option>
                          </select>
                        </label>
                      </div>

                      <label className="mt-3 block space-y-1.5">
                        <span className="text-[11px] font-semibold text-gray-700">
                          Admin note
                        </span>
                        <textarea
                          rows="5"
                          value={review.moderation_note}
                          onChange={(event) =>
                            handleReviewChange(project.id, 'moderation_note', event.target.value)
                          }
                          placeholder="Add a short moderation note or instructions."
                          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                        />
                      </label>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleReviewChange(project.id, 'moderation_status', 'clear')
                            handleReviewChange(project.id, 'funding_status', 'open')
                          }}
                          className="rounded-full bg-green-50 px-3 py-1.5 text-[11px] font-semibold text-green-800 transition hover:bg-green-100"
                        >
                          Clear & reopen
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleReviewChange(project.id, 'moderation_status', 'under_review')
                            handleReviewChange(project.id, 'funding_status', 'frozen')
                          }}
                          className="rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-800 transition hover:bg-amber-100"
                        >
                          Freeze funds
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleReviewChange(project.id, 'moderation_status', 'taken_down')
                            handleReviewChange(project.id, 'funding_status', 'frozen')
                          }}
                          className="rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-red-700 transition hover:bg-red-100"
                        >
                          Take down
                        </button>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleProjectDecision(project)}
                          disabled={savingProjectId === project.id}
                          className="rounded-2xl bg-green-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0f4d27] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingProjectId === project.id ? 'Saving...' : 'Save Decision'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

export default AdminReportsPage
