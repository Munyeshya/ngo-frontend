import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  HeartHandshake,
  Image as ImageIcon,
  MapPin,
  Search,
  SlidersHorizontal,
  Users,
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

function getBeneficiaryImages(item) {
  if (Array.isArray(item?.images)) return item.images
  if (Array.isArray(item?.beneficiary_images)) return item.beneficiary_images
  return []
}

function getProjectName(item) {
  return item?.project?.title || item?.project_title || 'Project'
}

function getProjectId(item) {
  return item?.project?.id || item?.project_id || item?.project || null
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

function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState([])
  const [beneficiariesCount, setBeneficiariesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('latest')

  useEffect(() => {
    let active = true

    async function loadBeneficiaries() {
      try {
        setLoading(true)
        setError('')

        const response = await api.get(endpoints.beneficiaries)
        if (!active) return

        const list = normalizeListResponse(response.data)
        setBeneficiaries(list)
        setBeneficiariesCount(getCountFromResponse(response.data, list))
      } catch (err) {
        if (!active) return

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            'Failed to load beneficiaries.'
        )
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadBeneficiaries()

    return () => {
      active = false
    }
  }, [])

  const filteredBeneficiaries = useMemo(() => {
    let items = [...beneficiaries]

    if (search.trim()) {
      const query = search.trim().toLowerCase()

      items = items.filter((item) => {
        const name = String(item?.name || '').toLowerCase()
        const description = String(item?.description || '').toLowerCase()
        const projectName = String(getProjectName(item) || '').toLowerCase()

        return (
          name.includes(query) ||
          description.includes(query) ||
          projectName.includes(query)
        )
      })
    }

    items.sort((a, b) => {
      if (sortBy === 'latest') {
        return new Date(b?.created_at || 0) - new Date(a?.created_at || 0)
      }

      if (sortBy === 'oldest') {
        return new Date(a?.created_at || 0) - new Date(b?.created_at || 0)
      }

      if (sortBy === 'name-asc') {
        return String(a?.name || '').localeCompare(String(b?.name || ''))
      }

      if (sortBy === 'name-desc') {
        return String(b?.name || '').localeCompare(String(a?.name || ''))
      }

      if (sortBy === 'most-images') {
        return getBeneficiaryImages(b).length - getBeneficiaryImages(a).length
      }

      return 0
    })

    return items
  }, [beneficiaries, search, sortBy])

  const stats = useMemo(() => {
    const withImages = beneficiaries.filter(
      (item) => getBeneficiaryImages(item).length > 0
    ).length

    const linkedProjects = new Set(
      beneficiaries.map((item) => getProjectId(item)).filter(Boolean)
    ).size

    const totalImages = beneficiaries.reduce(
      (sum, item) => sum + getBeneficiaryImages(item).length,
      0
    )

    return {
      withImages,
      linkedProjects,
      totalImages,
    }
  }, [beneficiaries])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Beneficiaries</h1>
          <p className="mt-2 text-gray-600">Loading beneficiary records...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Beneficiaries</h1>
          <p className="mt-2 text-gray-600">Manage and review beneficiary records.</p>
        </div>

        <Card className="border border-red-200 p-6">
          <p className="text-lg font-semibold text-gray-900">Unable to load beneficiaries</p>
          <p className="mt-2 text-sm leading-7 text-red-600">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Beneficiaries</h1>
          <p className="mt-2 text-gray-600">
            Review beneficiary stories, linked projects, and supporting media.
          </p>
        </div>

        <div className="inline-flex items-center rounded-2xl bg-green-50 px-4 py-2 text-sm font-medium text-green-800">
          <Users size={16} className="mr-2" />
          Total Records: {beneficiariesCount}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-[24px] p-5">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-green-100 p-3 text-green-800">
              <Users size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Records</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">All Beneficiaries</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{beneficiariesCount}</p>
        </Card>

        <Card className="rounded-[24px] p-5">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-emerald-100 p-3 text-green-800">
              <ImageIcon size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Media</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">With Images</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.withImages}</p>
        </Card>

        <Card className="rounded-[24px] p-5">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-lime-100 p-3 text-green-800">
              <HeartHandshake size={20} />
            </div>
            <span className="text-xs font-medium text-gray-400">Projects</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Linked Projects</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.linkedProjects}</p>
        </Card>

        <Card className="rounded-[24px] p-5">
          <div className="flex items-start justify-between">
            <div className="rounded-2xl bg-green-100 p-3 text-green-800">
              <ImageIcon size={20} />
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
            <h2 className="text-xl font-bold text-gray-900">Beneficiary Directory</h2>
            <p className="mt-1 text-sm text-gray-500">
              Search and review beneficiary records linked to projects.
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
                placeholder="Search by name, description, project"
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
                <option value="name-asc">Name A - Z</option>
                <option value="name-desc">Name Z - A</option>
                <option value="most-images">Most images</option>
              </select>
            </div>
          </div>
        </div>

        {filteredBeneficiaries.length === 0 ? (
          <div className="mt-8 rounded-[24px] bg-[#F8F8F6] p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-green-800 shadow-sm">
              <Users size={24} />
            </div>
            <p className="mt-4 text-lg font-semibold text-gray-900">No beneficiaries found</p>
            <p className="mt-2 text-sm leading-7 text-gray-500">
              Try changing your search or sorting options.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 xl:grid-cols-2">
            {filteredBeneficiaries.map((beneficiary) => {
              const images = getBeneficiaryImages(beneficiary)
              const projectId = getProjectId(beneficiary)

              return (
                <div
                  key={beneficiary.id}
                  className="rounded-[24px] border border-gray-200 bg-[#FCFCFB] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-bold text-gray-900">
                        {beneficiary?.name || 'Unnamed beneficiary'}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <HeartHandshake size={15} />
                          <span>{getProjectName(beneficiary)}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <ImageIcon size={15} />
                          <span>{images.length} image{images.length === 1 ? '' : 's'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {formatDate(beneficiary?.created_at)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-4 text-sm leading-7 text-gray-600">
                    {beneficiary?.description || 'No beneficiary description available.'}
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
                            alt={image?.caption || beneficiary?.name || 'Beneficiary image'}
                            className="h-24 w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={15} />
                      <span>{getProjectName(beneficiary)}</span>
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

export default BeneficiariesPage