import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, HeartHandshake } from 'lucide-react'

const aboutLinks = [
  { name: 'About Us', to: '/about' },
  { name: 'Projects', to: '/projects' },
  { name: 'Volunteers', to: '/about' },
  { name: 'Contact Us', to: '/contact' },
]

const usefulLinks = [
  { name: 'F.A.Q', to: '/contact' },
  { name: 'News', to: '/projects' },
  { name: 'Reports', to: '/about' },
  { name: 'Terms of Use', to: '/about' },
  { name: 'Privacy Policy', to: '/about' },
]

const causeImages = [
  'https://images.unsplash.com/photo-1518398046578-8cca57782e17?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1593113598332-cd59a93d7c2b?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1524069290683-0457abfe42c3?auto=format&fit=crop&w=300&q=80',
]

function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <HeartHandshake size={18} className="text-white" />
            <p className="text-sm font-bold tracking-wide">NGO PLATFORM</p>
          </div>

          <p className="mt-5 max-w-xs text-sm leading-7 text-white/70">
            Building trust between donors, communities, and organizations through better project visibility, transparent giving, and measurable impact.
          </p>

          <div className="mt-6 space-y-3 text-sm">
            <p className="text-white/85">
              <span className="font-semibold text-white">Phone:</span> +250 788 000 000
            </p>
            <p className="text-white/85">
              <span className="font-semibold text-white">Address:</span> KG 7 Ave, Kigali, Rwanda
            </p>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <a
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition hover:bg-green-200"
            >
              <Facebook size={16} />
            </a>
            <a
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition hover:bg-green-200"
            >
              <Twitter size={16} />
            </a>
            <a
              href="#"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition hover:bg-green-200"
            >
              <Instagram size={16} />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold">About Us</h3>
          <div className="mt-5 space-y-3">
            {aboutLinks.map((link) => (
              <Link
                key={link.name}
                to={link.to}
                className="block text-sm text-white/70 transition hover:text-white"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Useful Links</h3>
          <div className="mt-5 space-y-3">
            {usefulLinks.map((link) => (
              <Link
                key={link.name}
                to={link.to}
                className="block text-sm text-white/70 transition hover:text-white"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Causes</h3>
          <div className="mt-5 grid grid-cols-3 gap-3">
            {causeImages.map((image, index) => (
              <div key={index} className="overflow-hidden rounded-xl">
                <img
                  src={image}
                  alt={`Cause ${index + 1}`}
                  className="h-16 w-full object-cover transition duration-300 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-white/50 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© 2026 NGO Platform. All rights reserved.</p>
          <p>Designed for transparency, accountability, and community impact.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer