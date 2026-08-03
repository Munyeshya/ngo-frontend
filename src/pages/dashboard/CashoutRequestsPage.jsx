import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Eye,
  Search,
  XCircle,
} from 'lucide-react'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import { useToast } from '../../components/feedback/ToastProvider'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { getUser } from '../../utils/storage'

const PAGE_SIZE = 7

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.results)) return payload.results
  if (Array.isArray(payload?.data?.results)) return payload.data.results
  return []
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}

function formatDate(value) {
  if (!value) return 'Not reviewed'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function statusClass(status) {
  if (status === 'approved') return 'bg-green-100 text-green-800'
  if (status === 'rejected') return 'bg-red-100 text-red-700'
  return 'bg-amber-100 text-amber-800'
}

function extractError(error, fallback) {
  const data = error?.response?.data
  const validation = data?.review_note || data?.status || data?.amount || data?.project
  if (Array.isArray(validation)) return validation[0]
  if (typeof validation === 'string') return validation
  return data?.message || data?.detail || fallback
}

function CashoutRequestsPage() {
  const { showToast } = useToast()
  const isAdmin = String(getUser()?.role || '').toLowerCase() === 'admin'
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [reviewNote, setReviewNote] = useState('')
  const [reviewing, setReviewing] = useState(false)

  async function loadRequests() {
    try {
      setLoading(true)
      setError('')
      const response = await api.get(endpoints.projectCashouts)
      const list = normalizeList(response.data)
      setRequests(list)
      setSelected((current) =>
        current ? list.find((item) => item.id === current.id) || null : null
      )
    } catch (requestError) {
      const message = extractError(requestError, 'Failed to load cashout requests.')
      setError(message)
      showToast({ type: 'error', message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

  const counts = useMemo(
    () => ({
      all: requests.length,
      pending: requests.filter((item) => item.status === 'pending').length,
      approved: requests.filter((item) => item.status === 'approved').length,
      rejected: requests.filter((item) => item.status === 'rejected').length,
    }),
    [requests]
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return requests.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false
      if (!query) return true
      return [item.project_title, item.requested_by_username, item.purpose]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    })
  }, [requests, search, statusFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const visibleRequests = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  function openRequest(item) {
    setSelected(item)
    setReviewNote(item.review_note || '')
  }

  async function reviewRequest(decision) {
    if (!selected || reviewing) return
    if (decision === 'rejected' && !reviewNote.trim()) {
      showToast({ type: 'error', message: 'Add a rejection reason before denying the request.' })
      return
    }

    try {
      setReviewing(true)
      const response = await api.patch(endpoints.projectCashoutReview(selected.id), {
        status: decision,
        review_note: reviewNote.trim(),
      })
      const updated = response?.data?.data || response?.data
      setRequests((current) =>
        current.map((item) => (item.id === selected.id ? updated : item))
      )
      setSelected(updated)
      showToast({
        type: 'success',
        message: response?.data?.message || `Cashout request ${decision}.`,
      })
    } catch (reviewError) {
      showToast({
        type: 'error',
        message: extractError(reviewError, 'Failed to review this cashout request.'),
      })
    } finally {
      setReviewing(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Cashout Requests</h1>
        <p className="mt-1 text-sm text-gray-500">
          {isAdmin
            ? 'Review staff requests before project funds are recorded as spent.'
            : 'Track submitted requests and admin decisions across your projects.'}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['All requests', counts.all, CircleDollarSign, 'bg-gray-100 text-gray-700'],
          ['Pending', counts.pending, Clock3, 'bg-amber-100 text-amber-800'],
          ['Approved', counts.approved, CheckCircle2, 'bg-green-100 text-green-800'],
          ['Rejected', counts.rejected, XCircle, 'bg-red-100 text-red-700'],
        ].map(([label, value, Icon, tone]) => (
          <Card key={label} className="p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                  {label}
                </p>
                <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
              </div>
              <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${tone}`}>
                <Icon size={15} />
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search project, staff, or purpose"
              className="h-9 w-full rounded-lg border border-gray-200 pl-9 pr-3 text-xs outline-none focus:border-green-700"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs outline-none focus:border-green-700"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <p className="py-10 text-center text-xs text-gray-500">Loading cashout requests...</p>
        ) : error ? (
          <p className="py-10 text-center text-xs text-red-600">{error}</p>
        ) : visibleRequests.length === 0 ? (
          <p className="py-10 text-center text-xs text-gray-500">No matching cashout requests.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-[10px] uppercase tracking-[0.06em] text-gray-500">
                  <th className="px-2 py-2.5 font-semibold">Project</th>
                  <th className="px-2 py-2.5 font-semibold">Requested by</th>
                  <th className="px-2 py-2.5 font-semibold">Amount</th>
                  <th className="px-2 py-2.5 font-semibold">Submitted</th>
                  <th className="px-2 py-2.5 font-semibold">Status</th>
                  <th className="px-2 py-2.5 text-right font-semibold">Details</th>
                </tr>
              </thead>
              <tbody>
                {visibleRequests.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 last:border-0">
                    <td className="px-2 py-3 font-semibold text-gray-900">{item.project_title}</td>
                    <td className="px-2 py-3 text-gray-600">{item.requested_by_username || 'Staff'}</td>
                    <td className="px-2 py-3 font-semibold text-gray-900">{formatCurrency(item.amount)}</td>
                    <td className="px-2 py-3 text-gray-500">{formatDate(item.created_at)}</td>
                    <td className="px-2 py-3">
                      <span className={`rounded-full px-2 py-1 text-[10px] font-semibold capitalize ${statusClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openRequest(item)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-green-800"
                      >
                        <Eye size={13} /> Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
          <p className="text-[10px] text-gray-500">Page {currentPage} of {pageCount}</p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
              className="inline-flex h-8 w-8 items-center justify-center text-gray-600 disabled:opacity-30"
              aria-label="Previous cashout requests page"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              type="button"
              onClick={() => setPage(Math.min(pageCount, currentPage + 1))}
              disabled={currentPage >= pageCount}
              className="inline-flex h-8 w-8 items-center justify-center text-gray-600 disabled:opacity-30"
              aria-label="Next cashout requests page"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </Card>

      {selected ? (
        <Card className="p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                Request #{selected.id}
              </p>
              <h2 className="mt-1 text-base font-bold text-gray-900">{selected.project_title}</h2>
              <p className="mt-1 text-xs text-gray-500">
                {formatCurrency(selected.amount)} requested by {selected.requested_by_username || 'Staff'}
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${statusClass(selected.status)}`}>
              {selected.status}
            </span>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-3 text-xs">
              <div className="bg-[#F8F8F6] p-3">
                <p className="text-[10px] text-gray-500">Purpose</p>
                <p className="mt-1 leading-5 text-gray-700">{selected.purpose}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#F8F8F6] p-3">
                  <p className="text-[10px] text-gray-500">Submitted</p>
                  <p className="mt-1 font-semibold text-gray-800">{formatDate(selected.created_at)}</p>
                </div>
                <div className="bg-[#F8F8F6] p-3">
                  <p className="text-[10px] text-gray-500">Reviewed</p>
                  <p className="mt-1 font-semibold text-gray-800">{formatDate(selected.reviewed_at)}</p>
                </div>
              </div>
              {selected.review_note ? (
                <div className="bg-[#F8F8F6] p-3">
                  <p className="text-[10px] text-gray-500">Admin note</p>
                  <p className="mt-1 leading-5 text-gray-700">{selected.review_note}</p>
                </div>
              ) : null}
            </div>

            <div>
              <p className="text-[11px] font-semibold text-gray-800">Expense lines</p>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-gray-200 text-[9px] uppercase text-gray-500">
                      <th className="py-2 font-semibold">Item</th>
                      <th className="py-2 font-semibold">Description</th>
                      <th className="py-2 text-right font-semibold">Qty</th>
                      <th className="py-2 text-right font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selected.items || []).map((item) => (
                      <tr key={item.id || item.item_name} className="border-b border-gray-100">
                        <td className="py-2 font-medium text-gray-800">{item.item_name}</td>
                        <td className="py-2 text-gray-500">{item.description || '-'}</td>
                        <td className="py-2 text-right text-gray-600">{item.quantity}</td>
                        <td className="py-2 text-right font-semibold text-gray-800">{formatCurrency(item.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {isAdmin && selected.status === 'pending' ? (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-medium text-gray-700">
                  Admin review note
                </span>
                <textarea
                  rows="3"
                  value={reviewNote}
                  onChange={(event) => setReviewNote(event.target.value)}
                  placeholder="Optional for approval; required when rejecting"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs outline-none focus:border-green-700"
                />
              </label>
              <div className="mt-3 flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => reviewRequest('rejected')}
                  disabled={reviewing}
                  className="px-3 py-2 text-xs"
                >
                  <XCircle size={14} className="mr-1.5" /> Reject
                </Button>
                <Button
                  type="button"
                  onClick={() => reviewRequest('approved')}
                  disabled={reviewing}
                  className="px-3 py-2 text-xs"
                >
                  <CheckCircle2 size={14} className="mr-1.5" />
                  {reviewing ? 'Reviewing...' : 'Approve Request'}
                </Button>
              </div>
            </div>
          ) : null}
        </Card>
      ) : null}
    </div>
  )
}

export default CashoutRequestsPage
