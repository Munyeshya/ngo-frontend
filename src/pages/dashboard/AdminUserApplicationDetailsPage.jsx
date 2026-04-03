import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, FileBadge2, ShieldCheck } from 'lucide-react'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import DocumentPreviewModal from '../../components/common/DocumentPreviewModal'
import { useToast } from '../../components/feedback/ToastProvider'
import Card from '../../components/ui/Card'

const REVIEW_REASON_OPTIONS = [
  { value: '', label: 'No reason selected' },
  { value: 'missing_document', label: 'Missing required document' },
  { value: 'unclear_scan', label: 'Document is unclear or unreadable' },
  { value: 'expired_document', label: 'Document appears expired' },
  { value: 'information_mismatch', label: 'Details do not match the application' },
  { value: 'unauthorized_representative', label: 'Representative proof is insufficient' },
  { value: 'other', label: 'Other' },
]

function fileNameFromUrl(value) {
  if (!value) return 'No file uploaded'
  return String(value).split('/').pop()
}

function getDisplayName(user) {
  return (
    user?.full_name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() ||
    user?.username ||
    user?.email ||
    'User'
  )
}

function getStatusTone(status) {
  if (status === 'approved') return 'bg-green-100 text-green-800'
  if (status === 'changes_requested') return 'bg-amber-100 text-amber-800'
  if (status === 'rejected') return 'bg-red-100 text-red-700'
  if (status === 'under_review') return 'bg-sky-100 text-sky-700'
  return 'bg-[#F3F5F0] text-gray-700'
}

function createReviewState(application) {
  return {
    status: application?.status || 'under_review',
    individual_id_status: application?.individual_id_status || 'not_required',
    group_legal_document_status: application?.group_legal_document_status || 'not_required',
    representative_id_status: application?.representative_id_status || 'not_required',
    individual_id_reason: application?.individual_id_reason || '',
    group_legal_document_reason: application?.group_legal_document_reason || '',
    representative_id_reason: application?.representative_id_reason || '',
    admin_message: application?.admin_message || '',
  }
}

function AdminUserApplicationDetailsPage() {
  const { applicationId } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [application, setApplication] = useState(null)
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [previewDocument, setPreviewDocument] = useState(null)

  useEffect(() => {
    let active = true

    async function loadApplication() {
      try {
        setLoading(true)
        setError('')
        const response = await api.get(endpoints.staffApplicationDetails(applicationId))
        if (!active) return
        setApplication(response.data)
        setReview(createReviewState(response.data))
      } catch (err) {
        if (!active) return
        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            'Unable to load this application.'
        )
      } finally {
        if (active) setLoading(false)
      }
    }

    loadApplication()

    return () => {
      active = false
    }
  }, [applicationId])

  const user = application?.user
  const isIndividual = application?.applicant_type === 'individual'
  const issueCount = useMemo(() => {
    if (!application) return 0

    return [
      application.individual_id_reason,
      application.group_legal_document_reason,
      application.representative_id_reason,
    ].filter(Boolean).length
  }, [application])

  function handleReviewChange(field, value) {
    setReview((current) => ({
      ...(current || {}),
      [field]: value,
    }))
  }

  async function handleSubmit(nextStatus) {
    try {
      setSaving(true)
      await api.patch(endpoints.staffApplicationDetails(applicationId), {
        ...review,
        status: nextStatus,
      })
      showToast({ type: 'success', message: 'Staff application reviewed successfully.' })
      navigate('/dashboard/users', { replace: true })
    } catch (err) {
      showToast({
        type: 'error',
        message:
          err?.response?.data?.message ||
          err?.response?.data?.detail ||
          JSON.stringify(err?.response?.data?.errors || err?.response?.data?.data || {}) ||
          'Failed to review staff application.',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Staff Application</h1>
          <p className="mt-1 text-sm text-gray-600">Loading application details...</p>
        </div>
      </div>
    )
  }

  if (error || !application || !review) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Staff Application</h1>
          <p className="mt-1 text-sm text-gray-600">Review staff verification details.</p>
        </div>

        <Card className="border border-red-200 p-4">
          <p className="text-sm font-semibold text-gray-900">Unable to load application</p>
          <p className="mt-2 text-sm leading-6 text-red-600">{error || 'Application not found.'}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/dashboard/users"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 transition hover:text-gray-700"
          >
            <ArrowLeft size={13} />
            Back to staff applications
          </Link>
          <h1 className="mt-2 text-xl font-bold text-gray-900">{getDisplayName(user)}</h1>
          <p className="mt-1 text-sm text-gray-600">
            Review documents, capture issues, and make the final application decision.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusTone(application.status)}`}>
            {String(application.status || '').replace(/_/g, ' ')}
          </span>
          <span className="rounded-full bg-[#F3F5F0] px-2.5 py-1 text-[10px] font-semibold capitalize text-gray-700">
            {application.applicant_type}
          </span>
          <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-700">
            {issueCount} complaint{issueCount === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <Card className="rounded-[22px] p-4">
            <h2 className="text-sm font-bold text-gray-900">Applicant Summary</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#F8F8F6] p-3">
                <p className="text-[10px] uppercase tracking-[0.08em] text-gray-500">Email</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {user?.email || user?.username || 'No email'}
                </p>
              </div>
              <div className="rounded-2xl bg-[#F8F8F6] p-3">
                <p className="text-[10px] uppercase tracking-[0.08em] text-gray-500">Location</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {application.location || 'No location provided'}
                </p>
              </div>
            </div>
            <div className="mt-3 rounded-2xl bg-[#F8F8F6] p-3">
              <p className="text-[10px] uppercase tracking-[0.08em] text-gray-500">Mission summary</p>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {application.mission_summary || 'No mission summary provided.'}
              </p>
            </div>
          </Card>

          <Card className="rounded-[22px] p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Document Review</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Review each required file before approving the application.
                </p>
              </div>
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-green-100 text-green-800">
                <FileBadge2 size={15} />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {isIndividual ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-3">
                  <p className="text-[11px] font-semibold text-gray-900">Individual ID document</p>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <p className="text-[10px] text-gray-500">
                      {fileNameFromUrl(application.individual_id_document)}
                    </p>
                    {application.individual_id_document ? (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewDocument({
                            title: 'Individual ID document',
                            fileUrl: application.individual_id_document,
                          })
                        }
                        className="text-[10px] font-semibold text-green-800 hover:text-green-900"
                      >
                        Preview
                      </button>
                    ) : null}
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <select
                      value={review.individual_id_status}
                      onChange={(event) => handleReviewChange('individual_id_status', event.target.value)}
                      className="h-9 rounded-xl border border-gray-300 bg-white px-3 text-[11px] outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approve document</option>
                      <option value="rejected">Reject document</option>
                    </select>
                    <select
                      value={review.individual_id_reason}
                      onChange={(event) => handleReviewChange('individual_id_reason', event.target.value)}
                      className="h-9 rounded-xl border border-gray-300 bg-white px-3 text-[11px] outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                    >
                      {REVIEW_REASON_OPTIONS.map((option) => (
                        <option key={option.value || 'none'} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <>
                  <div className="rounded-2xl border border-gray-200 bg-white p-3">
                    <p className="text-[11px] font-semibold text-gray-900">Group legal document</p>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <p className="text-[10px] text-gray-500">
                        {fileNameFromUrl(application.group_legal_document)}
                      </p>
                      {application.group_legal_document ? (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewDocument({
                              title: 'Group legal document',
                              fileUrl: application.group_legal_document,
                            })
                          }
                          className="text-[10px] font-semibold text-green-800 hover:text-green-900"
                        >
                          Preview
                        </button>
                      ) : null}
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <select
                        value={review.group_legal_document_status}
                        onChange={(event) => handleReviewChange('group_legal_document_status', event.target.value)}
                        className="h-9 rounded-xl border border-gray-300 bg-white px-3 text-[11px] outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approve document</option>
                        <option value="rejected">Reject document</option>
                      </select>
                      <select
                        value={review.group_legal_document_reason}
                        onChange={(event) => handleReviewChange('group_legal_document_reason', event.target.value)}
                        className="h-9 rounded-xl border border-gray-300 bg-white px-3 text-[11px] outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                      >
                        {REVIEW_REASON_OPTIONS.map((option) => (
                          <option key={option.value || 'none'} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-3">
                    <p className="text-[11px] font-semibold text-gray-900">Representative ID document</p>
                    <div className="mt-1 flex items-center justify-between gap-3">
                      <p className="text-[10px] text-gray-500">
                        {fileNameFromUrl(application.representative_id_document)}
                      </p>
                      {application.representative_id_document ? (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewDocument({
                              title: 'Representative ID document',
                              fileUrl: application.representative_id_document,
                            })
                          }
                          className="text-[10px] font-semibold text-green-800 hover:text-green-900"
                        >
                          Preview
                        </button>
                      ) : null}
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <select
                        value={review.representative_id_status}
                        onChange={(event) => handleReviewChange('representative_id_status', event.target.value)}
                        className="h-9 rounded-xl border border-gray-300 bg-white px-3 text-[11px] outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approve document</option>
                        <option value="rejected">Reject document</option>
                      </select>
                      <select
                        value={review.representative_id_reason}
                        onChange={(event) => handleReviewChange('representative_id_reason', event.target.value)}
                        className="h-9 rounded-xl border border-gray-300 bg-white px-3 text-[11px] outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                      >
                        {REVIEW_REASON_OPTIONS.map((option) => (
                          <option key={option.value || 'none'} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-[22px] p-4">
            <h2 className="text-sm font-bold text-gray-900">Admin Review</h2>
            <p className="mt-1 text-xs text-gray-500">
              Add a clear message if the applicant needs to correct anything before approval.
            </p>

            <label className="mt-4 block space-y-1.5">
              <span className="text-[11px] font-semibold text-gray-700">Admin message</span>
              <textarea
                rows="7"
                value={review.admin_message}
                onChange={(event) => handleReviewChange('admin_message', event.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                placeholder="Add extra requirements or explain what needs to change."
              />
            </label>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => handleSubmit('approved')}
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-green-800 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-[#0f4d27] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ShieldCheck size={12} />
                {saving ? 'Saving...' : 'Approve application'}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('changes_requested')}
                disabled={saving}
                className="w-full rounded-xl bg-amber-100 px-3 py-2 text-[11px] font-semibold text-amber-800 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Request changes
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('rejected')}
                disabled={saving}
                className="w-full rounded-xl bg-red-100 px-3 py-2 text-[11px] font-semibold text-red-700 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Reject application
              </button>
            </div>
          </Card>
        </div>
      </div>

      <DocumentPreviewModal
        open={Boolean(previewDocument?.fileUrl)}
        title={previewDocument?.title}
        fileUrl={previewDocument?.fileUrl}
        onClose={() => setPreviewDocument(null)}
      />
    </div>
  )
}

export default AdminUserApplicationDetailsPage
