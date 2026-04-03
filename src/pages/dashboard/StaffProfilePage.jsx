import { useEffect, useMemo, useState } from 'react'
import { Mail, Save, ShieldCheck, Upload, UserCircle2 } from 'lucide-react'

import api from '../../api/axios'
import endpoints from '../../api/endpoints'
import { useToast } from '../../components/feedback/ToastProvider'
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
  if (!name) return 'A'
  const parts = String(name).trim().split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
}

function buildDisplayName(user) {
  if (!user) return 'Account User'
  return (
    user.full_name ||
    [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
    user.username ||
    user.email ||
    'Account User'
  )
}

function StaffProfilePage() {
  const { showToast } = useToast()
  const storedUser = getUser()
  const [profile, setProfile] = useState(storedUser)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone_number: '',
    profile_image: null,
  })

  useEffect(() => {
    let active = true

    async function loadProfile() {
      try {
        setLoading(true)
        setError('')
        const userId = storedUser?.id
        const response = userId
          ? await api.get(endpoints.userDetails(userId))
          : await api.get(endpoints.profile)
        const profileData = unwrapPayload(response.data) || {}
        const mergedProfile = {
          ...(storedUser || {}),
          ...profileData,
        }

        if (!active) return

        setProfile(mergedProfile)
        setUser(mergedProfile)
        setFormData({
          first_name: mergedProfile?.first_name || '',
          last_name: mergedProfile?.last_name || '',
          username: mergedProfile?.username || '',
          email: mergedProfile?.email || '',
          phone_number: mergedProfile?.phone_number || '',
          profile_image: null,
        })
      } catch (err) {
        if (!active) return
        const message =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          'Failed to load your account profile.'
        setError(message)
        showToast({ type: 'error', message })
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProfile()
    return () => {
      active = false
    }
  }, [showToast, storedUser])

  const displayName = useMemo(() => buildDisplayName(profile), [profile])
  const initials = useMemo(() => getInitials(displayName), [displayName])
  const roleLabel =
    String(profile?.role || storedUser?.role || 'staff').toLowerCase() === 'admin'
      ? 'Admin'
      : 'Staff'
  const uploadedImagePreview = useMemo(() => {
    if (!(formData.profile_image instanceof File)) return ''
    return URL.createObjectURL(formData.profile_image)
  }, [formData.profile_image])
  const profileImagePreview = uploadedImagePreview || profile?.profile_image || ''

  useEffect(() => {
    return () => {
      if (uploadedImagePreview) {
        URL.revokeObjectURL(uploadedImagePreview)
      }
    }
  }, [uploadedImagePreview])

  function handleChange(event) {
    const { name, value, files } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] || null : value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (!profile?.id) {
      showToast({
        type: 'error',
        message: 'Your profile record could not be identified. Please reload and try again.',
      })
      return
    }

    try {
      setSaving(true)
      const payload = new FormData()
      payload.append('first_name', formData.first_name.trim())
      payload.append('last_name', formData.last_name.trim())
      payload.append('username', formData.username.trim())
      payload.append('email', formData.email.trim())
      payload.append('phone_number', formData.phone_number.trim())
      if (formData.profile_image) {
        payload.append('profile_image', formData.profile_image)
      }

      const response = await api.patch(endpoints.userDetails(profile.id), payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const updatedProfile = unwrapPayload(response.data)
      const mergedProfile = {
        ...(getUser() || {}),
        ...updatedProfile,
      }
      setProfile(mergedProfile)
      setUser(mergedProfile)
      setFormData({
        first_name: mergedProfile?.first_name || '',
        last_name: mergedProfile?.last_name || '',
        username: mergedProfile?.username || '',
        email: mergedProfile?.email || '',
        phone_number: mergedProfile?.phone_number || '',
        profile_image: null,
      })
      showToast({ type: 'success', message: `${roleLabel} profile updated successfully.` })
    } catch (err) {
      showToast({
        type: 'error',
        message:
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          'Failed to update account profile.',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="rounded-[24px] p-5">
          <p className="text-lg font-bold text-gray-900">Loading profile...</p>
          <p className="mt-2 text-sm text-gray-500">Preparing your account details.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="rounded-[24px] p-5">
        <p className="text-sm font-medium text-[#166534]">{roleLabel} Profile</p>
        <h1 className="mt-2 text-[1.7rem] font-bold text-gray-900">Account Details</h1>
        <p className="mt-2 text-sm text-gray-500">
          Manage your personal account information used across the portal.
        </p>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[0.86fr_1.14fr]">
        <div className="space-y-4">
          <Card className="rounded-[24px] p-5">
            <div className="flex items-center gap-4">
              {profileImagePreview ? (
                <img
                  src={profileImagePreview}
                  alt={displayName}
                  className="h-18 w-18 rounded-[22px] object-cover"
                />
              ) : (
                <div className="flex h-18 w-18 items-center justify-center rounded-[22px] bg-[#166534] text-xl font-bold text-white">
                  {initials}
                </div>
              )}
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
              Keep your account identity current so ownership, review messages, and account
              communication stay accurate.
            </p>
          </Card>
        </div>

        <Card className="rounded-[24px] p-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
            <p className="mt-1 text-sm text-gray-500">
              Update the safe account fields available to your profile.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="rounded-[20px] border border-gray-200 bg-[#F8F8F6] p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt={displayName}
                    className="h-20 w-20 rounded-[22px] object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-[22px] bg-[#166534] text-xl font-bold text-white">
                    {initials}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900">Profile Image</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Upload a clear profile image for your account.
                  </p>
                  <input
                    type="file"
                    name="profile_image"
                    accept="image/*"
                    onChange={handleChange}
                    className="mt-3 block w-full text-sm text-gray-600 file:mr-3 file:rounded-xl file:border-0 file:bg-white file:px-3 file:py-2 file:text-[11px] file:font-semibold"
                  />
                </div>
              </div>
            </div>

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

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[16px] bg-[#166534] px-5 text-sm font-semibold text-white transition hover:bg-[#0F4D27] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? <Upload size={15} /> : <Save size={15} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  )
}

export default StaffProfilePage
