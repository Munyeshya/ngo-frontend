import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  FolderKanban,
  HandCoins,
  HeartHandshake,
  MapPin,
  Pencil,
  Plus,
  Target,
  Trash2,
  Upload,
  X,
} from 'lucide-react'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import Button from '../../components/ui/Button'
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

function getDonationDate(donation) {
  return donation?.donated_at || donation?.created_at || donation?.date || null
}

function getUpdateImages(item) {
  if (Array.isArray(item?.images)) return item.images
  if (Array.isArray(item?.project_update_images)) return item.project_update_images
  return []
}

function getBeneficiaryImages(item) {
  if (Array.isArray(item?.images)) return item.images
  if (Array.isArray(item?.beneficiary_images)) return item.beneficiary_images
  return []
}

function getDonorName(donation) {
  if (donation?.is_anonymous) return 'Anonymous Donor'

  return (
    donation?.donor_name ||
    donation?.donor_username ||
    donation?.donor?.username ||
    donation?.user?.username ||
    'Donor'
  )
}

function getStatusTone(status) {
  const normalized = String(status || '').toLowerCase()

  if (normalized === 'active') return 'bg-green-100 text-green-800'
  if (normalized === 'completed') return 'bg-blue-100 text-blue-800'
  if (normalized === 'planning') return 'bg-amber-100 text-amber-800'
  if (normalized === 'on_hold') return 'bg-gray-200 text-gray-700'
  return 'bg-gray-100 text-gray-700'
}

const DONATIONS_PER_PAGE = 5
const BENEFICIARIES_PER_PAGE = 5
const UPDATES_PER_PAGE = 5

const tabs = [
  { id: 'overview', label: 'Overview', icon: FolderKanban },
  { id: 'beneficiaries', label: 'Beneficiaries', icon: HeartHandshake },
  { id: 'donations', label: 'Donations', icon: HandCoins },
  { id: 'updates', label: 'Updates', icon: Bell },
]

function DashboardProjectWorkspacePage() {
  const { projectId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = tabs.some((tab) => tab.id === searchParams.get('tab'))
    ? searchParams.get('tab')
    : 'overview'
  const donationPageParam = Number(searchParams.get('donationPage') || 1)
  const donationPage = Number.isFinite(donationPageParam) && donationPageParam > 0 ? donationPageParam : 1
  const beneficiaryPageParam = Number(searchParams.get('beneficiaryPage') || 1)
  const beneficiaryPage =
    Number.isFinite(beneficiaryPageParam) && beneficiaryPageParam > 0 ? beneficiaryPageParam : 1
  const updatePageParam = Number(searchParams.get('updatePage') || 1)
  const updatePage = Number.isFinite(updatePageParam) && updatePageParam > 0 ? updatePageParam : 1

  const [project, setProject] = useState(null)
  const [beneficiaries, setBeneficiaries] = useState([])
  const [donations, setDonations] = useState([])
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [showBeneficiaryForm, setShowBeneficiaryForm] = useState(false)
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [editingBeneficiary, setEditingBeneficiary] = useState(null)
  const [editingUpdate, setEditingUpdate] = useState(null)
  const [submittingProject, setSubmittingProject] = useState(false)
  const [submittingBeneficiary, setSubmittingBeneficiary] = useState(false)
  const [submittingUpdate, setSubmittingUpdate] = useState(false)
  const [deletingBeneficiaryId, setDeletingBeneficiaryId] = useState(null)
  const [deletingUpdateId, setDeletingUpdateId] = useState(null)
  const [uploadingBeneficiaryImageFor, setUploadingBeneficiaryImageFor] = useState(null)
  const [uploadingUpdateImageFor, setUploadingUpdateImageFor] = useState(null)
  const [deletingImageId, setDeletingImageId] = useState(null)
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    status: 'planning',
    budget: '',
    target_amount: '',
    start_date: '',
    end_date: '',
    location: '',
  })
  const [beneficiaryForm, setBeneficiaryForm] = useState({
    name: '',
    description: '',
    is_active: true,
  })
  const [updateForm, setUpdateForm] = useState({
    title: '',
    description: '',
  })

  useEffect(() => {
    let active = true

    async function loadWorkspace() {
      try {
        setLoading(true)
        setError('')

        const [projectResponse, beneficiariesResponse, donationsResponse, updatesResponse] =
          await Promise.allSettled([
            api.get(endpoints.projectDetails(projectId)),
            api.get(endpoints.beneficiaries, { params: { project: projectId } }),
            api.get(endpoints.donations, { params: { project: projectId } }),
            api.get(endpoints.projectUpdates, { params: { project: projectId } }),
          ])

        if (!active) return

        if (projectResponse.status === 'fulfilled') {
          setProject(unwrapPayload(projectResponse.value.data))
        } else {
          throw projectResponse.reason
        }

        setBeneficiaries(
          beneficiariesResponse.status === 'fulfilled'
            ? normalizeListResponse(beneficiariesResponse.value.data)
            : []
        )
        setDonations(
          donationsResponse.status === 'fulfilled'
            ? normalizeListResponse(donationsResponse.value.data)
            : []
        )
        setUpdates(
          updatesResponse.status === 'fulfilled'
            ? normalizeListResponse(updatesResponse.value.data)
            : []
        )
      } catch (err) {
        if (!active) return

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            'Failed to load this project workspace.'
        )
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    if (projectId) {
      loadWorkspace()
    }

    return () => {
      active = false
    }
  }, [projectId])

  useEffect(() => {
    if (!project) return

    setProjectForm({
      title: project?.title || '',
      description: project?.description || '',
      status: project?.status || 'planning',
      budget: project?.budget || '',
      target_amount: project?.target_amount || '',
      start_date: project?.start_date || '',
      end_date: project?.end_date || '',
      location: project?.location || '',
    })
  }, [project])

  const stats = useMemo(() => {
    return {
      beneficiaries: beneficiaries.length,
      donations: donations.length,
      updates: updates.length,
      raised: Number(project?.total_donated || 0),
    }
  }, [beneficiaries, donations, updates, project])

  const sortedDonations = useMemo(() => {
    return [...donations].sort(
      (a, b) => new Date(getDonationDate(b) || 0) - new Date(getDonationDate(a) || 0)
    )
  }, [donations])

  const sortedBeneficiaries = useMemo(() => {
    return [...beneficiaries].sort(
      (a, b) => new Date(b?.created_at || 0) - new Date(a?.created_at || 0)
    )
  }, [beneficiaries])

  const donationPageCount = Math.max(
    1,
    Math.ceil(sortedDonations.length / DONATIONS_PER_PAGE)
  )
  const beneficiaryPageCount = Math.max(
    1,
    Math.ceil(sortedBeneficiaries.length / BENEFICIARIES_PER_PAGE)
  )

  const paginatedDonations = useMemo(() => {
    const startIndex = (Math.min(donationPage, donationPageCount) - 1) * DONATIONS_PER_PAGE
    return sortedDonations.slice(startIndex, startIndex + DONATIONS_PER_PAGE)
  }, [sortedDonations, donationPage, donationPageCount])

  const sortedUpdates = useMemo(() => {
    return [...updates].sort(
      (a, b) => new Date(b?.created_at || 0) - new Date(a?.created_at || 0)
    )
  }, [updates])

  const updatePageCount = Math.max(1, Math.ceil(sortedUpdates.length / UPDATES_PER_PAGE))

  const paginatedBeneficiaries = useMemo(() => {
    const startIndex =
      (Math.min(beneficiaryPage, beneficiaryPageCount) - 1) * BENEFICIARIES_PER_PAGE
    return sortedBeneficiaries.slice(startIndex, startIndex + BENEFICIARIES_PER_PAGE)
  }, [sortedBeneficiaries, beneficiaryPage, beneficiaryPageCount])

  const paginatedUpdates = useMemo(() => {
    const startIndex = (Math.min(updatePage, updatePageCount) - 1) * UPDATES_PER_PAGE
    return sortedUpdates.slice(startIndex, startIndex + UPDATES_PER_PAGE)
  }, [sortedUpdates, updatePage, updatePageCount])

  const donationTrend = useMemo(() => {
    const target = Number(project?.target_amount || 0)
    const ordered = [...sortedDonations].reverse()
    let runningTotal = 0

    const points = ordered.map((donation, index) => {
      runningTotal += Number(donation?.amount || 0)
      return {
        id: donation.id || index,
        label: formatDate(getDonationDate(donation)),
        cumulative: runningTotal,
      }
    })

    const maxValue = Math.max(target, runningTotal, 1)
    return { points, target, maxValue, latestTotal: runningTotal }
  }, [project?.target_amount, sortedDonations])

  const selectedTab = tabs.find((tab) => tab.id === activeTab) || tabs[0]

  function switchTab(tabId) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('tab', tabId)
    nextParams.delete('donationPage')
    nextParams.delete('beneficiaryPage')
    nextParams.delete('updatePage')
    setSearchParams(nextParams)
  }

  function setDonationPage(pageNumber) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('tab', 'donations')
    nextParams.set('donationPage', String(pageNumber))
    setSearchParams(nextParams)
  }

  function setBeneficiaryPage(pageNumber) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('tab', 'beneficiaries')
    nextParams.set('beneficiaryPage', String(pageNumber))
    setSearchParams(nextParams)
  }

  function setUpdatePage(pageNumber) {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('tab', 'updates')
    nextParams.set('updatePage', String(pageNumber))
    setSearchParams(nextParams)
  }

  async function refreshWorkspace() {
    const [projectResponse, beneficiariesResponse, donationsResponse, updatesResponse] =
      await Promise.all([
        api.get(endpoints.projectDetails(projectId)),
        api.get(endpoints.beneficiaries, { params: { project: projectId } }),
        api.get(endpoints.donations, { params: { project: projectId } }),
        api.get(endpoints.projectUpdates, { params: { project: projectId } }),
      ])

    setProject(unwrapPayload(projectResponse.data))
    setBeneficiaries(normalizeListResponse(beneficiariesResponse.data))
    setDonations(normalizeListResponse(donationsResponse.data))
    setUpdates(normalizeListResponse(updatesResponse.data))
  }

  function resetBeneficiaryForm() {
    setBeneficiaryForm({
      name: '',
      description: '',
      is_active: true,
    })
    setEditingBeneficiary(null)
  }

  function resetUpdateForm() {
    setUpdateForm({
      title: '',
      description: '',
    })
    setEditingUpdate(null)
  }

  function openProjectForm() {
    setActionError('')
    setActionSuccess('')
    setShowProjectForm(true)
  }

  function openBeneficiaryForm(item = null) {
    setActionError('')
    setActionSuccess('')

    if (item) {
      setEditingBeneficiary(item)
      setBeneficiaryForm({
        name: item?.name || '',
        description: item?.description || '',
        is_active: item?.is_active ?? true,
      })
    } else {
      resetBeneficiaryForm()
    }

    setShowBeneficiaryForm(true)
  }

  function openUpdateForm(item = null) {
    setActionError('')
    setActionSuccess('')

    if (item) {
      setEditingUpdate(item)
      setUpdateForm({
        title: item?.title || '',
        description: item?.description || '',
      })
    } else {
      resetUpdateForm()
    }

    setShowUpdateForm(true)
  }

  function closeProjectForm() {
    setShowProjectForm(false)
  }

  function closeBeneficiaryForm() {
    setShowBeneficiaryForm(false)
    resetBeneficiaryForm()
  }

  function closeUpdateForm() {
    setShowUpdateForm(false)
    resetUpdateForm()
  }

  function handleProjectFieldChange(event) {
    const { name, value } = event.target
    setProjectForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleBeneficiaryFieldChange(event) {
    const { name, value, type, checked } = event.target
    setBeneficiaryForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function handleUpdateFieldChange(event) {
    const { name, value } = event.target
    setUpdateForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleProjectSubmit(event) {
    event.preventDefault()
    setActionError('')
    setActionSuccess('')

    try {
      setSubmittingProject(true)
      await api.patch(endpoints.projectDetails(projectId), {
        ...projectForm,
        title: projectForm.title.trim(),
        description: projectForm.description.trim(),
        location: projectForm.location.trim(),
      })
      await refreshWorkspace()
      setActionSuccess('Project details updated successfully.')
      closeProjectForm()
    } catch (err) {
      setActionError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          'Failed to update project details.'
      )
    } finally {
      setSubmittingProject(false)
    }
  }

  async function handleBeneficiarySubmit(event) {
    event.preventDefault()
    setActionError('')
    setActionSuccess('')

    try {
      setSubmittingBeneficiary(true)
      const payload = {
        project: Number(projectId),
        name: beneficiaryForm.name.trim(),
        description: beneficiaryForm.description.trim(),
        is_active: beneficiaryForm.is_active,
      }

      if (editingBeneficiary?.id) {
        await api.patch(endpoints.beneficiaryDetails(editingBeneficiary.id), payload)
        setActionSuccess('Beneficiary updated successfully.')
      } else {
        await api.post(endpoints.beneficiaries, payload)
        setActionSuccess('Beneficiary created successfully.')
      }

      await refreshWorkspace()
      closeBeneficiaryForm()
    } catch (err) {
      setActionError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          'Failed to save beneficiary.'
      )
    } finally {
      setSubmittingBeneficiary(false)
    }
  }

  async function handleUpdateSubmit(event) {
    event.preventDefault()
    setActionError('')
    setActionSuccess('')

    try {
      setSubmittingUpdate(true)
      const payload = {
        project: Number(projectId),
        title: updateForm.title.trim(),
        description: updateForm.description.trim(),
      }

      if (editingUpdate?.id) {
        await api.patch(endpoints.projectUpdateDetails(editingUpdate.id), payload)
        setActionSuccess('Project update saved successfully.')
      } else {
        await api.post(endpoints.projectUpdates, payload)
        setActionSuccess('Project update created successfully.')
      }

      await refreshWorkspace()
      closeUpdateForm()
    } catch (err) {
      setActionError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          'Failed to save project update.'
      )
    } finally {
      setSubmittingUpdate(false)
    }
  }

  async function handleDeleteBeneficiary(item) {
    if (!window.confirm(`Delete "${item?.name || 'this beneficiary'}"?`)) return

    try {
      setDeletingBeneficiaryId(item.id)
      setActionError('')
      setActionSuccess('')
      await api.delete(endpoints.beneficiaryDetails(item.id))
      await refreshWorkspace()
      setActionSuccess('Beneficiary deleted successfully.')
    } catch (err) {
      setActionError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          'Failed to delete beneficiary.'
      )
    } finally {
      setDeletingBeneficiaryId(null)
    }
  }

  async function handleDeleteUpdate(item) {
    if (!window.confirm(`Delete "${item?.title || 'this update'}"?`)) return

    try {
      setDeletingUpdateId(item.id)
      setActionError('')
      setActionSuccess('')
      await api.delete(endpoints.projectUpdateDetails(item.id))
      await refreshWorkspace()
      setActionSuccess('Project update deleted successfully.')
    } catch (err) {
      setActionError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          'Failed to delete project update.'
      )
    } finally {
      setDeletingUpdateId(null)
    }
  }

  async function handleBeneficiaryImageUpload(beneficiaryId, file) {
    if (!file) return

    try {
      setUploadingBeneficiaryImageFor(beneficiaryId)
      setActionError('')
      setActionSuccess('')
      const payload = new FormData()
      payload.append('beneficiary', beneficiaryId)
      payload.append('image', file)
      await api.post(endpoints.beneficiaryImages, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await refreshWorkspace()
      setActionSuccess('Beneficiary image uploaded successfully.')
    } catch (err) {
      setActionError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          'Failed to upload beneficiary image.'
      )
    } finally {
      setUploadingBeneficiaryImageFor(null)
    }
  }

  async function handleUpdateImageUpload(updateId, file) {
    if (!file) return

    try {
      setUploadingUpdateImageFor(updateId)
      setActionError('')
      setActionSuccess('')
      const payload = new FormData()
      payload.append('project_update', updateId)
      payload.append('image', file)
      await api.post(endpoints.projectUpdateImages, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await refreshWorkspace()
      setActionSuccess('Update image uploaded successfully.')
    } catch (err) {
      setActionError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          'Failed to upload update image.'
      )
    } finally {
      setUploadingUpdateImageFor(null)
    }
  }

  async function handleDeleteBeneficiaryImage(imageId) {
    if (!window.confirm('Remove this beneficiary image?')) return

    try {
      setDeletingImageId(imageId)
      setActionError('')
      setActionSuccess('')
      await api.delete(endpoints.beneficiaryImageDetails(imageId))
      await refreshWorkspace()
      setActionSuccess('Beneficiary image deleted successfully.')
    } catch (err) {
      setActionError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          'Failed to delete beneficiary image.'
      )
    } finally {
      setDeletingImageId(null)
    }
  }

  async function handleDeleteUpdateImage(imageId) {
    if (!window.confirm('Remove this update image?')) return

    try {
      setDeletingImageId(imageId)
      setActionError('')
      setActionSuccess('')
      await api.delete(endpoints.projectUpdateImageDetails(imageId))
      await refreshWorkspace()
      setActionSuccess('Update image deleted successfully.')
    } catch (err) {
      setActionError(
        err?.response?.data?.message ||
          err?.response?.data?.detail ||
          'Failed to delete update image.'
      )
    } finally {
      setDeletingImageId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Workspace</h1>
          <p className="mt-1.5 text-sm text-gray-600">Loading project details...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Workspace</h1>
          <p className="mt-1.5 text-sm text-gray-600">Unable to open this project.</p>
        </div>

        <Card className="border border-red-200 p-5">
          <p className="text-sm text-red-700">{error || 'Project not found.'}</p>
          <Link
            to="/dashboard/projects"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#166534]"
          >
            <ArrowLeft size={15} />
            Back to Projects
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            to="/dashboard/projects"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-green-800"
          >
            <ArrowLeft size={14} />
            Back to Projects
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            {project?.title || 'Project'}
          </h1>
          <p className="mt-1.5 text-sm text-gray-600">
            Project-centered workspace for related records and operational details.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusTone(
              project?.status
            )}`}
          >
            {project?.status || 'Unknown'}
          </span>
          <Link
            to={`/projects/${project.id}`}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-green-300 hover:text-green-800"
          >
            View Public Page
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <Card className="rounded-[24px] p-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = tab.id === selectedTab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => switchTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-green-800 text-white'
                    : 'bg-[#F3F5F0] text-gray-700 hover:bg-green-50 hover:text-green-800'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </Card>

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

      {selectedTab.id === 'overview' && (
        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-[24px] p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-gray-900">Project Details</h2>
              <button
                type="button"
                onClick={openProjectForm}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-green-300 hover:text-green-800"
              >
                <Pencil size={13} />
                Edit
              </button>
            </div>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              {project?.description || 'No project description available.'}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#F8F8F6] p-3.5">
                <p className="text-xs text-gray-500">Location</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {project?.location || 'Not specified'}
                </p>
              </div>
              <div className="rounded-2xl bg-[#F8F8F6] p-3.5">
                <p className="text-xs text-gray-500">Budget</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {formatCurrency(project?.budget)}
                </p>
              </div>
              <div className="rounded-2xl bg-[#F8F8F6] p-3.5">
                <p className="text-xs text-gray-500">Start Date</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {formatDate(project?.start_date)}
                </p>
              </div>
              <div className="rounded-2xl bg-[#F8F8F6] p-3.5">
                <p className="text-xs text-gray-500">End Date</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {formatDate(project?.end_date)}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border border-gray-200 bg-[#FCFCFB] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Donation Progress Over Time</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Cumulative donations compared with the target amount.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-gray-500">Current total</p>
                  <p className="text-sm font-semibold text-green-800">
                    {formatCurrency(donationTrend.latestTotal)}
                  </p>
                </div>
              </div>

              {donationTrend.points.length === 0 ? (
                <div className="mt-4 rounded-2xl bg-[#F8F8F6] p-4 text-sm text-gray-600">
                  No donations yet to chart against the target.
                </div>
              ) : (
                <>
                  <div className="mt-4 overflow-x-auto">
                    <svg
                      viewBox="0 0 520 220"
                      className="h-[220px] min-w-[520px] w-full"
                      role="img"
                      aria-label="Donation progress chart"
                    >
                      <line x1="40" y1="20" x2="40" y2="180" stroke="#d1d5db" strokeWidth="1.5" />
                      <line x1="40" y1="180" x2="500" y2="180" stroke="#d1d5db" strokeWidth="1.5" />
                      <line
                        x1="40"
                        x2="500"
                        y1={180 - (donationTrend.target / donationTrend.maxValue) * 140}
                        y2={180 - (donationTrend.target / donationTrend.maxValue) * 140}
                        stroke="#f59e0b"
                        strokeWidth="2"
                        strokeDasharray="6 6"
                      />
                      <text
                        x="500"
                        y={174 - (donationTrend.target / donationTrend.maxValue) * 140}
                        textAnchor="end"
                        fontSize="11"
                        fill="#92400e"
                      >
                        Target
                      </text>
                      {donationTrend.points.length === 1 ? (
                        <circle
                          cx="270"
                          cy={180 - (donationTrend.points[0].cumulative / donationTrend.maxValue) * 140}
                          r="5"
                          fill="#166534"
                        />
                      ) : (
                        <>
                          <polyline
                            fill="none"
                            stroke="#166534"
                            strokeWidth="3"
                            points={donationTrend.points
                              .map((point, index) => {
                                const x = 40 + (index / (donationTrend.points.length - 1)) * 460
                                const y = 180 - (point.cumulative / donationTrend.maxValue) * 140
                                return `${x},${y}`
                              })
                              .join(' ')}
                          />
                          {donationTrend.points.map((point, index) => {
                            const x = 40 + (index / (donationTrend.points.length - 1)) * 460
                            const y = 180 - (point.cumulative / donationTrend.maxValue) * 140

                            return (
                              <g key={point.id}>
                                <circle cx={x} cy={y} r="4" fill="#166534" />
                                <text x={x} y="198" textAnchor="middle" fontSize="10" fill="#6b7280">
                                  {index === 0 || index === donationTrend.points.length - 1
                                    ? point.label
                                    : ''}
                                </text>
                              </g>
                            )
                          })}
                        </>
                      )}
                    </svg>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-2xl bg-[#F8F8F6] px-3 py-2.5">
                      <p className="text-[11px] text-gray-500">Target</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {formatCurrency(donationTrend.target)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#F8F8F6] px-3 py-2.5">
                      <p className="text-[11px] text-gray-500">Latest Total</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {formatCurrency(donationTrend.latestTotal)}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#F8F8F6] px-3 py-2.5">
                      <p className="text-[11px] text-gray-500">Donations Count</p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {donationTrend.points.length}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          <Card className="rounded-[24px] p-5">
            <h2 className="text-base font-bold text-gray-900">Project Snapshot</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#F8F8F6] p-3.5">
                <p className="text-xs text-gray-500">Raised</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {formatCurrency(stats.raised)}
                </p>
              </div>
              <div className="rounded-2xl bg-[#F8F8F6] p-3.5">
                <p className="text-xs text-gray-500">Target</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {formatCurrency(project?.target_amount)}
                </p>
              </div>
              <div className="rounded-2xl bg-[#F8F8F6] p-3.5">
                <p className="text-xs text-gray-500">Beneficiaries</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {stats.beneficiaries}
                </p>
              </div>
              <div className="rounded-2xl bg-[#F8F8F6] p-3.5">
                <p className="text-xs text-gray-500">Updates</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">{stats.updates}</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-[#F8F8F6] px-3.5 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={15} />
                  Location
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {project?.location || 'Not set'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[#F8F8F6] px-3.5 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Target size={15} />
                  Progress
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {Number(project?.funding_percentage || 0).toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[#F8F8F6] px-3.5 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarDays size={15} />
                  Created
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatDate(project?.created_at)}
                </span>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold text-gray-500">Partners</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {Array.isArray(project?.partners) && project.partners.length > 0 ? (
                  project.partners.map((partner) => (
                    <span
                      key={partner.id}
                      className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800"
                    >
                      {partner.name}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No partners linked yet.</span>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {selectedTab.id === 'beneficiaries' && (
        <Card className="rounded-[24px] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">Beneficiaries</h2>
              <p className="mt-1 text-sm text-gray-500">All beneficiary records for this project.</p>
            </div>
            <Button className="px-3 py-2 text-xs" onClick={() => openBeneficiaryForm()}>
              <Plus size={14} className="mr-1.5" />
              New Beneficiary
            </Button>
          </div>

          {beneficiaries.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-[#F8F8F6] p-5 text-sm text-gray-600">
              No beneficiaries linked to this project yet.
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <div className="grid gap-4 xl:grid-cols-2">
                {paginatedBeneficiaries.map((beneficiary) => {
                  const images = getBeneficiaryImages(beneficiary)

                  return (
                    <div
                      key={beneficiary.id}
                      className="rounded-[22px] border border-gray-200 bg-[#FCFCFB] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-900">{beneficiary.name}</p>
                        <div className="flex items-center gap-2">
                          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-700 transition hover:border-green-300 hover:text-green-800">
                            <Upload size={12} />
                            {uploadingBeneficiaryImageFor === beneficiary.id ? 'Uploading...' : 'Image'}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) => {
                                handleBeneficiaryImageUpload(
                                  beneficiary.id,
                                  event.target.files?.[0]
                                )
                                event.target.value = ''
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => openBeneficiaryForm(beneficiary)}
                            className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-700 transition hover:border-green-300 hover:text-green-800"
                          >
                            <Pencil size={12} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBeneficiary(beneficiary)}
                            disabled={deletingBeneficiaryId === beneficiary.id}
                            className="inline-flex items-center gap-1 rounded-full border border-red-200 px-2.5 py-1 text-[11px] font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-70"
                          >
                            <Trash2 size={12} />
                            {deletingBeneficiaryId === beneficiary.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {beneficiary.description || 'No beneficiary description available.'}
                      </p>

                      {images.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-2.5">
                          {images.slice(0, 3).map((image) => (
                            <div key={image?.id || image?.image} className="group relative">
                              <img
                                src={image?.image}
                                alt={image?.caption || beneficiary?.name || 'Beneficiary image'}
                                className="h-20 w-full rounded-xl object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => handleDeleteBeneficiaryImage(image.id)}
                                disabled={deletingImageId === image.id}
                                className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-red-700 opacity-0 transition group-hover:opacity-100 disabled:opacity-100"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-1">
                <p className="text-xs text-gray-500">
                  Page {Math.min(beneficiaryPage, beneficiaryPageCount)} of {beneficiaryPageCount}
                </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setBeneficiaryPage(Math.max(1, beneficiaryPage - 1))}
                      disabled={beneficiaryPage <= 1}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-700 transition hover:bg-green-50 hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Previous beneficiaries page"
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setBeneficiaryPage(Math.min(beneficiaryPageCount, beneficiaryPage + 1))}
                      disabled={beneficiaryPage >= beneficiaryPageCount}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-700 transition hover:bg-green-50 hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Next beneficiaries page"
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
            </div>
          )}
        </Card>
      )}

      {selectedTab.id === 'donations' && (
        <Card className="rounded-[24px] p-5">
          <h2 className="text-base font-bold text-gray-900">Donations</h2>
          <p className="mt-1 text-sm text-gray-500">
            Contribution history for this project. Donations are view-only in the current backend.
          </p>

          {sortedDonations.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-[#F8F8F6] p-5 text-sm text-gray-600">
              No donation records are visible for this project yet.
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                        Donor
                      </th>
                      <th className="pb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                        Amount
                      </th>
                      <th className="pb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                        Method
                      </th>
                      <th className="pb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedDonations.map((donation) => (
                      <tr key={donation.id}>
                        <td className="py-3 pr-4">
                          <p className="text-[13px] font-semibold text-gray-900">
                            {getDonorName(donation)}
                          </p>
                        </td>
                        <td className="py-3 pr-4 text-[13px] font-semibold text-green-800">
                          {formatCurrency(donation?.amount)}
                        </td>
                        <td className="py-3 pr-4 text-[13px] text-gray-600">
                          {donation?.payment_method || 'N/A'}
                        </td>
                        <td className="py-3 text-[13px] text-gray-600">
                          {formatDate(getDonationDate(donation))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-1">
                <p className="text-[11px] text-gray-500">
                  Page {Math.min(donationPage, donationPageCount)} of {donationPageCount}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDonationPage(Math.max(1, donationPage - 1))}
                    disabled={donationPage <= 1}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-700 transition hover:bg-green-50 hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Previous donations page"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDonationPage(Math.min(donationPageCount, donationPage + 1))}
                    disabled={donationPage >= donationPageCount}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-700 transition hover:bg-green-50 hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Next donations page"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {selectedTab.id === 'updates' && (
        <Card className="rounded-[24px] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">Updates</h2>
              <p className="mt-1 text-sm text-gray-500">Recent progress records for this project.</p>
            </div>
            <Button className="px-3 py-2 text-xs" onClick={() => openUpdateForm()}>
              <Plus size={14} className="mr-1.5" />
              New Update
            </Button>
          </div>

          {sortedUpdates.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-[#F8F8F6] p-5 text-sm text-gray-600">
              No updates published for this project yet.
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {paginatedUpdates.map((update) => {
                const images = getUpdateImages(update)

                return (
                  <div
                    key={update.id}
                    className="rounded-[22px] border border-gray-200 bg-[#FCFCFB] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{update.title}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatDate(update?.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-700 transition hover:border-green-300 hover:text-green-800">
                          <Upload size={12} />
                          {uploadingUpdateImageFor === update.id ? 'Uploading...' : 'Image'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => {
                              handleUpdateImageUpload(update.id, event.target.files?.[0])
                              event.target.value = ''
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => openUpdateForm(update)}
                          className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-700 transition hover:border-green-300 hover:text-green-800"
                        >
                          <Pencil size={12} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUpdate(update)}
                          disabled={deletingUpdateId === update.id}
                          className="inline-flex items-center gap-1 rounded-full border border-red-200 px-2.5 py-1 text-[11px] font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-70"
                        >
                          <Trash2 size={12} />
                          {deletingUpdateId === update.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      {update.description || 'No update description available.'}
                    </p>

                    {images.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-2.5">
                        {images.slice(0, 3).map((image) => (
                          <div key={image?.id || image?.image} className="group relative">
                            <img
                              src={image?.image}
                              alt={image?.caption || update?.title || 'Update image'}
                              className="h-20 w-full rounded-xl object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteUpdateImage(image.id)}
                              disabled={deletingImageId === image.id}
                              className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-red-700 opacity-0 transition group-hover:opacity-100 disabled:opacity-100"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-1">
                <p className="text-xs text-gray-500">
                  Page {Math.min(updatePage, updatePageCount)} of {updatePageCount}
                </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUpdatePage(Math.max(1, updatePage - 1))}
                      disabled={updatePage <= 1}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-700 transition hover:bg-green-50 hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Previous updates page"
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpdatePage(Math.min(updatePageCount, updatePage + 1))}
                      disabled={updatePage >= updatePageCount}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-700 transition hover:bg-green-50 hover:text-green-800 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Next updates page"
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
            </div>
          )}
        </Card>
      )}

      {showProjectForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6">
          <Card className="max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-[24px] border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">Edit Project</h2>
                <p className="mt-1 text-xs text-gray-500">Update the core project details for this workspace.</p>
              </div>
              <button
                type="button"
                onClick={closeProjectForm}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-50"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleProjectSubmit} className="overflow-y-auto px-6 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[11px] font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={projectForm.title}
                    onChange={handleProjectFieldChange}
                    required
                    className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-[11px] font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={projectForm.description}
                    onChange={handleProjectFieldChange}
                    rows="5"
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-gray-700">Status</label>
                  <select
                    name="status"
                    value={projectForm.status}
                    onChange={handleProjectFieldChange}
                    className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={projectForm.location}
                    onChange={handleProjectFieldChange}
                    className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-gray-700">Budget</label>
                  <input
                    type="number"
                    name="budget"
                    min="0"
                    step="0.01"
                    value={projectForm.budget}
                    onChange={handleProjectFieldChange}
                    required
                    className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-gray-700">Target Amount</label>
                  <input
                    type="number"
                    name="target_amount"
                    min="0"
                    step="0.01"
                    value={projectForm.target_amount}
                    onChange={handleProjectFieldChange}
                    required
                    className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={projectForm.start_date}
                    onChange={handleProjectFieldChange}
                    required
                    className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={projectForm.end_date}
                    onChange={handleProjectFieldChange}
                    className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                  />
                </div>
              </div>
              <div className="mt-5 flex flex-wrap justify-end gap-2.5">
                <Button type="button" variant="outline" onClick={closeProjectForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingProject}>
                  {submittingProject ? 'Saving...' : 'Save Project'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showBeneficiaryForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6">
          <Card className="max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-[24px] border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {editingBeneficiary ? 'Edit Beneficiary' : 'New Beneficiary'}
                </h2>
                <p className="mt-1 text-xs text-gray-500">Add or update beneficiary details for this project.</p>
              </div>
              <button
                type="button"
                onClick={closeBeneficiaryForm}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-50"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleBeneficiarySubmit} className="overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={beneficiaryForm.name}
                    onChange={handleBeneficiaryFieldChange}
                    required
                    className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={beneficiaryForm.description}
                    onChange={handleBeneficiaryFieldChange}
                    rows="5"
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                  />
                </div>
                <label className="flex items-center gap-3 rounded-xl bg-[#F8F8F6] px-4 py-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={beneficiaryForm.is_active}
                    onChange={handleBeneficiaryFieldChange}
                    className="h-4 w-4 rounded border-gray-300 text-[#166534] focus:ring-green-700"
                  />
                  Active beneficiary record
                </label>
              </div>
              <div className="mt-5 flex flex-wrap justify-end gap-2.5">
                <Button type="button" variant="outline" onClick={closeBeneficiaryForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingBeneficiary}>
                  {submittingBeneficiary
                    ? 'Saving...'
                    : editingBeneficiary
                    ? 'Save Beneficiary'
                    : 'Create Beneficiary'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showUpdateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6">
          <Card className="max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-[24px] border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  {editingUpdate ? 'Edit Update' : 'New Update'}
                </h2>
                <p className="mt-1 text-xs text-gray-500">Publish or update progress content for this project.</p>
              </div>
              <button
                type="button"
                onClick={closeUpdateForm}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-50"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={updateForm.title}
                    onChange={handleUpdateFieldChange}
                    required
                    className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={updateForm.description}
                    onChange={handleUpdateFieldChange}
                    rows="6"
                    required
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                  />
                </div>
              </div>
              <div className="mt-5 flex flex-wrap justify-end gap-2.5">
                <Button type="button" variant="outline" onClick={closeUpdateForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submittingUpdate}>
                  {submittingUpdate
                    ? 'Saving...'
                    : editingUpdate
                    ? 'Save Update'
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

export default DashboardProjectWorkspacePage
