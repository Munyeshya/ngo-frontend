import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  FolderKanban,
  Megaphone,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  Upload,
  X,
} from 'lucide-react'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
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

function getProjectName(item) {
  return item?.project?.title || item?.project_title || 'Project'
}

function getProjectId(item) {
  return item?.project?.id || item?.project_id || item?.project || null
}

function getUpdateImages(item) {
  if (Array.isArray(item?.images)) return item.images
  if (Array.isArray(item?.project_update_images)) return item.project_update_images
  return []
}

function UpdatesPage() {
  const currentUser = getUser()
  const [updates, setUpdates] = useState([])
  const [projects, setProjects] = useState([])
  const [updatesCount, setUpdatesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingUpdate, setEditingUpdate] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [uploadingImageFor, setUploadingImageFor] = useState(null)
  const [deletingImageId, setDeletingImageId] = useState(null)

  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [formData, setFormData] = useState({
    project: '',
    title: '',
    description: '',
  })

  const canManageUpdates = useMemo(() => {
    const role = String(currentUser?.role || '').toLowerCase()
    return role === 'admin' || role === 'staff'
  }, [currentUser])

  useEffect(() => {
    let active = true

    async function loadData() {
      try {
        setLoading(true)
        setError('')

        const [updatesResponse, projectsResponse] = await Promise.allSettled([
          api.get(endpoints.projectUpdates),
          api.get(endpoints.projects),
        ])
        if (!active) return

        if (updatesResponse.status === 'fulfilled') {
          const list = normalizeListResponse(updatesResponse.value.data)
          setUpdates(list)
          setUpdatesCount(getCountFromResponse(updatesResponse.value.data, list))
        } else {
          throw updatesResponse.reason
        }

        if (projectsResponse.status === 'fulfilled') {
          setProjects(normalizeListResponse(projectsResponse.value.data))
        } else {
          setProjects([])
        }
      } catch (err) {
        if (!active) return

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            'Failed to load project updates.'
        )
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [])

  async function refreshUpdates() {
    const response = await api.get(endpoints.projectUpdates)
    const list = normalizeListResponse(response.data)
    setUpdates(list)
    setUpdatesCount(getCountFromResponse(response.data, list))
  }

  function resetForm() {
    setFormData({
      project: '',
      title: '',
      description: '',
    })
    setEditingUpdate(null)
    setActionError('')
  }

  function openCreateForm() {
    resetForm()
    setShowForm(true)
  }

  function openEditForm(update) {
    setEditingUpdate(update)
    setActionError('')
    setActionSuccess('')
    setFormData({
      project: String(getProjectId(update) || ''),
      title: update?.title || '',
      description: update?.description || '',
    })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    resetForm()
  }

  function handleFieldChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSubmitUpdate(event) {
    event.preventDefault()
    setActionError('')
    setActionSuccess('')

    try {
      setSubmitting(true)

      const payload = {
        project: Number(formData.project),
        title: formData.title.trim(),
        description: formData.description.trim(),
      }

      if (editingUpdate?.id) {
        await api.patch(endpoints.projectUpdateDetails(editingUpdate.id), payload)
        setActionSuccess('Project update saved successfully.')
      } else {
        await api.post(endpoints.projectUpdates, payload)
        setActionSuccess('Project update created successfully.')
      }

      await refreshUpdates()
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
          'Update action failed. Please review your inputs and try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteUpdate(update) {
    const confirmed = window.confirm(`Delete "${update?.title || 'this update'}"?`)
    if (!confirmed) return

    try {
      setDeletingId(update.id)
      setActionError('')
      setActionSuccess('')
      await api.delete(endpoints.projectUpdateDetails(update.id))
      await refreshUpdates()
      setActionSuccess('Project update deleted successfully.')
    } catch (err) {
      setActionError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          'Failed to delete project update.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  async function handleUploadImage(updateId, file) {
    if (!file) return

    try {
      setUploadingImageFor(updateId)
      setActionError('')
      setActionSuccess('')

      const payload = new FormData()
      payload.append('project_update', updateId)
      payload.append('image', file)

      await api.post(endpoints.projectUpdateImages, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      await refreshUpdates()
      setActionSuccess('Project update image uploaded successfully.')
    } catch (err) {
      setActionError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          'Failed to upload project update image.'
      )
    } finally {
      setUploadingImageFor(null)
    }
  }

  async function handleDeleteImage(imageId) {
    const confirmed = window.confirm('Remove this project update image?')
    if (!confirmed) return

    try {
      setDeletingImageId(imageId)
      setActionError('')
      setActionSuccess('')
      await api.delete(endpoints.projectUpdateImageDetails(imageId))
      await refreshUpdates()
      setActionSuccess('Project update image deleted successfully.')
    } catch (err) {
      setActionError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          'Failed to delete project update image.'
      )
    } finally {
      setDeletingImageId(null)
    }
  }

  const filteredUpdates = useMemo(() => {
    let items = [...updates]

    if (search.trim()) {
      const query = search.trim().toLowerCase()

      items = items.filter((item) => {
        const title = String(item?.title || '').toLowerCase()
        const description = String(item?.description || '').toLowerCase()
        const projectName = String(getProjectName(item) || '').toLowerCase()

        return (
          title.includes(query) ||
          description.includes(query) ||
          projectName.includes(query)
        )
      })
    }

    items.sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b?.created_at || b?.date || 0) - new Date(a?.created_at || a?.date || 0)
      }

      if (sortBy === 'oldest') {
        return new Date(a?.created_at || a?.date || 0) - new Date(b?.created_at || b?.date || 0)
      }

      if (sortBy === 'title-asc') {
        return String(a?.title || '').localeCompare(String(b?.title || ''))
      }

      if (sortBy === 'title-desc') {
        return String(b?.title || '').localeCompare(String(a?.title || ''))
      }

      if (sortBy === 'most-images') {
        return getUpdateImages(b).length - getUpdateImages(a).length
      }

      return 0
    })

    return items
  }, [updates, search, sortBy])

  const stats = useMemo(() => {
    const linkedProjects = new Set(
      updates.map((item) => getProjectId(item)).filter(Boolean)
    ).size

    const withImages = updates.filter((item) => getUpdateImages(item).length > 0).length

    const totalImages = updates.reduce(
      (sum, item) => sum + getUpdateImages(item).length,
      0
    )

    return {
      linkedProjects,
      withImages,
      totalImages,
    }
  }, [updates])

  if (loading) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Updates</h1>
          <p className="mt-1.5 text-sm text-gray-600">Loading update records...</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Project Updates</h1>
          <p className="mt-1.5 text-sm text-gray-600">Manage progress communications and update records.</p>
        </div>

        <Card className="border border-red-200 p-5">
          <p className="text-base font-semibold text-gray-900">Unable to load updates</p>
          <p className="mt-2 text-sm leading-7 text-red-600">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Updates</h1>
          <p className="mt-1.5 text-sm text-gray-600">
            Review published progress updates across visible projects.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center rounded-2xl bg-green-50 px-3.5 py-2 text-xs font-semibold text-green-800">
            <Megaphone size={16} className="mr-2" />
            Total Records: {updatesCount}
          </div>

          {canManageUpdates && (
            <Button className="px-4 py-2.5" onClick={openCreateForm}>
              <Plus size={16} className="mr-2" />
              New Update
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-[24px] p-4">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-green-100 p-3 text-green-800">
              <Megaphone size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Records</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">All Updates</p>
          <p className="mt-2 text-[1.7rem] font-bold text-gray-900">{updatesCount}</p>
        </Card>

        <Card className="rounded-[24px] p-4">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-emerald-100 p-3 text-green-800">
              <FolderKanban size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Projects</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Linked Projects</p>
          <p className="mt-2 text-[1.7rem] font-bold text-gray-900">{stats.linkedProjects}</p>
        </Card>

        <Card className="rounded-[24px] p-4">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-lime-100 p-3 text-green-800">
              <CalendarDays size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Media</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Updates With Images</p>
          <p className="mt-2 text-[1.7rem] font-bold text-gray-900">{stats.withImages}</p>
        </Card>

        <Card className="rounded-[24px] p-4">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-green-100 p-3 text-green-800">
              <CalendarDays size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Gallery</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Total Images</p>
          <p className="mt-2 text-[1.7rem] font-bold text-gray-900">{stats.totalImages}</p>
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
            <h2 className="text-lg font-bold text-gray-900">Update Directory</h2>
            <p className="mt-1 text-sm text-gray-500">
              Search and review all project updates.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:min-w-[620px]">
            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, description, project"
                className="h-12 w-full rounded-2xl border border-gray-300 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
              />
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
                <option value="title-asc">Title A - Z</option>
                <option value="title-desc">Title Z - A</option>
                <option value="most-images">Most images</option>
              </select>
            </div>
          </div>
        </div>

        {filteredUpdates.length === 0 ? (
          <div className="mt-6 rounded-[24px] bg-[#F8F8F6] p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-green-800 shadow-sm">
              <Megaphone size={24} />
            </div>
            <p className="mt-4 text-lg font-semibold text-gray-900">No updates found</p>
            <p className="mt-2 text-sm leading-7 text-gray-500">
              Try changing your search or sorting options.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {filteredUpdates.map((update) => {
              const images = getUpdateImages(update)
              const projectId = getProjectId(update)

              return (
                <div
                  key={update.id}
                  className="rounded-[24px] border border-gray-200 bg-[#FCFCFB] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-bold text-gray-900">
                        {update?.title || 'Untitled update'}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <FolderKanban size={15} />
                          <span>{getProjectName(update)}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <CalendarDays size={15} />
                          <span>{images.length} image{images.length === 1 ? '' : 's'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {formatDate(update?.created_at || update?.date)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-4 text-sm leading-7 text-gray-600">
                    {update?.description || 'No update description available.'}
                  </p>

                  {images.length > 0 && (
                    <div className="mt-5 grid grid-cols-3 gap-3">
                      {images.slice(0, 3).map((image) => (
                        <div
                          key={image?.id || image?.image}
                          className="group relative overflow-hidden rounded-2xl bg-gray-100"
                        >
                          <img
                            src={image?.image}
                            alt={image?.caption || update?.title || 'Update image'}
                            className="h-24 w-full object-cover"
                          />

                          {canManageUpdates && (
                            <button
                              type="button"
                              onClick={() => handleDeleteImage(image.id)}
                              disabled={deletingImageId === image.id}
                              className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-700 opacity-0 shadow-sm transition group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-100"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-gray-500">
                      Project: <span className="font-medium text-gray-800">{getProjectName(update)}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {projectId ? (
                        <Link
                          to={`/projects/${projectId}`}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#166534] transition hover:text-[#0F4D27]"
                        >
                          View Project
                          <ArrowRight size={15} />
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-400">No project link</span>
                      )}

                      {canManageUpdates && (
                        <>
                          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-green-300 hover:text-green-800">
                            <Upload size={13} />
                            {uploadingImageFor === update.id ? 'Uploading...' : 'Add Image'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) => {
                                handleUploadImage(update.id, event.target.files?.[0])
                                event.target.value = ''
                              }}
                            />
                          </label>

                          <button
                            type="button"
                            onClick={() => openEditForm(update)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-green-300 hover:text-green-800"
                          >
                            <Pencil size={13} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUpdate(update)}
                            disabled={deletingId === update.id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <Trash2 size={13} />
                            {deletingId === update.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {showForm && canManageUpdates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6">
          <Card className="max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-[24px] border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {editingUpdate ? 'Edit Project Update' : 'Create Project Update'}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Share progress clearly and attach images when needed.
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

            <form onSubmit={handleSubmitUpdate} className="overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-gray-700">
                    Project
                  </label>
                  <select
                    name="project"
                    value={formData.project}
                    onChange={handleFieldChange}
                    required
                    className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </div>

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
                    rows="6"
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                  />
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
                    ? editingUpdate
                      ? 'Saving...'
                      : 'Creating...'
                    : editingUpdate
                    ? 'Save Changes'
                    : 'Create Update'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}

export default UpdatesPage
