import { useEffect, useMemo, useState } from 'react'
import {
  ExternalLink,
  Handshake,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import { useToast } from '../../components/feedback/ToastProvider'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

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

function AdminPartnersPage() {
  const { showToast } = useToast()
  const [partners, setPartners] = useState([])
  const [partnersCount, setPartnersCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingPartner, setEditingPartner] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    description: '',
    is_active: true,
    logo: null,
  })

  useEffect(() => {
    let active = true

    async function loadPartners() {
      try {
        setLoading(true)
        setError('')
        const response = await api.get(endpoints.partners)
        if (!active) return
        const list = normalizeListResponse(response.data)
        setPartners(list)
        setPartnersCount(getCountFromResponse(response.data, list))
      } catch (err) {
        if (!active) return
        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            'Failed to load partners.'
        )
      } finally {
        if (active) setLoading(false)
      }
    }

    loadPartners()

    return () => {
      active = false
    }
  }, [])

  async function refreshPartners() {
    const response = await api.get(endpoints.partners)
    const list = normalizeListResponse(response.data)
    setPartners(list)
    setPartnersCount(getCountFromResponse(response.data, list))
  }

  function resetForm() {
    setFormData({
      name: '',
      website: '',
      description: '',
      is_active: true,
      logo: null,
    })
    setEditingPartner(null)
  }

  function openCreateForm() {
    resetForm()
    setShowForm(true)
  }

  function openEditForm(partner) {
    setEditingPartner(partner)
    setFormData({
      name: partner?.name || '',
      website: partner?.website || '',
      description: partner?.description || '',
      is_active: Boolean(partner?.is_active),
      logo: null,
    })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    resetForm()
  }

  function handleFieldChange(event) {
    const { name, value, type, checked, files } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'logo'
          ? files?.[0] || null
          : type === 'checkbox'
          ? checked
          : value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setSubmitting(true)
      const payload = new FormData()
      payload.append('name', formData.name.trim())
      payload.append('website', formData.website.trim())
      payload.append('description', formData.description.trim())
      payload.append('is_active', String(formData.is_active))
      if (formData.logo) payload.append('logo', formData.logo)

      if (editingPartner?.id) {
        await api.patch(endpoints.partnerDetails(editingPartner.id), payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        showToast({ type: 'success', message: 'Partner updated successfully.' })
      } else {
        await api.post(endpoints.partners, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        showToast({ type: 'success', message: 'Partner added successfully.' })
      }

      await refreshPartners()
      closeForm()
    } catch (err) {
      const data = err?.response?.data
      const flattened =
        data && typeof data === 'object'
          ? Object.values(data).flat().find(Boolean)
          : null

      showToast({
        type: 'error',
        message:
          data?.message ||
          data?.detail ||
          flattened ||
          'Partner action failed. Please review the form and try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(partner) {
    const confirmed = window.confirm(`Delete "${partner?.name || 'this partner'}"?`)
    if (!confirmed) return

    try {
      setDeletingId(partner.id)
      await api.delete(endpoints.partnerDetails(partner.id))
      await refreshPartners()
      showToast({ type: 'success', message: 'Partner deleted successfully.' })
    } catch (err) {
      showToast({
        type: 'error',
        message:
          err?.response?.data?.message ||
          err?.response?.data?.detail ||
          'Failed to delete partner.',
      })
    } finally {
      setDeletingId(null)
    }
  }

  const filteredPartners = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return partners

    return partners.filter((partner) => {
      const name = String(partner?.name || '').toLowerCase()
      const website = String(partner?.website || '').toLowerCase()
      const description = String(partner?.description || '').toLowerCase()
      return (
        name.includes(query) || website.includes(query) || description.includes(query)
      )
    })
  }, [partners, search])

  const activePartners = useMemo(
    () => partners.filter((partner) => partner?.is_active).length,
    [partners]
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Partners</h1>
          <p className="mt-1 text-sm text-gray-600">Loading partner records...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Partners</h1>
          <p className="mt-1 text-sm text-gray-600">Manage oversight partner records.</p>
        </div>

        <Card className="border border-red-200 p-4">
          <p className="text-sm font-semibold text-gray-900">Unable to load partners</p>
          <p className="mt-2 text-sm leading-6 text-red-600">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Partners</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage the organizations that can be attached to staff projects.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center rounded-2xl bg-green-50 px-3 py-2 text-[11px] font-semibold text-green-800">
            <Handshake size={15} className="mr-2" />
            Active: {activePartners} / {partnersCount}
          </div>

          <Button className="px-4 py-2.5 text-sm" onClick={openCreateForm}>
            <Plus size={15} className="mr-2" />
            New Partner
          </Button>
        </div>
      </div>

      <Card className="rounded-[24px] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Partner Directory</h2>
            <p className="mt-1 text-xs text-gray-500">
              Search, update, and control partner availability for project assignment.
            </p>
          </div>

          <div className="relative lg:w-[320px]">
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search partners"
              className="h-10 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
            />
          </div>
        </div>

        {filteredPartners.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-[#F8F8F6] p-4 text-sm text-gray-600">
            No partners match the current search.
          </div>
        ) : (
          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {filteredPartners.map((partner) => (
              <div
                key={partner.id}
                className="rounded-[22px] border border-gray-200 bg-[#FCFCFB] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {partner?.name || 'Unnamed partner'}
                    </p>
                    <p className="mt-1 text-[11px] text-gray-500">
                      {partner?.is_active ? 'Active partner' : 'Inactive partner'}
                    </p>
                  </div>

                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      partner?.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {partner?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="mt-3 line-clamp-3 text-xs leading-6 text-gray-600">
                  {partner?.description || 'No partner description provided.'}
                </p>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 text-xs text-gray-500">
                    {partner?.website ? (
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 font-medium text-[#166534] hover:text-[#0f4d27]"
                      >
                        Visit website
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      'No website added'
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditForm(partner)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-[11px] font-semibold text-gray-700 transition hover:border-green-300 hover:text-green-800"
                    >
                      <Pencil size={12} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(partner)}
                      disabled={deletingId === partner.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-[11px] font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 size={12} />
                      {deletingId === partner.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6">
          <Card className="w-full max-w-2xl overflow-hidden rounded-[24px] border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {editingPartner ? 'Edit Partner' : 'Add Partner'}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Manage partner details visible when staff create projects.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-50"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFieldChange}
                  required
                  className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-gray-700">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleFieldChange}
                  className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFieldChange}
                  rows="4"
                  className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-gray-700">
                    Logo
                  </label>
                  <input
                    type="file"
                    name="logo"
                    accept="image/*"
                    onChange={handleFieldChange}
                    className="block w-full text-xs text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-[#F3F5F0] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-gray-800"
                  />
                </div>

                <label className="inline-flex items-center gap-2 rounded-xl bg-[#F8F8F6] px-3 py-2.5 text-xs font-medium text-gray-700">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleFieldChange}
                    className="h-4 w-4 rounded border-gray-300 text-[#166534] focus:ring-green-700"
                  />
                  Active
                </label>
              </div>

              <div className="flex flex-wrap justify-end gap-2.5">
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? editingPartner
                      ? 'Saving...'
                      : 'Creating...'
                    : editingPartner
                    ? 'Save Changes'
                    : 'Add Partner'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}

export default AdminPartnersPage
