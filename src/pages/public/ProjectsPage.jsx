import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  Search,
  SlidersHorizontal,
  MapPin,
  Users,
  HandCoins,
  HeartPulse,
  GraduationCap,
  Sprout,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import SectionTitle from '../../components/common/SectionTitle'
import AnimatedBackground from '../../components/common/AnimatedBackground'
import LoadingState from '../../components/feedback/LoadingState'
import ErrorState from '../../components/feedback/ErrorState'
import {
  getProjectGoal,
  getProjectImage,
  getProjectProgress,
  getProjectRaised,
  getProjectSlugOrId,
  getProjectStatusLabel,
} from '../../utils/projectHelpers'

const projectCategories = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Paused', value: 'paused' },
]

const orderingOptions = [
  { label: 'Newest', value: '-created_at' },
  { label: 'Start Date', value: 'start_date' },
  { label: 'Budget', value: '-budget' },
  { label: 'Title A-Z', value: 'title' },
]

function inferProjectIcon(project) {
  const text = `${project.title || ''} ${project.description || ''}`.toLowerCase()

  if (text.includes('health') || text.includes('medical')) return HeartPulse
  if (text.includes('school') || text.includes('education') || text.includes('student')) {
    return GraduationCap
  }
  if (text.includes('tree') || text.includes('environment') || text.includes('green')) {
    return Sprout
  }
  if (text.includes('community') || text.includes('women') || text.includes('youth')) {
    return Users
  }

  return HandCoins
}

function normalizeListResponse(data) {
  if (Array.isArray(data)) {
    return {
      results: data,
      count: data.length,
      next: null,
      previous: null,
    }
  }

  if (Array.isArray(data?.results)) {
    return {
      results: data.results,
      count: data.count ?? data.results.length,
      next: data.next ?? null,
      previous: data.previous ?? null,
    }
  }

  if (Array.isArray(data?.data)) {
    return {
      results: data.data,
      count: data.count ?? data.data.length,
      next: data.next ?? null,
      previous: data.previous ?? null,
    }
  }

  if (Array.isArray(data?.data?.results)) {
    return {
      results: data.data.results,
      count: data.data.count ?? data.data.results.length,
      next: data.data.next ?? null,
      previous: data.data.previous ?? null,
    }
  }

  return {
    results: [],
    count: 0,
    next: null,
    previous: null,
  }
}

function buildBeneficiaryCountMap(beneficiaries) {
  const map = {}

  beneficiaries.forEach((beneficiary) => {
    const projectId =
      beneficiary.project?.id ??
      beneficiary.project_id ??
      beneficiary.project

    if (projectId !== undefined && projectId !== null) {
      map[projectId] = (map[projectId] || 0) + 1
    }
  })

  return map
}

function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '')
  const [selectedOrdering, setSelectedOrdering] = useState(
    searchParams.get('ordering') || '-created_at'
  )

  const [projects, setProjects] = useState([])
  const [beneficiaryCountMap, setBeneficiaryCountMap] = useState({})
  const [count, setCount] = useState(0)
  const [nextPage, setNextPage] = useState(null)
  const [prevPage, setPrevPage] = useState(null)
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page') || 1))

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const pageSize = 6

  const queryObject = useMemo(() => {
    const query = {
      page: currentPage,
      ordering: selectedOrdering,
    }

    if (searchTerm.trim()) {
      query.search = searchTerm.trim()
    }

    if (selectedStatus) {
      query.status = selectedStatus
    }

    return query
  }, [searchTerm, selectedStatus, selectedOrdering, currentPage])

  const fetchProjectsAndBeneficiaries = async () => {
    try {
      setLoading(true)
      setError('')

      const [projectsResponse, beneficiariesResponse] = await Promise.all([
        api.get(endpoints.projects, { params: queryObject }),
        api.get(endpoints.beneficiaries),
      ])

      const normalizedProjects = normalizeListResponse(projectsResponse.data)
      const normalizedBeneficiaries = normalizeListResponse(beneficiariesResponse.data)

      const countsMap = buildBeneficiaryCountMap(normalizedBeneficiaries.results)

      setProjects(normalizedProjects.results)
      setCount(normalizedProjects.count)
      setNextPage(normalizedProjects.next)
      setPrevPage(normalizedProjects.previous)
      setBeneficiaryCountMap(countsMap)
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          'Failed to load projects and beneficiaries. Please check your API connection and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjectsAndBeneficiaries()
  }, [queryObject])

  useEffect(() => {
    const params = {}

    if (searchTerm.trim()) params.search = searchTerm.trim()
    if (selectedStatus) params.status = selectedStatus
    if (selectedOrdering) params.ordering = selectedOrdering
    if (currentPage > 1) params.page = String(currentPage)

    setSearchParams(params)
  }, [searchTerm, selectedStatus, selectedOrdering, currentPage, setSearchParams])

  const totalPages = Math.max(1, Math.ceil(count / pageSize))

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const handleStatusClick = (statusValue) => {
    setSelectedStatus(statusValue)
    setCurrentPage(1)
  }

  return (
    <div className="bg-[#F8F8F6]">
      <section className="relative overflow-hidden bg-black">
        <AnimatedBackground variant="dark" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-green-200 backdrop-blur">
                Active causes and transparent support
              </span>

              <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                Discover projects that need support and create visible impact
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
                Explore real NGO projects from the backend, search what matters, filter by status,
                and follow funding progress with live data.
              </p>

              <div className="mt-8 flex flex-wrap gap-6 text-white">
                <div>
                  <p className="text-3xl font-bold text-green-400">{count}+</p>
                  <p className="mt-1 text-sm text-white/70">Projects found</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-400">Live</p>
                  <p className="mt-1 text-sm text-white/70">Backend-connected listing</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-400">Smart</p>
                  <p className="mt-1 text-sm text-white/70">Search, filters, and ordering</p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-3 backdrop-blur">
              <img
                src="https://cdn.prod.website-files.com/6618114bae6895cc12d3dc1d/665f1765f1432b0533fb7524_iStock-1498170916.webp"
                alt="Featured NGO projects"
                className="h-[280px] w-full rounded-[22px] object-cover sm:h-[360px] lg:h-[420px]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-gray-200 bg-white p-4 shadow-[0_20px_60px_rgba(0,0,0,0.08)] sm:p-5">
          <form
            onSubmit={handleSearchSubmit}
            className="grid gap-4 lg:grid-cols-[1.1fr_0.7fr_0.7fr_auto]"
          >
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search projects, descriptions, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-[#F8F8F6] py-3 pl-11 pr-4 outline-none transition focus:border-green-700"
              />
            </div>

            <div className="relative">
              <SlidersHorizontal
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full appearance-none rounded-2xl border border-gray-200 bg-[#F8F8F6] py-3 pl-11 pr-4 outline-none transition focus:border-green-700"
              >
                {projectCategories.map((item) => (
                  <option key={item.label} value={item.value}>
                    {item.label === 'All' ? 'All Statuses' : item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedOrdering}
                onChange={(e) => {
                  setSelectedOrdering(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full appearance-none rounded-2xl border border-gray-200 bg-[#F8F8F6] px-4 py-3 outline-none transition focus:border-green-700"
              >
                {orderingOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    Sort: {item.label}
                  </option>
                ))}
              </select>
            </div>

            <Button variant="primary" className="w-full lg:w-auto">
              Search Projects
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap gap-3">
            {projectCategories.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleStatusClick(item.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedStatus === item.value
                    ? 'bg-green-800 text-white'
                    : 'bg-green-50 text-green-800 hover:bg-green-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionTitle
            badge="Available projects"
            title="Support ongoing initiatives with confidence"
            text="This page uses live backend data, backend search, backend filters, backend ordering, and beneficiary totals computed from the beneficiaries endpoint."
          />

          <div className="rounded-2xl bg-white px-5 py-3 text-sm text-gray-600 shadow-sm">
            Showing <span className="font-semibold text-gray-900">{projects.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{count}</span> project
            {count !== 1 ? 's' : ''}
          </div>
        </div>

        {loading ? (
          <LoadingState text="Loading projects and beneficiaries from backend..." />
        ) : error ? (
          <ErrorState
            title="Unable to load projects"
            message={error}
            onRetry={fetchProjectsAndBeneficiaries}
          />
        ) : projects.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
            <p className="text-2xl font-semibold text-gray-900">No projects found</p>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              The API responded, but no project records were returned for the current filters.
            </p>
          </div>
        ) : (
          <>
            <div className="grid items-stretch gap-7 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => {
                const Icon = inferProjectIcon(project)
                const progress = getProjectProgress(project)
                const statusLabel = getProjectStatusLabel(project)
                const beneficiaryCount = beneficiaryCountMap[project.id] ?? 0
                const projectPath = `/projects/${getProjectSlugOrId(project)}`

                return (
                  <Card
                    key={project.id}
                    className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.10)]"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={getProjectImage(project)}
                        alt={project.title}
                        className="h-60 w-full object-cover transition duration-500 group-hover:scale-105"
                      />

                      <div className="absolute left-4 top-4 flex items-center gap-2">
                        {project.status ? (
                          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 backdrop-blur">
                            {String(project.status).replace(/_/g, ' ')}
                          </span>
                        ) : null}

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold backdrop-blur ${
                            project.is_goal_reached
                              ? 'bg-amber-100/90 text-amber-800'
                              : 'bg-green-100/90 text-green-800'
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </div>

                      <div className="absolute bottom-4 left-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/60 text-white backdrop-blur">
                        <Icon size={22} />
                      </div>
                    </div>

                    <div className="flex h-full flex-col p-6">
                      <h2 className="text-2xl font-semibold leading-snug text-gray-900">
                        {project.title}
                      </h2>

                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                        {project.location ? (
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-green-700" />
                            <span>{project.location}</span>
                          </div>
                        ) : null}

                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-green-700" />
                          <span>{beneficiaryCount}</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="line-clamp-3 text-sm leading-7 text-gray-600">
                          {project.description}
                        </p>

                        <Link
                          to={projectPath}
                          className="mt-2 inline-flex text-sm font-medium text-green-800 transition hover:text-green-900"
                        >
                          More
                        </Link>
                      </div>

                      <div className="mt-6 rounded-2xl bg-[#F8F8F6] p-4">
                        <div className="mb-3 flex items-center justify-between text-sm">
                          <span className="text-gray-500">Funding progress</span>
                          <span className="font-semibold text-green-800">{progress}%</span>
                        </div>

                        <div className="h-2.5 rounded-full bg-gray-200">
                          <div
                            className="h-2.5 rounded-full bg-green-800"
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        <div className="mt-4 flex items-center justify-between text-sm">
                          <div>
                            <p className="text-gray-500">Raised</p>
                            <p className="font-semibold text-gray-900">
                              {getProjectRaised(project)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-500">Goal</p>
                            <p className="font-semibold text-gray-900">
                              {getProjectGoal(project)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto flex items-center gap-3 pt-2">
                        <Link to={projectPath} className="flex-1 min-w-0">
                          <Button className="w-full whitespace-nowrap">
                            View Project <ArrowRight size={16} className="ml-2 shrink-0" />
                          </Button>
                        </Link>

                        <Link
                          to={`/donate/${getProjectSlugOrId(project)}`}
                          className="shrink-0"
                        >
                          <Button variant="outline" className="whitespace-nowrap px-5">
                            <HandCoins size={16} className="mr-2 shrink-0" />
                            Donate
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-600">
                Page <span className="font-semibold text-gray-900">{currentPage}</span> of{' '}
                <span className="font-semibold text-gray-900">{totalPages}</span>
              </p>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={!prevPage && currentPage === 1}
                  className="disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft size={16} className="mr-2" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={!nextPage}
                  className="disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                  <ChevronRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

export default ProjectsPage