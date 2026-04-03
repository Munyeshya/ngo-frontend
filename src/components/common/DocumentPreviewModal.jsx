import { FileText, Image as ImageIcon, X } from 'lucide-react'

import api from '../../api/axios'
import Card from '../ui/Card'

function getApiOrigin() {
  const baseURL = api?.defaults?.baseURL || ''
  return baseURL.replace(/\/api\/?$/, '')
}

function buildMediaUrl(path) {
  if (!path) return ''
  if (String(path).startsWith('http://') || String(path).startsWith('https://')) {
    return path
  }
  const origin = getApiOrigin()
  return `${origin}${String(path).startsWith('/') ? path : `/${path}`}`
}

function getFileName(path) {
  if (!path) return 'Document'
  return String(path).split('/').pop()
}

function isPdf(path) {
  return /\.pdf($|\?)/i.test(String(path || ''))
}

function DocumentPreviewModal({ open, title, fileUrl, onClose }) {
  if (!open || !fileUrl) return null

  const resolvedUrl = buildMediaUrl(fileUrl)
  const pdf = isPdf(fileUrl)
  const fileName = getFileName(fileUrl)

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 py-6">
      <Card className="flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-[24px] border border-gray-200">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-gray-900">
              {title || 'Document Preview'}
            </p>
            <p className="mt-1 truncate text-[11px] text-gray-500">{fileName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition hover:bg-gray-50"
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden bg-[#F8F8F6] p-4">
          {pdf ? (
            <div className="h-full overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <iframe
                src={resolvedUrl}
                title={title || fileName}
                className="h-[70vh] w-full"
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center overflow-auto rounded-2xl border border-gray-200 bg-white p-4">
              <img
                src={resolvedUrl}
                alt={title || fileName}
                className="max-h-[70vh] max-w-full rounded-xl object-contain"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3 text-[11px] text-gray-500">
          <div className="inline-flex items-center gap-2">
            {pdf ? <FileText size={14} /> : <ImageIcon size={14} />}
            {pdf ? 'PDF preview' : 'Image preview'}
          </div>
          <a
            href={resolvedUrl}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-green-800 hover:text-green-900"
          >
            Open original
          </a>
        </div>
      </Card>
    </div>
  )
}

export default DocumentPreviewModal
