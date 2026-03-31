import { useMemo } from 'react'
import { Zap } from 'lucide-react'
import type { OrdreTravail, Machine, MachineDisponibilite } from '../../lib/types'
import { formatDateTime, getSlotDurationHours, greedyOTPack } from '../../lib/utils'
import ProgressBar from '../ui/ProgressBar'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import OTCard from '../backlog/OTCard'

interface CompositionZoneProps {
  selectedMachineId: string
  onMachineChange: (id: string) => void
  selectedDispoId: string
  onDispoChange: (id: string) => void
  selectedOTs: OrdreTravail[]
  allMachineOTs: OrdreTravail[]
  onRemoveOT: (id: string) => void
  onAutoFill: (otIds: string[]) => void
  machines: Machine[]
  disponibilites: MachineDisponibilite[]
  assignedTechniciens: { id: string; nom: string; prenom: string; role?: string }[]
  onRemoveTechnicien: (id: string) => void
  onValidate: () => void
  validating: boolean
}

export default function CompositionZone({
  selectedMachineId,
  onMachineChange,
  selectedDispoId,
  onDispoChange,
  selectedOTs,
  allMachineOTs,
  onRemoveOT,
  onAutoFill,
  machines,
  disponibilites,
  assignedTechniciens,
  onRemoveTechnicien,
  onValidate,
  validating,
}: CompositionZoneProps) {
  const machineDispos = disponibilites.filter((d) => d.machine_id === selectedMachineId)
  const selectedDispo = machineDispos.find((d) => d.id === selectedDispoId)

  const totalDuree = selectedOTs.reduce((sum, ot) => sum + (ot.duree_estimee_h ?? 0), 0)
  const slotDuree = selectedDispo
    ? getSlotDurationHours(selectedDispo.debut, selectedDispo.fin)
    : 0

  // Aggregate required competences
  const requiredCompetences = useMemo(() => {
    const all = new Set<string>()
    for (const ot of selectedOTs) {
      for (const c of ot.competences_requises ?? []) {
        all.add(c)
      }
    }
    return Array.from(all)
  }, [selectedOTs])

  const handleAutoFill = () => {
    const available = allMachineOTs.filter(
      (ot) => ot.statut === 'À planifier' && !selectedOTs.find((s) => s.id === ot.id)
    )
    const optimalIds = greedyOTPack(
      available.map((ot) => ({
        id: ot.id,
        priorite: ot.priorite,
        duree_estimee_h: ot.duree_estimee_h,
      })),
      slotDuree - totalDuree
    )
    onAutoFill(optimalIds)
  }

  const selectClass =
    'w-full bg-surface-2 border border-surface-3 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent'

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <h3 className="text-sm font-semibold text-white mb-3">Composition</h3>

      {/* Machine & slot selection */}
      <div className="space-y-2 mb-4">
        <select className={selectClass} value={selectedMachineId} onChange={(e) => onMachineChange(e.target.value)}>
          <option value="">Sélectionner une machine...</option>
          {machines.map((m) => (
            <option key={m.id} value={m.id}>{m.tag} — {m.designation ?? ''}</option>
          ))}
        </select>

        {selectedMachineId && (
          <select className={selectClass} value={selectedDispoId} onChange={(e) => onDispoChange(e.target.value)}>
            <option value="">Sélectionner un créneau...</option>
            {machineDispos.map((d) => (
              <option key={d.id} value={d.id}>
                {formatDateTime(d.debut)} → {formatDateTime(d.fin)} ({getSlotDurationHours(d.debut, d.fin).toFixed(1)}h)
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Duration bar */}
      {selectedDispo && (
        <div className="mb-4">
          <ProgressBar value={totalDuree} max={slotDuree} showLabel />
        </div>
      )}

      {/* Selected OTs */}
      <div className="flex-1 overflow-auto space-y-1 mb-4">
        {selectedOTs.length === 0 ? (
          <div className="text-center py-8 text-gray-600 text-xs">
            Sélectionnez des OT depuis le backlog
          </div>
        ) : (
          selectedOTs.map((ot) => (
            <div key={ot.id} className="relative group">
              <OTCard ot={ot} compact />
              <button
                onClick={() => onRemoveOT(ot.id)}
                className="absolute top-1 right-1 text-[10px] text-danger opacity-0 group-hover:opacity-100 bg-surface-2 rounded px-1"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* Auto-fill suggestion */}
      {selectedDispo && selectedMachineId && (
        <Button size="sm" variant="secondary" onClick={handleAutoFill} className="mb-3 w-full">
          <Zap size={14} /> Remplissage optimal
        </Button>
      )}

      {/* Required competences */}
      {requiredCompetences.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] text-gray-500 uppercase mb-1">Compétences requises</p>
          <div className="flex flex-wrap gap-1">
            {requiredCompetences.map((c) => (
              <Badge key={c} variant="outline" color="#F59E0B">{c}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Assigned technicians */}
      {assignedTechniciens.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] text-gray-500 uppercase mb-1">Techniciens assignés</p>
          <div className="space-y-1">
            {assignedTechniciens.map((t) => (
              <div key={t.id} className="flex items-center justify-between bg-surface-2 rounded px-2 py-1 text-xs group">
                <span className="text-white">{t.prenom} {t.nom}</span>
                <button
                  onClick={() => onRemoveTechnicien(t.id)}
                  className="text-danger opacity-0 group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validate button */}
      <Button
        className="w-full"
        onClick={onValidate}
        disabled={
          validating ||
          selectedOTs.length === 0 ||
          !selectedMachineId ||
          !selectedDispoId ||
          assignedTechniciens.length === 0
        }
      >
        {validating ? 'Création...' : 'Valider l\'intervention'}
      </Button>
    </div>
  )
}
