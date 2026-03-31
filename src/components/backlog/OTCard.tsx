import { Clock, GripVertical } from 'lucide-react'
import type { OrdreTravail } from '../../lib/types'
import { TYPE_OT_COLORS, PRIORITE_LABELS } from '../../lib/types'
import { formatDuration, cn } from '../../lib/utils'
import Badge from '../ui/Badge'

interface OTCardProps {
  ot: OrdreTravail
  compact?: boolean
  selected?: boolean
  onSelect?: (id: string) => void
  draggable?: boolean
}

const prioriteColors: Record<number, string> = {
  1: '#EF4444',
  2: '#F59E0B',
  3: '#3B82F6',
  4: '#6B7280',
}

export default function OTCard({ ot, compact, selected, onSelect, draggable }: OTCardProps) {
  return (
    <div
      className={cn(
        'bg-surface-2 border rounded-lg transition-colors',
        selected ? 'border-accent bg-accent/10' : 'border-surface-3 hover:border-surface-3/70',
        compact ? 'px-3 py-2' : 'px-4 py-3'
      )}
    >
      <div className="flex items-start gap-2">
        {draggable && (
          <GripVertical size={14} className="text-gray-600 mt-0.5 shrink-0 cursor-grab" />
        )}
        {onSelect && (
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(ot.id)}
            className="mt-1 shrink-0 accent-accent"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-semibold text-white">{ot.numero_ot}</span>
            {ot.type_ot && (
              <Badge color={TYPE_OT_COLORS[ot.type_ot] ?? '#6B7280'}>{ot.type_ot}</Badge>
            )}
            <Badge color={prioriteColors[ot.priorite]} pulse={ot.priorite === 1}>
              {PRIORITE_LABELS[ot.priorite]?.split(' - ')[0] ?? `P${ot.priorite}`}
            </Badge>
            {ot.duree_estimee_h != null && (
              <span className="flex items-center gap-0.5 text-xs text-gray-500">
                <Clock size={10} />
                {formatDuration(ot.duree_estimee_h)}
              </span>
            )}
          </div>
          {!compact && ot.description && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{ot.description}</p>
          )}
          {ot.competences_requises && ot.competences_requises.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {ot.competences_requises.map((c) => (
                <Badge key={c} variant="outline" color="#9CA3AF">
                  {c}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <Badge
          color={
            ot.statut === 'Planifié'
              ? '#22C55E'
              : ot.statut === 'En cours'
                ? '#3B82F6'
                : ot.statut === 'En attente pièces'
                  ? '#F59E0B'
                  : '#6B7280'
          }
        >
          {ot.statut}
        </Badge>
      </div>
    </div>
  )
}
