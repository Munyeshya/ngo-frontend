import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { HeartHandshake } from 'lucide-react'
import AnimatedBackground from '../common/AnimatedBackground'
import publicApi from '../../api/publicApi'
import endpoints from '../../api/endpoints'

const aboutLinks = [
  { name: 'About Us', to: '/about' },
  { name: 'Projects', to: '/projects' },
  { name: 'Contact Us', to: '/contact' },
  { name: 'Platform Guide', to: '/frontend-guide' },
]

const usefulLinks = [
  { name: 'Staff Application Guide', to: '/staff-guide' },
  { name: 'Create Account', to: '/register' },
  { name: 'Sign In', to: '/login' },
  { name: 'Claim Donor Account', to: '/claim-donor-account' },
]

function normalizeListResponse(data) {
  if (Array.isArray(data)) {
    return {
      results: data,
      next: null,
    }
  }

  if (Array.isArray(data?.results)) {
    return {
      results: data.results,
      next: data.next ?? null,
    }
  }

  if (Array.isArray(data?.data)) {
    return {
      results: data.data,
      next: data.next ?? null,
    }
  }

  if (Array.isArray(data?.data?.results)) {
    return {
      results: data.data.results,
      next: data.data.next ?? null,
    }
  }

  return {
    results: [],
    next: null,
  }
}

function shuffle(items) {
  const copy = [...items]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]]
  }

  return copy
}

function Footer() {
  const [causeImages, setCauseImages] = useState([])

  useEffect(() => {
    let active = true

    async function loadCauseImages() {
      try {
        const collectedImages = []
        let page = 1
        let next = true

        while (next && page <= 10) {
          const response = await publicApi.get(endpoints.projects, {
            params: { page },
          })
          const normalized = normalizeListResponse(response.data)

          normalized.results.forEach((project) => {
            if (project?.feature_image) {
              collectedImages.push({
                id: project.id || `${page}-${collectedImages.length}`,
                title: project.title || 'Project',
                image: project.feature_image,
              })
            }
          })

          next = Boolean(normalized.next)
          page += 1
        }

        if (!active) return

        setCauseImages(shuffle(collectedImages).slice(0, 6))
      } catch {
        if (!active) return
        setCauseImages([])
      }
    }

    loadCauseImages()

    return () => {
      active = false
    }
  }, [])

  return (
    <footer className="relative overflow-hidden bg-black text-white">
      <AnimatedBackground variant="dark" />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <HeartHandshake size={18} className="text-white" />
            <p className="text-sm font-bold tracking-wide">NGO TRANSPARENCY</p>
          </div>

          <p className="mt-5 max-w-xs text-sm leading-7 text-white/70">
            Building trust between donors, communities, and organizations through better project
            visibility, transparent giving, and measurable impact.
          </p>

          <div className="mt-6 space-y-3 text-sm">
            <p className="text-white/85">
              <span className="font-semibold text-white">Phone:</span> +250 788 000 000
            </p>
            <p className="text-white/85">
              <span className="font-semibold text-white">Address:</span> KG 7 Ave, Kigali, Rwanda
            </p>
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
            {causeImages.length > 0
              ? causeImages.map((item) => (
                  <Link
                    key={item.id}
                    to={`/projects/${item.id}`}
                    aria-label={`View ${item.title}`}
                    className="overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-16 w-full object-cover transition duration-300 hover:scale-105"
                    />
                  </Link>
                ))
              : Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`cause-placeholder-${index}`}
                    className="h-16 overflow-hidden rounded-xl bg-white/8"
                  />
                ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-white/50 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© 2026 NGO Transparency. All rights reserved.</p>
          <p>Designed for transparency, accountability, and community impact.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
