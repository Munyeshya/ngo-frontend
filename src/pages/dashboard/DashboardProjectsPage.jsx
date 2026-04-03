import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  Pencil,
  FolderKanban,
  Plus,
  MapPin,
  Search,
  SlidersHorizontal,
  Target,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { getUser } from '../../utils/storage'

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

const projectStatuses = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
]

function DashboardProjectsPage() {
  const currentUser = getUser()
  const [projects, setProjects] = useState([])
  const [partners, setPartners] = useState([])
  const [projectsCount, setProjectsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('latest')
  const [partnerSearch, setPartnerSearch] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'planning',
    budget: '',
    target_amount: '',
    start_date: '',
    end_date: '',
    location: '',
    feature_image: null,
    partner_ids: [],
  })

  useEffect(() => {
    let active = true

    async function loadProjects() {
      try {
        setLoading(true)
        setError('')

        const [projectsResponse, partnersResponse] = await Promise.allSettled([
          api.get(endpoints.projects),
          api.get(endpoints.partners),
        ])
        if (!active) return

        if (projectsResponse.status === 'fulfilled') {
          const list = normalizeListResponse(projectsResponse.value.data)
          setProjects(list)
          setProjectsCount(getCountFromResponse(projectsResponse.value.data, list))
        } else {
          throw projectsResponse.reason
        }

        if (partnersResponse.status === 'fulfilled') {
          setPartners(normalizeListResponse(partnersResponse.value.data))
        } else {
          setPartners([])
        }
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

  const canManageProjects = useMemo(() => {
    const role = String(currentUser?.role || '').toLowerCase()
    return role === 'admin' || role === 'staff'
  }, [currentUser])

  function resetForm() {
    setFormData({
      title: '',
      description: '',
      status: 'planning',
      budget: '',
      target_amount: '',
      start_date: '',
      end_date: '',
      location: '',
      feature_image: null,
      partner_ids: [],
    })
    setPartnerSearch('')
    setEditingProject(null)
    setActionError('')
  }

  function openCreateForm() {
    resetForm()
    setShowForm(true)
  }

  function openEditForm(project) {
    setEditingProject(project)
    setActionError('')
    setActionSuccess('')
    setFormData({
      title: project?.title || '',
      description: project?.description || '',
      status: project?.status || 'planning',
      budget: project?.budget || '',
      target_amount: project?.target_amount || '',
      start_date: project?.start_date || '',
      end_date: project?.end_date || '',
      location: project?.location || '',
      feature_image: null,
      partner_ids: Array.isArray(project?.partners)
        ? project.partners.map((partner) => partner.id)
        : [],
    })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    resetForm()
  }

  function handleFieldChange(event) {
    const { name, value, files } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'feature_image' ? files?.[0] || null : value,
    }))
  }

  function togglePartnerSelection(partnerId) {
    setFormData((prev) => ({
      ...prev,
      partner_ids: prev.partner_ids.includes(partnerId)
        ? prev.partner_ids.filter((id) => id !== partnerId)
        : [...prev.partner_ids, partnerId],
    }))
  }

  async function refreshProjects() {
    const response = await api.get(endpoints.projects)
    const list = normalizeListResponse(response.data)
    setProjects(list)
    setProjectsCount(getCountFromResponse(response.data, list))
  }

  async function handleSubmitProject(event) {
    event.preventDefault()
    setActionError('')
    setActionSuccess('')

    try {
      setSubmitting(true)

      const payload = new FormData()
      payload.append('title', formData.title.trim())
      payload.append('description', formData.description.trim())
      payload.append('status', formData.status)
      payload.append('budget', formData.budget)
      payload.append('target_amount', formData.target_amount)
      payload.append('start_date', formData.start_date)

      if (formData.end_date) payload.append('end_date', formData.end_date)
      if (formData.location.trim()) payload.append('location', formData.location.trim())
      if (formData.feature_image) payload.append('feature_image', formData.feature_image)
      formData.partner_ids.forEach((partnerId) => payload.append('partner_ids', partnerId))

      if (editingProject?.id) {
        await api.patch(endpoints.projectDetails(editingProject.id), payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        setActionSuccess('Project updated successfully.')
      } else {
        await api.post(endpoints.projects, payload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        setActionSuccess('Project created successfully.')
      }

      await refreshProjects()
      closeForm()
    } catch (err) {
      const data = err?.response?.data
      const flattened =
        data && typeof data === 'object'
          ? Object.values(data).flat().find(Boolean)
          : null

      setActionError(
        data?.message ||
          data?.detail ||
          flattened ||
          'Project action failed. Please review your inputs and try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteProject(project) {
    const confirmed = window.confirm(`Delete "${project?.title || 'this project'}"?`)
    if (!confirmed) return

    try {
      setDeletingId(project.id)
      setActionError('')
      setActionSuccess('')
      await api.delete(endpoints.projectDetails(project.id))
      await refreshProjects()
      setActionSuccess('Project deleted successfully.')
    } catch (err) {
      setActionError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          'Failed to delete project.'
      )
    } finally {
      setDeletingId(null)
    }
  }

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

  const filteredPartners = useMemo(() => {
    const query = partnerSearch.trim().toLowerCase()

    if (!query) return partners

    return partners.filter((partner) => {
      const name = String(partner?.name || '').toLowerCase()
      const description = String(partner?.description || '').toLowerCase()
      return name.includes(query) || description.includes(query)
    })
  }, [partnerSearch, partners])

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
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1.5 text-sm text-gray-600">Loading project records...</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="p-4">
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
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1.5 text-sm text-gray-600">Manage and monitor platform projects.</p>
        </div>

        <Card className="border border-red-200 p-5">
          <p className="text-base font-semibold text-gray-900">Unable to load projects</p>
          <p className="mt-2 text-sm leading-7 text-red-600">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1.5 text-sm text-gray-600">
            Review project performance, funding progress, and operational status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center rounded-2xl bg-green-50 px-3.5 py-2 text-xs font-semibold text-green-800">
            <FolderKanban size={16} className="mr-2" />
            Total Records: {projectsCount}
          </div>

          {canManageProjects && (
            <Button className="px-4 py-2.5" onClick={openCreateForm}>
              <Plus size={16} className="mr-2" />
              New Project
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-[24px] p-4">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-green-100 p-3 text-green-800">
              <FolderKanban size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Projects</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">All Projects</p>
          <p className="mt-2 text-[1.7rem] font-bold text-gray-900">{projectsCount}</p>
        </Card>

        <Card className="rounded-[24px] p-4">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-emerald-100 p-3 text-green-800">
              <TrendingUp size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Active</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Active Projects</p>
          <p className="mt-2 text-[1.7rem] font-bold text-gray-900">{stats.activeCount}</p>
        </Card>

        <Card className="rounded-[24px] p-4">
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

        <Card className="rounded-[24px] p-4">
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

      {(actionError || actionSuccess) && (
        <Card className={`p-4 ${actionError ? 'border-red-200' : 'border-green-200'}`}>
          <div
            className={`flex items-start gap-3 text-sm ${
              actionError ? 'text-red-700' : 'text-green-700'
            }`}
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{actionError || actionSuccess}</span>
          </div>
        </Card>
      )}

      <Card className="rounded-[24px] p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Project Directory</h2>
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
          <div className="mt-6 rounded-[24px] bg-[#F8F8F6] p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-green-800 shadow-sm">
              <FolderKanban size={24} />
            </div>
            <p className="mt-4 text-lg font-semibold text-gray-900">No projects found</p>
            <p className="mt-2 text-sm leading-7 text-gray-500">
              Try changing your search or filter settings.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 xl:grid-cols-2">
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

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/projects/${project.id}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#166534] transition hover:text-[#0F4D27]"
                    >
                      View Public Page
                      <ArrowRight size={15} />
                    </Link>

                    {canManageProjects && (
                      <>
                        <button
                          type="button"
                          onClick={() => openEditForm(project)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-green-300 hover:text-green-800"
                        >
                          <Pencil size={13} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteProject(project)}
                          disabled={deletingId === project.id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <Trash2 size={13} />
                          {deletingId === project.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {showForm && canManageProjects && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6">
          <Card className="max-h-[88vh] w-full max-w-[68rem] overflow-hidden rounded-[24px] border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-3.5">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {editingProject ? 'Edit Project' : 'Create Project'}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Manage the project details that donors and staff will work with.
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

            <form onSubmit={handleSubmitProject} className="overflow-y-auto px-6 py-4.5">
              <div className="grid gap-4 lg:grid-cols-[1fr_0.92fr]">
                <div className="space-y-3.5">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleFieldChange}
                      required
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
                      rows="5"
                      required
                      className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleFieldChange}
                        className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                      >
                        {projectStatuses.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-gray-700">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleFieldChange}
                        className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-gray-700">
                        Budget
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="budget"
                        value={formData.budget}
                        onChange={handleFieldChange}
                        required
                        className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-gray-700">
                        Target Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="target_amount"
                        value={formData.target_amount}
                        onChange={handleFieldChange}
                        required
                        className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-gray-700">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleFieldChange}
                        required
                        className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-gray-700">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleFieldChange}
                        className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="rounded-[20px] border border-gray-200 bg-[#F8F8F6] p-3.5">
                    <label className="mb-1.5 block text-[11px] font-medium text-gray-700">
                      Feature Image
                    </label>
                    <input
                      type="file"
                      name="feature_image"
                      accept="image/*"
                      onChange={handleFieldChange}
                      className="block w-full text-xs text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-semibold file:text-gray-800"
                    />
                    {editingProject?.feature_image && !formData.feature_image && (
                      <p className="mt-2 text-xs text-gray-500">
                        Leave empty to keep the current image.
                      </p>
                    )}
                  </div>

                  <div className="rounded-[20px] border border-gray-200 bg-[#F8F8F6] p-3.5">
                    <p className="text-[11px] font-medium text-gray-700">
                      Partners
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Select any partners linked to this project.
                    </p>

                    <div className="relative mt-3">
                      <Search
                        size={15}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        value={partnerSearch}
                        onChange={(event) => setPartnerSearch(event.target.value)}
                        placeholder="Search partners"
                        className="h-10 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                      />
                    </div>

                    <div className="mt-3 max-h-[220px] space-y-2 overflow-y-auto pr-1">
                      {partners.length === 0 ? (
                        <p className="text-sm text-gray-500">No partners available.</p>
                      ) : filteredPartners.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          No partners match your search.
                        </p>
                      ) : (
                        filteredPartners.map((partner) => (
                          <label
                            key={partner.id}
                            className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700"
                          >
                            <input
                              type="checkbox"
                              checked={formData.partner_ids.includes(partner.id)}
                              onChange={() => togglePartnerSelection(partner.id)}
                              className="mt-1 h-4 w-4 rounded border-gray-300 text-[#166534] focus:ring-green-700"
                            />
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{partner.name}</p>
                            </div>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {actionError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                  {actionError}
                </div>
              )}

              <div className="mt-5 flex flex-wrap justify-end gap-2.5">
                <Button type="button" variant="outline" onClick={closeForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting
                    ? editingProject
                      ? 'Saving...'
                      : 'Creating...'
                    : editingProject
                    ? 'Save Changes'
                    : 'Create Project'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
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
