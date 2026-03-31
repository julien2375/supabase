import { useLocation } from 'react-router-dom'

const pageTitles: Record<string, string> = {
  '/backlog': 'Backlog OT',
  '/techniciens': 'Techniciens',
  '/machines': 'Machines',
  '/planning': 'Planning',
  '/composer': 'Composer',
}

interface HeaderProps {
  otCount?: number
  chargeTotale?: number
}

export default function Header({ otCount, chargeTotale }: HeaderProps) {
  const location = useLocation()
  const title = pageTitles[location.pathname] ?? 'PlanOT'

  return (
    <header className="h-14 bg-surface-1 border-b border-surface-3 flex items-center justify-between px-6 shrink-0">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <div className="flex items-center gap-4 text-sm">
        {otCount !== undefined && (
          <div className="flex items-center gap-1.5 text-gray-400">
            <span className="bg-accent/20 text-accent px-2 py-0.5 rounded-full font-mono text-xs font-semibold">
              {otCount}
            </span>
            OT à planifier
          </div>
        )}
        {chargeTotale !== undefined && (
          <div className="text-gray-500">
            Charge: <span className="text-gray-300 font-mono">{chargeTotale.toFixed(1)}h</span>
          </div>
        )}
      </div>
    </header>
  )
}
