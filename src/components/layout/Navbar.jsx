import { Link } from 'react-router-dom'
import Logo from '../common/Logo'
import Button from '../ui/Button'

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-gray-700 hover:text-green-800">
            Home
          </Link>
          <Link to="/projects" className="text-sm font-medium text-gray-700 hover:text-green-800">
            Projects
          </Link>
          <Link to="/login">
            <Button variant="primary">Login</Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Navbar