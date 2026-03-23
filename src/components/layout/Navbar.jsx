import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Menu,
  X,
  ChevronRight,
  UserCircle2,
  LayoutDashboard,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-react'
import Logo from '../common/Logo'
import Button from '../ui/Button'
import { clearAuth, getToken, getUser } from '../../utils/storage'
import api from '../../api/axios'
import endpoints from '../../api/endpoints'

const navLinks = [
  { name: 'Home', to: '/' },
  { name: 'About', to: '/about' },
  { name: 'Projects', to: '/projects' },
  { name: 'Contact', to: '/contact' },
]

function getDisplayName(user) {
  if (!user) return 'Account'

  return (
    user.full_name ||
    [user.first_name, user.last_name].filter(Boolean).join(' ').trim() ||
    user.username ||
    user.email ||
    'Account'
  )
}

function getInitials(name) {
  if (!name) return 'A'

  const parts = String(name).trim().split(/\s+/).filter(Boolean)

  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()

  return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
}

function Navbar() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef(null)

  const token = getToken()
  const user = getUser()
  const isLoggedIn = Boolean(token && user)

  const accountLink = useMemo(() => {
    const role = String(user?.role || '').toLowerCase()

    if (role === 'donor') return '/donor/dashboard'
    if (role === 'admin' || role === 'staff') return '/dashboard'

    return '/login'
  }, [user])

  const profileLink = useMemo(() => {
    const role = String(user?.role || '').toLowerCase()

    if (role === 'donor') return '/donor/profile'
    if (role === 'admin' || role === 'staff') return '/dashboard'

    return '/login'
  }, [user])

  const displayName = getDisplayName(user)
  const initials = getInitials(displayName)

  useEffect(() => {
    function handleClickOutside(event) {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  async function handleLogout() {
    try {
      const refresh = localStorage.getItem('ngo_refresh_token')

      if (refresh) {
        await api.post(endpoints.logout, { refresh })
      }
    } catch {
    } finally {
      clearAuth()
      setAccountOpen(false)
      setIsOpen(false)
      navigate('/login', { replace: true })
    }
  }

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition ${
      isActive ? 'text-green-800' : 'text-gray-700 hover:text-green-800'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-green-100 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" onClick={() => setIsOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((item) => (
            <NavLink key={item.name} to={item.to} className={linkClass}>
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isLoggedIn ? (
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                onClick={() => setAccountOpen((prev) => !prev)}
                className="inline-flex h-11 items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-3 text-green-900 transition hover:border-green-300 hover:bg-green-100"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#166534] text-xs font-bold text-white">
                  {initials}
                </div>
                <span className="max-w-[110px] truncate text-sm font-medium">
                  {displayName}
                </span>
                <ChevronDown size={16} />
              </button>

              {accountOpen && (
                <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_20px_60px_rgba(16,24,40,0.12)]">
                  <div className="border-b border-gray-100 px-4 py-4">
                    <p className="truncate text-sm font-semibold text-gray-900">{displayName}</p>
                    <p className="truncate text-xs text-gray-500">{user?.email || user?.username}</p>
                  </div>

                  <div className="p-2">
                    <Link
                      to={accountLink}
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-800"
                    >
                      <LayoutDashboard size={18} />
                      Dashboard
                    </Link>

                    <Link
                      to={profileLink}
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-800"
                    >
                      <User size={18} />
                      Profile
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
          )}

          <Link to="/projects">
            <Button>
              Donate Now <ChevronRight size={16} className="ml-1" />
            </Button>
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 lg:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        className={`overflow-hidden border-t border-green-100 bg-white transition-all duration-300 lg:hidden ${
          isOpen ? 'max-h-[520px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-2">
            {navLinks.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-green-50 text-green-800'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </NavLink>
            ))}
          </div>

          <div className="mt-4 grid gap-3">
            {isLoggedIn ? (
              <>
                <Link to={accountLink} onClick={() => setIsOpen(false)}>
                  <button
                    type="button"
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 text-sm font-medium text-green-800 transition hover:border-green-300 hover:bg-green-100"
                  >
                    <UserCircle2 size={18} />
                    Dashboard
                  </button>
                </Link>

                <Link to={profileLink} onClick={() => setIsOpen(false)}>
                  <button
                    type="button"
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    <User size={18} />
                    Profile
                  </button>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-700 transition hover:bg-red-100"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
            )}

            <Link to="/projects" onClick={() => setIsOpen(false)}>
              <Button className="w-full">Donate Now</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar