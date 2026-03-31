import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  wide?: boolean
}

export default function Modal({ open, onClose, title, children, wide }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div
        ref={ref}
        className={`relative bg-surface-1 border border-surface-3 rounded-xl shadow-2xl p-6 max-h-[90vh] overflow-auto ${
          wide ? 'w-[700px] max-w-[95vw]' : 'w-[480px] max-w-[95vw]'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
