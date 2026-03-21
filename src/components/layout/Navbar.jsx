import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X, ChevronRight } from 'lucide-react'
import Logo from '../common/Logo'
import Button from '../ui/Button'

const navLinks = [
  { name: 'Home', to: '/' },
  { name: 'About', to: '/about' },
  { name: 'Projects', to: '/projects' },
  { name: 'Contact', to: '/contact' },
]

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

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
          <Link to="/login">
            <Button variant="outline">Login</Button>
          </Link>
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
          isOpen ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'
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

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link to="/login" onClick={() => setIsOpen(false)}>
              <Button variant="outline" className="w-full">
                Login
              </Button>
            </Link>
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