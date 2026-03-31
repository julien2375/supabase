import { User, AlertTriangle } from 'lucide-react'
import type { TechnicienHabilitation, TechnicienAbsence } from '../../lib/types'
import { isHabilitationValid, isHabilitationExpiringSoon, isTechnicienAvailable } from '../../lib/utils'
import Badge from '../ui/Badge'

interface TechnicienCardProps {
  nom: string
  prenom: string
  specialite: string | null
  equipe: string | null
  habilitations: TechnicienHabilitation[]
  absences: TechnicienAbsence[]
  chargeSemaine?: number
  capaciteSemaine?: number
  onClick?: () => void
}

export default function TechnicienCard({
  nom,
  prenom,
  specialite,
  equipe,
  habilitations,
  absences,
  chargeSemaine = 0,
  capaciteSemaine = 35,
  onClick,
}: TechnicienCardProps) {
  const now = new Date()
  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const isAvailable = isTechnicienAvailable(absences, now.toISOString(), weekEnd.toISOString())

  const validHabs = habilitations.filter(isHabilitationValid)
  const expiringHabs = habilitations.filter(isHabilitationExpiringSoon)
  const chargePercent = capaciteSemaine > 0 ? (chargeSemaine / capaciteSemaine) * 100 : 0

  return (
    <div
      onClick={onClick}
      className="bg-surface-1 border border-surface-3 rounded-lg p-4 hover:border-surface-3/80 hover:bg-surface-2/50 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-surface-2 rounded-full flex items-center justify-center">
            <User size={18} className="text-gray-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              {prenom} {nom}
            </h3>
            <p className="text-xs text-gray-500">
              {specialite ?? 'Non défini'} • {equipe ?? '—'}
            </p>
          </div>
        </div>
        <div
          className={`w-3 h-3 rounded-full ${
            isAvailable ? 'bg-success' : 'bg-danger'
          }`}
          title={isAvailable ? 'Disponible' : 'Absent'}
        />
      </div>

      {/* Habilitations */}
      <div className="flex flex-wrap gap-1 mb-3">
        {validHabs.map((h) => (
          <Badge
            key={h.id}
            color={h.habilitation?.couleur ?? '#6B7280'}
          >
            {h.habilitation?.code ?? '?'}
          </Badge>
        ))}
        {validHabs.length === 0 && (
          <span className="text-xs text-gray-600">Aucune habilitation</span>
        )}
      </div>

      {/* Expiring habilitations warning */}
      {expiringHabs.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-warning mb-2">
          <AlertTriangle size={12} />
          {expiringHabs.length} habilitation{expiringHabs.length > 1 ? 's' : ''} bientôt
          expirée{expiringHabs.length > 1 ? 's' : ''}
        </div>
      )}

      {/* Charge bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-gray-500">
          <span>Charge semaine</span>
          <span>{chargeSemaine.toFixed(0)}h / {capaciteSemaine}h</span>
        </div>
        <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              chargePercent > 100 ? 'bg-danger' : chargePercent > 80 ? 'bg-warning' : 'bg-accent'
            }`}
            style={{ width: `${Math.min(chargePercent, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
