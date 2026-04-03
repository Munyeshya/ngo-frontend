import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

function getToastIcon(type) {
  if (type === 'success') return CheckCircle2
  if (type === 'error') return AlertCircle
  return Info
}

function getToastTone(type) {
  if (type === 'success') return 'border-green-200 bg-white text-green-800'
  if (type === 'error') return 'border-red-200 bg-white text-red-700'
  return 'border-gray-200 bg-white text-gray-700'
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    ({ type = 'info', message, duration = 5000 }) => {
      if (!message) return

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

      setToasts((current) => [...current, { id, type, message }])

      window.setTimeout(() => {
        dismissToast(id)
      }, duration)
    },
    [dismissToast]
  )

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
    }),
    [showToast, dismissToast]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[90] flex w-[min(92vw,22rem)] flex-col gap-2">
        {toasts.map((toast) => {
          const Icon = getToastIcon(toast.type)

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto border px-4 py-3 shadow-[0_18px_50px_rgba(15,23,42,0.14)] ${getToastTone(toast.type)}`}
            >
              <div className="flex items-start gap-3">
                <Icon size={18} className="mt-0.5 shrink-0" />
                <p className="min-w-0 flex-1 text-sm leading-6">{toast.message}</p>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="inline-flex h-6 w-6 items-center justify-center text-current/70 transition hover:bg-black/5 hover:text-current"
                  aria-label="Dismiss notification"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider.')
  }

  return context
}
