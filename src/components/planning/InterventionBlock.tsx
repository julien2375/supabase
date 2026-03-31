import { parseISO } from 'date-fns'
import type { InterventionPlanifiee } from '../../lib/types'
import { formatTime } from '../../lib/utils'

interface InterventionBlockProps {
  intervention: InterventionPlanifiee
  hourStart: number
  hourEnd: number
  onClick?: () => void
}

const statusColors: Record<string, string> = {
  Planifié: '#3B82F6',
  'En cours': '#F59E0B',
  Terminé: '#22C55E',
  Annulé: '#6B7280',
}

export default function InterventionBlock({
  intervention,
  hourStart,
  hourEnd,
  onClick,
}: InterventionBlockProps) {
  const debut = parseISO(intervention.debut)
  const fin = parseISO(intervention.fin)

  // Calculate grid position within the day
  const startHour = debut.getHours() + debut.getMinutes() / 60
  const endHour = fin.getHours() + fin.getMinutes() / 60

  // Clamp to visible range
  const clampedStart = Math.max(startHour, hourStart)
  const clampedEnd = Math.min(endHour, hourEnd)

  if (clampedEnd <= clampedStart) return null

  const totalHours = hourEnd - hourStart
  const leftPercent = ((clampedStart - hourStart) / totalHours) * 100
  const widthPercent = ((clampedEnd - clampedStart) / totalHours) * 100

  const color = statusColors[intervention.statut] ?? '#3B82F6'
  const techNames = (intervention.techniciens ?? [])
    .map((t) => `${t.prenom?.[0] ?? ''}.${t.nom ?? ''}`)
    .join(', ')

  return (
    <div
      className="absolute top-1 bottom-1 rounded cursor-pointer hover:brightness-110 transition-all overflow-hidden group"
      style={{
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
        backgroundColor: color + '33',
        borderLeft: `3px solid ${color}`,
      }}
      onClick={onClick}
      title={`${intervention.titre}\n${formatTime(intervention.debut)} - ${formatTime(intervention.fin)}\n${techNames}`}
    >
      <div className="px-1.5 py-0.5">
        <div className="text-[10px] font-medium text-white truncate">
          {intervention.titre ?? 'Intervention'}
        </div>
        {techNames && (
          <div className="text-[9px] text-gray-400 truncate">{techNames}</div>
        )}
      </div>
    </div>
  )
}
