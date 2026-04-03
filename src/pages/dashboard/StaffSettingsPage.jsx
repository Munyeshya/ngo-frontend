import { useEffect, useMemo, useState } from 'react'
import { FileBadge2, Save, ShieldAlert, Upload } from 'lucide-react'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import DocumentPreviewModal from '../../components/common/DocumentPreviewModal'
import Card from '../../components/ui/Card'
import { getUser, setUser } from '../../utils/storage'

const STATUS_LABELS = {
  draft: 'Draft',
  under_review: 'Under Review',
  changes_requested: 'Changes Requested',
  approved: 'Approved',
  rejected: 'Rejected',
}

const REASON_LABELS = {
  missing_document: 'Missing required document',
  unclear_scan: 'Document is unclear or unreadable',
  expired_document: 'Document appears expired',
  information_mismatch: 'Details do not match the application',
  unauthorized_representative: 'Representative proof is insufficient',
  other: 'Other',
}

function fileNameFromUrl(value) {
  if (!value) return ''
  return String(value).split('/').pop()
}

function statusTone(status) {
  if (status === 'approved') return 'bg-green-100 text-green-800'
  if (status === 'changes_requested') return 'bg-amber-100 text-amber-800'
  if (status === 'rejected') return 'bg-red-100 text-red-700'
  if (status === 'under_review') return 'bg-sky-100 text-sky-700'
  return 'bg-[#F3F5F0] text-gray-700'
}

function inputClassName() {
  return 'h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100'
}

function fileInputClassName() {
  return 'block w-full text-sm text-gray-600 file:mr-3 file:rounded-xl file:border-0 file:bg-[#F3F5F0] file:px-3 file:py-2 file:text-[11px] file:font-semibold'
}

function StaffSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [application, setApplication] = useState(null)
  const [previewDocument, setPreviewDocument] = useState(null)
  const [form, setForm] = useState({
    applicant_type: 'individual',
    mission_summary: '',
    location: '',
    organization_name: '',
    registration_number: '',
    representative_name: '',
    representative_id_number: '',
    individual_id_number: '',
    individual_id_document: null,
    group_legal_document: null,
    representative_id_document: null,
  })

  useEffect(() => {
    let active = true

    async function loadApplication() {
      try {
        setLoading(true)
        setError('')
        const response = await api.get(endpoints.myStaffApplication)
        if (!active) return
        const data = response?.data?.data || response?.data
        setApplication(data)
        setForm((current) => ({
          ...current,
          applicant_type: data?.applicant_type || 'individual',
          mission_summary: data?.mission_summary || '',
          location: data?.location || '',
          organization_name: data?.organization_name || '',
          registration_number: data?.registration_number || '',
          representative_name: data?.representative_name || '',
          representative_id_number: data?.representative_id_number || '',
          individual_id_number: data?.individual_id_number || '',
        }))

        const storedUser = getUser()
        if (storedUser) {
          setUser({
            ...storedUser,
            staff_application_status: data?.status || null,
          })
        }
      } catch (err) {
        if (!active) return
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.detail ||
            err?.message ||
            'Failed to load staff settings.'
        )
      } finally {
        if (active) setLoading(false)
      }
    }

    loadApplication()
    return () => {
      active = false
    }
  }, [])

  const documentItems = useMemo(() => {
    if (!application) return []

    if (form.applicant_type === 'individual') {
      return [
        {
          label: 'Individual ID document',
          status: application.individual_id_status,
          reason: application.individual_id_reason,
          fileName: fileNameFromUrl(application.individual_id_document),
        },
      ]
    }

    return [
      {
        label: 'Group legal document',
        status: application.group_legal_document_status,
        reason: application.group_legal_document_reason,
        fileName: fileNameFromUrl(application.group_legal_document),
      },
      {
        label: 'Representative ID document',
        status: application.representative_id_status,
        reason: application.representative_id_reason,
        fileName: fileNameFromUrl(application.representative_id_document),
      },
    ]
  }, [application, form.applicant_type])

  function handleChange(event) {
    const { name, value, files } = event.target
    setForm((current) => ({
      ...current,
      [name]: files ? files[0] : value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const payload = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          payload.append(key, value)
        }
      })

      const response = await api.patch(endpoints.myStaffApplication, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const data = response?.data?.data || response?.data
      setApplication(data)
      setSuccess('Staff verification details saved successfully.')

      const storedUser = getUser()
      if (storedUser) {
        setUser({
          ...storedUser,
          staff_application_status: data?.status || null,
        })
      }

      setForm((current) => ({
        ...current,
        individual_id_document: null,
        group_legal_document: null,
        representative_id_document: null,
      }))
    } catch (err) {
      const payload = err?.response?.data
      const details =
        payload?.errors ||
        payload?.data ||
        payload?.message ||
        payload?.detail ||
        'Failed to save staff verification details.'
      setError(typeof details === 'string' ? details : JSON.stringify(details))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Staff Settings</h1>
          <p className="mt-1 text-sm text-gray-600">Loading verification details...</p>
        </div>
        <Card className="p-4">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          <div className="mt-4 h-24 animate-pulse rounded-2xl bg-gray-100" />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Staff Settings</h1>
          <p className="mt-1 text-sm text-gray-600">
            Submit verification documents and track your approval status.
          </p>
        </div>
        <div className={`inline-flex items-center rounded-2xl px-3 py-2 text-[11px] font-semibold ${statusTone(application?.status)}`}>
          <FileBadge2 size={15} className="mr-2" />
          {STATUS_LABELS[application?.status] || 'Draft'}
        </div>
      </div>

      {(error || success) && (
        <Card className={`p-4 ${error ? 'border-red-200' : 'border-green-200'}`}>
          <p className={`text-sm ${error ? 'text-red-700' : 'text-green-700'}`}>
            {error || success}
          </p>
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-[22px] p-4">
          <div className="rounded-[18px] bg-[#F8F8F6] p-3.5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Application Overview</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Complete the required details below, then submit your documents for admin review.
                </p>
              </div>
              <div className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusTone(application?.status)}`}>
                {STATUS_LABELS[application?.status] || 'Draft'}
              </div>
            </div>
          </div>

          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div className="rounded-[20px] border border-gray-200 bg-white p-4">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-gray-900">Applicant Details</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Tell us who is applying and where the work is based.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-gray-700">Applicant Type</span>
                  <select
                    name="applicant_type"
                    value={form.applicant_type}
                    onChange={handleChange}
                    className={inputClassName()}
                  >
                    <option value="individual">Individual</option>
                    <option value="group">Group / Organization</option>
                  </select>
                </label>

                <label className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-gray-700">Location</span>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className={inputClassName()}
                  />
                </label>
              </div>

              <label className="mt-4 block space-y-1.5">
                <span className="text-[11px] font-semibold text-gray-700">Mission Summary</span>
                <textarea
                  rows="4"
                  name="mission_summary"
                  value={form.mission_summary}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                />
              </label>
            </div>

            {form.applicant_type === 'individual' ? (
              <div className="rounded-[20px] border border-gray-200 bg-white p-4">
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-gray-900">Individual Verification</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Upload the national ID information required for individual applicants.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-gray-700">National ID Number</span>
                    <input
                      type="text"
                      name="individual_id_number"
                      value={form.individual_id_number}
                      onChange={handleChange}
                      className={inputClassName()}
                    />
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-gray-700">ID Document</span>
                    <input
                      type="file"
                      name="individual_id_document"
                      onChange={handleChange}
                      className={fileInputClassName()}
                    />
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] text-gray-500">
                        Current file: {fileNameFromUrl(application?.individual_id_document) || 'None yet'}
                      </p>
                      {application?.individual_id_document ? (
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
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-[20px] border border-gray-200 bg-white p-4">
                  <div className="mb-3">
                    <h3 className="text-sm font-bold text-gray-900">Group Details</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Add the organization and representative details tied to this application.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-gray-700">Organization / Group Name</span>
                      <input
                        type="text"
                        name="organization_name"
                        value={form.organization_name}
                        onChange={handleChange}
                        className={inputClassName()}
                      />
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-gray-700">Registration Number</span>
                      <input
                        type="text"
                        name="registration_number"
                        value={form.registration_number}
                        onChange={handleChange}
                        className={inputClassName()}
                      />
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-gray-700">Representative Name</span>
                      <input
                        type="text"
                        name="representative_name"
                        value={form.representative_name}
                        onChange={handleChange}
                        className={inputClassName()}
                      />
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-gray-700">Representative ID Number</span>
                      <input
                        type="text"
                        name="representative_id_number"
                        value={form.representative_id_number}
                        onChange={handleChange}
                        className={inputClassName()}
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-[20px] border border-gray-200 bg-white p-4">
                  <div className="mb-3">
                    <h3 className="text-sm font-bold text-gray-900">Required Documents</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Upload the legal and representative files needed for review.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-gray-700">Legal Document</span>
                      <input
                        type="file"
                        name="group_legal_document"
                        onChange={handleChange}
                        className={fileInputClassName()}
                      />
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] text-gray-500">
                          Current file: {fileNameFromUrl(application?.group_legal_document) || 'None yet'}
                        </p>
                        {application?.group_legal_document ? (
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
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-gray-700">Representative ID Document</span>
                      <input
                        type="file"
                        name="representative_id_document"
                        onChange={handleChange}
                        className={fileInputClassName()}
                      />
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] text-gray-500">
                          Current file: {fileNameFromUrl(application?.representative_id_document) || 'None yet'}
                        </p>
                        {application?.representative_id_document ? (
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
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-green-800 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0f4d27] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? <Upload size={14} /> : <Save size={14} />}
                {saving ? 'Saving...' : 'Save & Submit'}
              </button>
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-[22px] p-4">
            <h2 className="text-sm font-bold text-gray-900">Progress</h2>
            <div className="mt-3 grid gap-3">
              <div className="rounded-2xl bg-[#F8F8F6] p-3">
                <p className="text-[10px] uppercase tracking-[0.08em] text-gray-500">Applicant Type</p>
                <p className="mt-1 text-sm font-semibold capitalize text-gray-900">
                  {form.applicant_type === 'group' ? 'Group / Organization' : 'Individual'}
                </p>
              </div>
              <div className="rounded-2xl bg-[#F8F8F6] p-3">
                <p className="text-[10px] uppercase tracking-[0.08em] text-gray-500">Review Status</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {STATUS_LABELS[application?.status] || 'Draft'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="rounded-[22px] p-4">
            <h2 className="text-sm font-bold text-gray-900">Review Notes</h2>
            {application?.admin_message ? (
              <p className="mt-3 text-sm leading-6 text-gray-700">{application.admin_message}</p>
            ) : (
              <p className="mt-3 text-xs text-gray-500">
                No admin note has been added yet.
              </p>
            )}
          </Card>

          <Card className="rounded-[22px] p-4">
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} className="text-green-800" />
              <h2 className="text-sm font-bold text-gray-900">Document Status</h2>
            </div>

            <div className="mt-4 space-y-3">
              {documentItems.map((item) => (
                <div key={item.label} className="rounded-2xl border border-gray-200 bg-[#FCFCFB] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[12px] font-semibold text-gray-900">{item.label}</p>
                      <p className="mt-1 text-[10px] text-gray-500">{item.fileName || 'No file uploaded yet'}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusTone(item.status)}`}>
                      {STATUS_LABELS[item.status] || item.status}
                    </span>
                  </div>
                  {item.reason ? (
                    <p className="mt-2 text-[10px] text-amber-700">
                      {REASON_LABELS[item.reason] || item.reason}
                    </p>
                  ) : null}
                </div>
              ))}
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

export default StaffSettingsPage
