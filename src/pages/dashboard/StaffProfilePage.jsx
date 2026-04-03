import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Mail, Save, ShieldCheck, UserCircle2 } from 'lucide-react'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import Card from '../../components/ui/Card'
import { getUser, setUser } from '../../utils/storage'

function unwrapPayload(payload) {
  if (!payload) return payload
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.results)) return payload.results
  if (Array.isArray(payload?.data)) return payload.data
  if (payload?.data && typeof payload.data === 'object') return payload.data
  return payload
}

function getInitials(name) {
  if (!name) return 'S'
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
}

function buildDisplayName(user) {
  if (!user) return 'Staff User'
  return (
    user.full_name ||
    [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
    user.username ||
    'Staff User'
  )
}

function StaffProfilePage() {
  const [profile, setProfile] = useState(getUser())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone_number: '',
  })

  useEffect(() => {
    let active = true

    async function loadProfile() {
      try {
        setLoading(true)
        setError('')
        const response = await api.get(endpoints.profile)
        const profileData = unwrapPayload(response.data)

        if (!active) return

        setProfile(profileData)
        setUser(profileData)
        setFormData({
          first_name: profileData?.first_name || '',
          last_name: profileData?.last_name || '',
          username: profileData?.username || '',
          email: profileData?.email || '',
          phone_number: profileData?.phone_number || '',
        })
      } catch (err) {
        if (!active) return
        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            'Failed to load your staff profile.'
        )
      } finally {
        if (active) setLoading(false)
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

    if (!profile?.id) {
      setError('Your profile record could not be identified. Please reload and try again.')
      return
    }

    try {
      setSaving(true)
      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone_number.trim(),
      }

      const response = await api.patch(endpoints.userDetails(profile.id), payload)
      const updatedProfile = unwrapPayload(response.data)
      setProfile(updatedProfile)
      setUser(updatedProfile)
      setFormData({
        first_name: updatedProfile?.first_name || '',
        last_name: updatedProfile?.last_name || '',
        username: updatedProfile?.username || '',
        email: updatedProfile?.email || '',
        phone_number: updatedProfile?.phone_number || '',
      })
      setSuccess('Staff profile updated successfully.')
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          'Failed to update staff profile.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="rounded-[24px] p-5">
          <p className="text-lg font-bold text-gray-900">Loading profile...</p>
          <p className="mt-2 text-sm text-gray-500">Preparing your staff account details.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-[24px] p-5">
        <p className="text-sm font-medium text-[#166534]">Staff Profile</p>
        <h1 className="mt-2 text-[1.7rem] font-bold text-gray-900">Account Details</h1>
        <p className="mt-2 text-sm text-gray-500">
          Manage your personal account information used across the staff portal.
        </p>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[0.86fr_1.14fr]">
        <div className="space-y-4">
          <Card className="rounded-[24px] p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-18 w-18 items-center justify-center rounded-[22px] bg-[#166534] text-xl font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-gray-900">{displayName}</p>
                <p className="truncate text-sm text-gray-500">
                  {profile?.email || 'No email available'}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-[20px] bg-[#F8F8F6] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-green-100 p-3 text-[#166534]">
                    <UserCircle2 size={16} />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500">Username</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {profile?.username || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[20px] bg-[#F8F8F6] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-green-100 p-3 text-[#166534]">
                    <Mail size={16} />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500">Email Address</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {profile?.email || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[20px] bg-[#F8F8F6] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-green-100 p-3 text-[#166534]">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500">Role</p>
                    <p className="mt-1 text-sm font-semibold capitalize text-gray-900">
                      {profile?.role || 'staff'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-[24px] p-5">
            <h2 className="text-sm font-bold text-gray-900">Profile Notes</h2>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              Keep your staff identity current so project ownership, approval messages, and account
              communication stay accurate.
            </p>
          </Card>
        </div>

        <Card className="rounded-[24px] p-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
            <p className="mt-1 text-sm text-gray-500">
              Update the safe account fields available to your staff profile.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-[11px] font-semibold text-gray-700">First Name</span>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="h-11 w-full rounded-[16px] border border-gray-300 bg-white px-3.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-[11px] font-semibold text-gray-700">Last Name</span>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="h-11 w-full rounded-[16px] border border-gray-300 bg-white px-3.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-[11px] font-semibold text-gray-700">Username</span>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="h-11 w-full rounded-[16px] border border-gray-300 bg-white px-3.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-[11px] font-semibold text-gray-700">Email Address</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="h-11 w-full rounded-[16px] border border-gray-300 bg-white px-3.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                />
              </label>

              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-[11px] font-semibold text-gray-700">Phone Number</span>
                <input
                  type="text"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="h-11 w-full rounded-[16px] border border-gray-300 bg-white px-3.5 text-sm outline-none transition focus:border-[#166534] focus:ring-4 focus:ring-green-100"
                />
              </label>
            </div>

            {error ? (
              <div className="flex items-start gap-3 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            {success ? (
              <div className="flex items-start gap-3 rounded-[16px] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <span>{success}</span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[16px] bg-[#166534] px-5 text-sm font-semibold text-white transition hover:bg-[#0F4D27] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Save size={15} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default StaffProfilePage
