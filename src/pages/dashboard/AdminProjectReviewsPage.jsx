import { useDeferredValue, useEffect, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Eye, Search, X } from 'lucide-react'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import { useToast } from '../../components/feedback/ToastProvider'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'

const STATUS_OPTIONS = [
  { value: 'pending_review', label: 'Pending review' },
  { value: 'changes_requested', label: 'Changes requested' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

function unwrapPage(payload) {
  const page = payload?.data || payload || {}
  return {
    count: Number(page.count || 0),
    next: page.next || null,
    previous: page.previous || null,
    results: Array.isArray(page.results) ? page.results : [],
  }
}

function statusTone(status) {
  if (status === 'approved') return 'bg-green-100 text-green-800'
  if (status === 'changes_requested') return 'bg-amber-100 text-amber-800'
  if (status === 'rejected') return 'bg-red-100 text-red-700'
  return 'bg-sky-100 text-sky-700'
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function AdminProjectReviewsPage() {
  const { showToast } = useToast()
  const [projects, setProjects] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [statusFilter, setStatusFilter] = useState('pending_review')
  const [selectedProject, setSelectedProject] = useState(null)
  const [approvalNote, setApprovalNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadProjects() {
      try {
        setLoading(true)
        setError('')
        const params = { page }
        if (statusFilter !== 'all') params.approval_status = statusFilter
        if (deferredSearch.trim()) params.search = deferredSearch.trim()

        const response = await api.get(endpoints.projects, { params })
        if (!active) return

        const projectPage = unwrapPage(response.data)
        setProjects(projectPage.results)
        setCount(projectPage.count)
        setHasNext(Boolean(projectPage.next))
        setHasPrevious(Boolean(projectPage.previous))
      } catch (err) {
        if (!active) return
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.detail ||
            'Project reviews could not be loaded.'
        )
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProjects()
    return () => {
      active = false
    }
  }, [deferredSearch, page, statusFilter])

  function openReview(project) {
    setSelectedProject(project)
    setApprovalNote(project.approval_note || '')
  }

  async function saveDecision(approvalStatus) {
    if (approvalStatus !== 'approved' && !approvalNote.trim()) {
      showToast({ type: 'error', message: 'Add a short reason for this decision.' })
      return
    }

    try {
      setSaving(true)
      await api.patch(endpoints.projectDetails(selectedProject.id), {
        approval_status: approvalStatus,
        approval_note: approvalNote.trim(),
      })

      setProjects((current) =>
        statusFilter === 'all' || statusFilter === approvalStatus
          ? current.map((project) =>
              project.id === selectedProject.id
                ? { ...project, approval_status: approvalStatus, approval_note: approvalNote.trim() }
                : project
            )
          : current.filter((project) => project.id !== selectedProject.id)
      )
      if (statusFilter !== 'all' && statusFilter !== approvalStatus) {
        setCount((current) => Math.max(0, current - 1))
      }
      setSelectedProject(null)
      showToast({ type: 'success', message: 'Project review decision saved.' })
    } catch (err) {
      showToast({
        type: 'error',
        message:
          err?.response?.data?.message ||
          err?.response?.data?.detail ||
          'The project decision could not be saved.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Project Reviews</h1>
        <p className="mt-1 text-xs text-gray-500">
          Review submissions without changing staff-owned project content.
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Search projects"
              className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-green-700"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value)
              setPage(1)
            }}
            className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs outline-none focus:border-green-700"
          >
            <option value="all">All approval states</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 divide-y divide-gray-100">
          {loading ? <p className="py-8 text-center text-xs text-gray-500">Loading projects...</p> : null}
          {!loading && error ? <p className="py-8 text-center text-xs text-red-600">{error}</p> : null}
          {!loading && !error && projects.length === 0 ? (
            <p className="py-8 text-center text-xs text-gray-500">No projects match this review queue.</p>
          ) : null}

          {!loading && !error
            ? projects.map((project) => (
                <div key={project.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-gray-900">{project.title}</p>
                      <span className={`rounded-full px-2 py-1 text-[9px] font-semibold ${statusTone(project.approval_status)}`}>
                        {String(project.approval_status || 'pending_review').replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-gray-500">
                      By {project.created_by || 'Unknown staff'} · {project.location || 'No location'} · {formatCurrency(project.target_amount)} target
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openReview(project)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-800 hover:text-green-950"
                  >
                    <Eye size={14} /> Review
                  </button>
                </div>
              ))
            : null}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-[11px] text-gray-500">
          <span>{count} project{count === 1 ? '' : 's'}</span>
          <div className="flex items-center gap-3">
            <button type="button" disabled={!hasPrevious} onClick={() => setPage((current) => Math.max(1, current - 1))} className="disabled:opacity-30">
              <ChevronLeft size={16} />
            </button>
            <span>Page {page}</span>
            <button type="button" disabled={!hasNext} onClick={() => setPage((current) => current + 1)} className="disabled:opacity-30">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </Card>

      {selectedProject ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
          <Card className="max-h-[88vh] w-full max-w-2xl overflow-y-auto p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-green-700">Project review</p>
                <h2 className="mt-1 text-lg font-bold text-gray-900">{selectedProject.title}</h2>
                <p className="mt-1 text-xs text-gray-500">Submitted by {selectedProject.created_by || 'Unknown staff'}</p>
              </div>
              <button type="button" onClick={() => setSelectedProject(null)} className="text-gray-500 hover:text-gray-900">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="bg-gray-50 p-3 text-xs"><span className="text-gray-500">Type</span><p className="mt-1 font-semibold text-gray-900">{selectedProject.project_type_display || selectedProject.project_type}</p></div>
              <div className="bg-gray-50 p-3 text-xs"><span className="text-gray-500">Budget</span><p className="mt-1 font-semibold text-gray-900">{formatCurrency(selectedProject.budget)}</p></div>
              <div className="bg-gray-50 p-3 text-xs"><span className="text-gray-500">Target</span><p className="mt-1 font-semibold text-gray-900">{formatCurrency(selectedProject.target_amount)}</p></div>
            </div>

            <p className="mt-4 whitespace-pre-wrap text-xs leading-6 text-gray-600">{selectedProject.description}</p>

            <label className="mt-4 block">
              <span className="text-[11px] font-semibold text-gray-700">Review note</span>
              <textarea
                value={approvalNote}
                onChange={(event) => setApprovalNote(event.target.value)}
                rows={3}
                placeholder="Explain requested changes or rejection reasons"
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2 text-xs leading-5 outline-none focus:border-green-700"
              />
            </label>

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <Button variant="danger" className="px-3 py-2 text-xs" disabled={saving} onClick={() => saveDecision('rejected')}>
                <X size={14} className="mr-1.5" /> Reject
              </Button>
              <Button variant="secondary" className="px-3 py-2 text-xs" disabled={saving} onClick={() => saveDecision('changes_requested')}>
                Request changes
              </Button>
              <Button className="px-3 py-2 text-xs" disabled={saving} onClick={() => saveDecision('approved')}>
                <Check size={14} className="mr-1.5" /> Approve
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

export default AdminProjectReviewsPage
