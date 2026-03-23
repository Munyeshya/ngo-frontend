import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Search,
  Trash2,
  FolderHeart,
} from 'lucide-react'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'

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

  return []
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
  return (
    item?.project_title ||
    item?.project_name ||
    item?.project?.title ||
    item?.title ||
    'Subscribed Project'
  )
}

function getProjectId(item) {
  return item?.project?.id || item?.project_id || item?.project || item?.id || null
}

function getProjectDescription(item) {
  return (
    item?.project?.description ||
    item?.description ||
    item?.project_description ||
    'Stay informed with the latest updates about this project.'
  )
}

function getProjectLocation(item) {
  return item?.project?.location || item?.location || item?.project_location || 'Location not specified'
}

function getProjectImage(item) {
  return (
    item?.project?.feature_image ||
    item?.feature_image ||
    item?.project_image ||
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1400&q=80'
  )
}

function DonorSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [removingId, setRemovingId] = useState(null)
  const [actionMessage, setActionMessage] = useState('')

  useEffect(() => {
    let active = true

    async function loadSubscriptions() {
      try {
        setLoading(true)
        setError('')

        const response = await api.get(endpoints.myInterests)

        if (!active) return
        setSubscriptions(normalizeListResponse(response.data))
      } catch (err) {
        if (!active) return

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            'Failed to load your subscriptions.'
        )
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadSubscriptions()

    return () => {
      active = false
    }
  }, [])

  const filteredSubscriptions = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return subscriptions

    return subscriptions.filter((item) => {
      const title = getProjectName(item).toLowerCase()
      const description = String(getProjectDescription(item)).toLowerCase()
      const location = String(getProjectLocation(item)).toLowerCase()

      return (
        title.includes(query) ||
        description.includes(query) ||
        location.includes(query)
      )
    })
  }, [subscriptions, search])

  async function handleUnsubscribe(item) {
    const projectId = getProjectId(item)
    if (!projectId) return

    try {
      setRemovingId(item.id || projectId)
      setActionMessage('')

      await api.post(endpoints.unsubscribeFromProject, {
        project: projectId,
      })

      setSubscriptions((prev) =>
        prev.filter((entry) => (entry.id || getProjectId(entry)) !== (item.id || projectId))
      )

      setActionMessage('Subscription removed successfully.')
    } catch (err) {
      setActionMessage(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          'Failed to unsubscribe from project.'
      )
    } finally {
      setRemovingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 sm:p-8">
          <p className="text-2xl font-bold text-gray-900">Loading subscriptions...</p>
          <p className="mt-2 text-sm text-gray-500">
            We are preparing the projects you follow.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[28px] border border-red-200 bg-white p-6 sm:p-8">
        <p className="text-2xl font-bold text-gray-900">Unable to load subscriptions</p>
        <p className="mt-3 text-sm leading-7 text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-[#166534]">My Subscriptions</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              Followed Projects
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500">
              Manage the projects you follow and stay informed about progress, milestones,
              and impact updates.
            </p>
          </div>

          <Link
            to="/projects"
            className="inline-flex items-center justify-center rounded-2xl bg-[#166534] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0F4D27]"
          >
            Explore Projects
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[26px] border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-green-100 p-3 text-[#166534]">
              <Bell size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Current</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Active Subscriptions</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{subscriptions.length}</p>
        </div>

        <div className="rounded-[26px] border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-emerald-100 p-3 text-[#166534]">
              <FolderHeart size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Visible</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Filtered Results</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{filteredSubscriptions.length}</p>
        </div>

        <div className="rounded-[26px] border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="rounded-2xl bg-lime-100 p-3 text-[#166534]">
              <CalendarDays size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Tracking</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Update Monitoring</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">On</p>
        </div>
      </section>

      <section className="rounded-[28px] border border-gray-200 bg-white p-6 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Project Subscriptions</h3>
            <p className="mt-1 text-sm text-gray-500">
              Search and manage all the projects you currently follow.
            </p>
          </div>

          <div className="relative w-full lg:max-w-[360px]">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subscribed projects"
              className="h-12 w-full rounded-2xl border border-gray-300 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
            />
          </div>
        </div>

        {actionMessage && (
          <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {actionMessage}
          </div>
        )}

        {filteredSubscriptions.length === 0 ? (
          <div className="mt-8 rounded-[24px] bg-[#F6F8F4] p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#166534] shadow-sm">
              <Bell size={24} />
            </div>
            <p className="mt-4 text-lg font-semibold text-gray-900">No subscriptions found</p>
            <p className="mt-2 text-sm leading-7 text-gray-500">
              You are not following any projects yet, or no results match your search.
            </p>
            <Link
              to="/projects"
              className="mt-5 inline-flex items-center justify-center rounded-2xl bg-[#166534] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0F4D27]"
            >
              Browse Projects
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredSubscriptions.map((item) => {
              const projectId = getProjectId(item)
              const itemKey = item.id || projectId || getProjectName(item)
              const busy = removingId === itemKey

              return (
                <div
                  key={itemKey}
                  className="overflow-hidden rounded-[26px] border border-gray-200 bg-white shadow-sm"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={getProjectImage(item)}
                      alt={getProjectName(item)}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    <div className="absolute left-4 top-4">
                      <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#166534] shadow-sm">
                        Subscribed
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-lg font-bold text-white">{getProjectName(item)}</p>
                      <p className="mt-1 text-xs text-white/80">
                        {getProjectLocation(item)}
                      </p>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="line-clamp-3 text-sm leading-7 text-gray-600">
                      {getProjectDescription(item)}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                      <CalendarDays size={14} />
                      <span>Subscribed on {formatDate(item?.created_at)}</span>
                    </div>

                    <div className="mt-5 flex gap-3">
                      {projectId ? (
                        <Link
                          to={`/projects/${projectId}`}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#166534] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0F4D27]"
                        >
                          View Project
                          <ArrowRight size={15} />
                        </Link>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="inline-flex flex-1 items-center justify-center rounded-2xl bg-gray-200 px-4 py-3 text-sm font-semibold text-gray-500"
                        >
                          Project unavailable
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleUnsubscribe(item)}
                        disabled={busy}
                        className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {busy ? 'Removing...' : <Trash2 size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export default DonorSubscriptionsPage