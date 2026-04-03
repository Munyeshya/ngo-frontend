import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowLeft, ShieldAlert } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

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

function AdminReportDetailsPage() {
  const { projectId } = useParams()
  const [project, setProject] = useState(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [saving, setSaving] = useState(false)
  const [review, setReview] = useState({
    moderation_status: 'under_review',
    funding_status: 'open',
    moderation_note: '',
  })

  async function loadData() {
    const [projectResponse, reportsResponse] = await Promise.all([
      api.get(endpoints.projectDetails(projectId)),
      api.get(endpoints.projectReports, { params: { project: projectId } }),
    ])

    const projectData = projectResponse?.data?.data || projectResponse?.data
    const reportsData = normalizeListResponse(reportsResponse.data)

    setProject(projectData)
    setReports(reportsData)
    setReview({
      moderation_status: projectData?.moderation_status || 'under_review',
      funding_status: projectData?.funding_status || 'open',
      moderation_note: projectData?.moderation_note || '',
    })
  }

  useEffect(() => {
    let active = true

    async function initialize() {
      try {
        setLoading(true)
        setError('')
        const [projectResponse, reportsResponse] = await Promise.all([
          api.get(endpoints.projectDetails(projectId)),
          api.get(endpoints.projectReports, { params: { project: projectId } }),
        ])

        if (!active) return

        const projectData = projectResponse?.data?.data || projectResponse?.data
        const reportsData = normalizeListResponse(reportsResponse.data)

        setProject(projectData)
        setReports(reportsData)
        setReview({
          moderation_status: projectData?.moderation_status || 'under_review',
          funding_status: projectData?.funding_status || 'open',
          moderation_note: projectData?.moderation_note || '',
        })
      } catch (err) {
        if (!active) return
        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            'Failed to load the report details.'
        )
      } finally {
        if (active) setLoading(false)
      }
    }

    initialize()
    return () => {
      active = false
    }
  }, [projectId])

  const reasonCounts = useMemo(() => {
    return reports.reduce((acc, report) => {
      const reason = report.reason_type || 'other'
      acc[reason] = (acc[reason] || 0) + 1
      return acc
    }, {})
  }, [reports])

  async function handleSave() {
    try {
      setSaving(true)
      setActionError('')
      setActionSuccess('')
      await api.patch(endpoints.projectDetails(projectId), review)
      await loadData()
      setActionSuccess('Project moderation decision saved successfully.')
    } catch (err) {
      setActionError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          'Failed to save the project decision.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Report Details</h1>
          <p className="mt-1 text-sm text-gray-600">Loading flagged project...</p>
        </div>
        <Card className="p-4">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          <div className="mt-4 h-24 animate-pulse rounded-2xl bg-gray-100" />
        </Card>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Report Details</h1>
          <p className="mt-1 text-sm text-gray-600">Unable to open this flagged project.</p>
        </div>
        <Card className="border border-red-200 p-4">
          <p className="text-sm leading-6 text-red-700">{error || 'Project not found.'}</p>
          <Link
            to="/dashboard/reports"
            className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-green-800"
          >
            <ArrowLeft size={14} />
            Back to Reported Projects
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            to="/dashboard/reports"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-green-800"
          >
            <ArrowLeft size={14} />
            Back to Reported Projects
          </Link>
          <h1 className="mt-2 text-xl font-bold text-gray-900">{project.title}</h1>
          <p className="mt-1 text-sm text-gray-600">
            Review all reported claims and decide whether funding stays open, freezes, or the
            project is taken down.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
      </div>

      {(actionError || actionSuccess) && (
        <Card className={`p-4 ${actionError ? 'border-red-200' : 'border-green-200'}`}>
          <p className={`text-sm ${actionError ? 'text-red-700' : 'text-green-700'}`}>
            {actionError || actionSuccess}
          </p>
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <Card className="rounded-[22px] p-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl bg-[#F8F8F6] px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.08em] text-gray-500">Reports</p>
                <p className="mt-1 text-sm font-bold text-gray-900">{reports.length}</p>
              </div>
              <div className="rounded-2xl bg-[#F8F8F6] px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.08em] text-gray-500">Raised</p>
                <p className="mt-1 text-sm font-bold text-gray-900">
                  {formatCurrency(project.total_donated)}
                </p>
              </div>
              <div className="rounded-2xl bg-[#F8F8F6] px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.08em] text-gray-500">Cashouts</p>
                <p className="mt-1 text-sm font-bold text-gray-900">
                  {formatCurrency(project.total_cashouts)}
                </p>
              </div>
              <div className="rounded-2xl bg-[#F8F8F6] px-3 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.08em] text-gray-500">Balance</p>
                <p className="mt-1 text-sm font-bold text-gray-900">
                  {formatCurrency(project.available_balance)}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-3.5">
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
          </Card>

          <Card className="rounded-[22px] p-4">
            <div className="flex items-center gap-2">
              <ShieldAlert size={15} className="text-amber-700" />
              <h2 className="text-sm font-bold text-gray-900">Reported Claims</h2>
            </div>

            <div className="mt-4 space-y-3">
              {reports.length === 0 ? (
                <div className="rounded-2xl bg-[#F8F8F6] p-4 text-xs text-gray-600">
                  No open reports were found for this project.
                </div>
              ) : (
                reports.map((report) => (
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
                ))
              )}
            </div>
          </Card>
        </div>

        <Card className="rounded-[22px] p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-700" />
            <h2 className="text-sm font-bold text-gray-900">Moderation Decision</h2>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-[11px] font-semibold text-gray-700">Project status</span>
              <select
                value={review.moderation_status}
                onChange={(event) =>
                  setReview((current) => ({
                    ...current,
                    moderation_status: event.target.value,
                  }))
                }
                className="h-9 w-full rounded-xl border border-gray-300 bg-white px-3 text-[11px] outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
              >
                <option value="clear">Clear</option>
                <option value="under_review">Under review</option>
                <option value="taken_down">Taken down</option>
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-[11px] font-semibold text-gray-700">Funding status</span>
              <select
                value={review.funding_status}
                onChange={(event) =>
                  setReview((current) => ({
                    ...current,
                    funding_status: event.target.value,
                  }))
                }
                className="h-9 w-full rounded-xl border border-gray-300 bg-white px-3 text-[11px] outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
              >
                <option value="open">Open</option>
                <option value="frozen">Frozen</option>
              </select>
            </label>
          </div>

          <label className="mt-3 block space-y-1.5">
            <span className="text-[11px] font-semibold text-gray-700">Admin note</span>
            <textarea
              rows="6"
              value={review.moderation_note}
              onChange={(event) =>
                setReview((current) => ({
                  ...current,
                  moderation_note: event.target.value,
                }))
              }
              placeholder="Add a short moderation note or instructions."
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
            />
          </label>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setReview((current) => ({
                  ...current,
                  moderation_status: 'clear',
                  funding_status: 'open',
                }))
              }
              className="rounded-full bg-green-50 px-3 py-1.5 text-[11px] font-semibold text-green-800 transition hover:bg-green-100"
            >
              Clear & keep open
            </button>
            <button
              type="button"
              onClick={() =>
                setReview((current) => ({
                  ...current,
                  moderation_status: 'under_review',
                  funding_status: 'frozen',
                }))
              }
              className="rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-800 transition hover:bg-amber-100"
            >
              Freeze cashout
            </button>
            <button
              type="button"
              onClick={() =>
                setReview((current) => ({
                  ...current,
                  moderation_status: 'taken_down',
                  funding_status: 'frozen',
                }))
              }
              className="rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-red-700 transition hover:bg-red-100"
            >
              Take down
            </button>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-2xl bg-green-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0f4d27] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Decision'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AdminReportDetailsPage
