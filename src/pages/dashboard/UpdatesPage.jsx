import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  FolderKanban,
  Megaphone,
  Search,
  SlidersHorizontal,
} from 'lucide-react'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import Card from '../../components/ui/Card'

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
  const [updates, setUpdates] = useState([])
  const [updatesCount, setUpdatesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('latest')

  useEffect(() => {
    let active = true

    async function loadUpdates() {
      try {
        setLoading(true)
        setError('')

        const response = await api.get(endpoints.projectUpdates)
        if (!active) return

        const list = normalizeListResponse(response.data)
        setUpdates(list)
        setUpdatesCount(getCountFromResponse(response.data, list))
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

    loadUpdates()

    return () => {
      active = false
    }
  }, [])

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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Updates</h1>
          <p className="mt-2 text-gray-600">Loading update records...</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="p-5">
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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Updates</h1>
          <p className="mt-2 text-gray-600">Manage progress communications and update records.</p>
        </div>

        <Card className="border border-red-200 p-6">
          <p className="text-lg font-semibold text-gray-900">Unable to load updates</p>
          <p className="mt-2 text-sm leading-7 text-red-600">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Updates</h1>
          <p className="mt-2 text-gray-600">
            Review published progress updates across all projects.
          </p>
        </div>

        <div className="inline-flex items-center rounded-2xl bg-green-50 px-4 py-2 text-sm font-medium text-green-800">
          <Megaphone size={16} className="mr-2" />
          Total Records: {updatesCount}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-[24px] p-5">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-green-100 p-3 text-green-800">
              <Megaphone size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Records</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">All Updates</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{updatesCount}</p>
        </Card>

        <Card className="rounded-[24px] p-5">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-emerald-100 p-3 text-green-800">
              <FolderKanban size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Projects</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Linked Projects</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.linkedProjects}</p>
        </Card>

        <Card className="rounded-[24px] p-5">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-lime-100 p-3 text-green-800">
              <CalendarDays size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Media</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Updates With Images</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.withImages}</p>
        </Card>

        <Card className="rounded-[24px] p-5">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-green-100 p-3 text-green-800">
              <CalendarDays size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Gallery</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Total Images</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalImages}</p>
        </Card>
      </div>

      <Card className="rounded-[24px] p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Update Directory</h2>
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
          <div className="mt-8 rounded-[24px] bg-[#F8F8F6] p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-green-800 shadow-sm">
              <Megaphone size={24} />
            </div>
            <p className="mt-4 text-lg font-semibold text-gray-900">No updates found</p>
            <p className="mt-2 text-sm leading-7 text-gray-500">
              Try changing your search or sorting options.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 xl:grid-cols-2">
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
                          className="overflow-hidden rounded-2xl bg-gray-100"
                        >
                          <img
                            src={image?.image}
                            alt={image?.caption || update?.title || 'Update image'}
                            className="h-24 w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Project: <span className="font-medium text-gray-800">{getProjectName(update)}</span>
                    </div>

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

export default UpdatesPage