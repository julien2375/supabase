import { useState } from 'react'
import { CalendarOff, Plus, Trash2 } from 'lucide-react'
import type { Technicien, TechnicienHabilitation, TechnicienAbsence } from '../../lib/types'
import { useTechnicienAbsences } from '../../hooks/useTechniciens'
import { formatDate } from '../../lib/utils'
import SlideOver from '../ui/SlideOver'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import HabilitationManager from './HabilitationManager'
import AbsenceForm from './AbsenceForm'

interface TechnicienDetailProps {
  open: boolean
  onClose: () => void
  technicien: Technicien
  habilitations: TechnicienHabilitation[]
  onHabilitationsUpdate: () => void
}

export default function TechnicienDetail({
  open,
  onClose,
  technicien,
  habilitations,
  onHabilitationsUpdate,
}: TechnicienDetailProps) {
  const { absences, create: createAbsence, remove: removeAbsence } = useTechnicienAbsences(
    open ? technicien.id : null
  )
  const [showAbsenceForm, setShowAbsenceForm] = useState(false)

  const typeAbsenceColors: Record<string, string> = {
    Congé: '#22C55E',
    Formation: '#3B82F6',
    Maladie: '#EF4444',
    Autre: '#6B7280',
  }

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title={`${technicien.prenom} ${technicien.nom}`}
    >
      <div className="space-y-6">
        {/* Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Spécialité:</span>
            <span className="text-white">{technicien.specialite ?? 'Non défini'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Équipe:</span>
            <span className="text-white">{technicien.equipe ?? '—'}</span>
          </div>
          {technicien.telephone && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Tél:</span>
              <span className="text-white font-mono">{technicien.telephone}</span>
            </div>
          )}
        </div>

        {/* Habilitations */}
        <HabilitationManager
          technicienId={technicien.id}
          habilitations={habilitations}
          onUpdate={onHabilitationsUpdate}
        />

        {/* Absences */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-300">Absences</h4>
            <Button size="sm" variant="ghost" onClick={() => setShowAbsenceForm(true)}>
              <Plus size={14} /> Ajouter
            </Button>
          </div>
          <div className="space-y-2">
            {absences.map((a: TechnicienAbsence) => (
              <div
                key={a.id}
                className="flex items-center justify-between bg-surface-2 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <CalendarOff size={14} className="text-gray-500" />
                  <Badge color={typeAbsenceColors[a.type_absence]}>{a.type_absence}</Badge>
                  <span className="text-xs text-gray-400">
                    {formatDate(a.debut)} → {formatDate(a.fin)}
                  </span>
                </div>
                <button
                  onClick={() => removeAbsence(a.id)}
                  className="text-danger hover:text-red-400"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {absences.length === 0 && (
              <p className="text-xs text-gray-600 text-center py-2">Aucune absence</p>
            )}
          </div>
        </div>
      </div>

      {showAbsenceForm && (
        <AbsenceForm
          open={showAbsenceForm}
          onClose={() => setShowAbsenceForm(false)}
          technicienId={technicien.id}
          onSubmit={async (a) => { await createAbsence(a) }}
        />
      )}
    </SlideOver>
  )
}
