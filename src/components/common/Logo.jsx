import { HeartHandshake } from 'lucide-react'

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-800 text-white">
        <HeartHandshake size={20} />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900">NGO Platform</p>
        <p className="text-xs text-gray-500">Support • Impact • Hope</p>
      </div>
    </div>
  )
}

export default Logo