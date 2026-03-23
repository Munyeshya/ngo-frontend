import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Mail, Save, ShieldCheck, UserCircle2 } from 'lucide-react'

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

function getStoredUser() {
  try {
    const raw = localStorage.getItem('ngo_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function getInitials(name) {
  if (!name) return 'D'

  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()

  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
}

function buildDisplayName(user) {
  if (!user) return 'Donor'

  return (
    user.full_name ||
    [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
    user.name ||
    user.username ||
    'Donor'
  )
}

function DonorProfilePage() {
  const [profile, setProfile] = useState(getStoredUser())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    full_name: '',
    first_name: '',
    last_name: '',
    username: '',
    email: '',
  })

  useEffect(() => {
    let active = true

    async function loadProfile() {
      try {
        setLoading(true)
        setError('')

        const response = await api.get(endpoints.profile || endpoints.me)
        const profileData = unwrapPayload(response.data)

        if (!active) return

        setProfile(profileData)
        localStorage.setItem('ngo_user', JSON.stringify(profileData))

        setFormData({
          full_name: profileData?.full_name || '',
          first_name: profileData?.first_name || '',
          last_name: profileData?.last_name || '',
          username: profileData?.username || '',
          email: profileData?.email || '',
        })
      } catch (err) {
        if (!active) return

        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            'Failed to load your profile.'
        )
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      active = false
    }
  }, [])

  const displayName = useMemo(() => buildDisplayName(profile), [profile])
  const initials = useMemo(() => getInitials(displayName), [displayName])

  function handleChange(event) {
    const { name, value } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    try {
      setSaving(true)

      const payload = {
        full_name: formData.full_name.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
      }

      const response = await api.patch(endpoints.profile || endpoints.me, payload)
      const updatedProfile = unwrapPayload(response.data)

      setProfile(updatedProfile)
      localStorage.setItem('ngo_user', JSON.stringify(updatedProfile))

      setFormData({
        full_name: updatedProfile?.full_name || '',
        first_name: updatedProfile?.first_name || '',
        last_name: updatedProfile?.last_name || '',
        username: updatedProfile?.username || '',
        email: updatedProfile?.email || '',
      })

      setSuccess('Profile updated successfully.')
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          'Failed to update profile.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-[28px] border border-gray-200 bg-white p-6 sm:p-8">
          <p className="text-2xl font-bold text-gray-900">Loading profile...</p>
          <p className="mt-2 text-sm text-gray-500">
            We are preparing your donor account details.
          </p>
        </div>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="rounded-[28px] border border-red-200 bg-white p-6 sm:p-8">
        <p className="text-2xl font-bold text-gray-900">Unable to load profile</p>
        <p className="mt-3 text-sm leading-7 text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-[#166534]">My Profile</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              Account Information
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500">
              Review and manage your donor identity and account details.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div className="rounded-[28px] border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#166534] text-2xl font-bold text-white">
                {initials}
              </div>

              <div className="min-w-0">
                <p className="truncate text-2xl font-bold text-gray-900">{displayName}</p>
                <p className="truncate text-sm text-gray-500">
                  {profile?.email || 'No email available'}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="rounded-[22px] bg-[#F8F8F6] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-green-100 p-3 text-[#166534]">
                    <UserCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Username</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {profile?.username || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] bg-[#F8F8F6] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-green-100 p-3 text-[#166534]">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email Address</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {profile?.email || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] bg-[#F8F8F6] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-green-100 p-3 text-[#166534]">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Role</p>
                    <p className="mt-1 text-sm font-semibold capitalize text-gray-900">
                      {profile?.role || 'donor'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-gray-200 bg-white p-6">
            <h3 className="text-xl font-bold text-gray-900">Account Notes</h3>
            <div className="mt-4 rounded-[22px] bg-[#F6F8F4] p-5">
              <p className="text-sm leading-7 text-gray-600">
                Keep your donor information up to date so your account remains consistent across
                donations, project interests, and communication records.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-gray-200 bg-white p-6 sm:p-7">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Edit Profile</h3>
            <p className="mt-1 text-sm text-gray-500">
              Update your donor account information below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2.5 block text-sm font-semibold text-gray-900">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="h-12 w-full rounded-[16px] border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                />
              </div>

              <div>
                <label className="mb-2.5 block text-sm font-semibold text-gray-900">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  className="h-12 w-full rounded-[16px] border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                />
              </div>

              <div>
                <label className="mb-2.5 block text-sm font-semibold text-gray-900">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  className="h-12 w-full rounded-[16px] border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                />
              </div>

              <div>
                <label className="mb-2.5 block text-sm font-semibold text-gray-900">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  className="h-12 w-full rounded-[16px] border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                />
              </div>

              <div>
                <label className="mb-2.5 block text-sm font-semibold text-gray-900">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className="h-12 w-full rounded-[16px] border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-3 rounded-[16px] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[16px] bg-[#166534] px-6 text-sm font-semibold text-white transition hover:bg-[#0F4D27] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}

export default DonorProfilePage