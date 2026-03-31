import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { HabilitationRef, TechnicienHabilitation } from '../../lib/types'
import { useHabilitations } from '../../hooks/useHabilitations'
import { isHabilitationValid, isHabilitationExpiringSoon, formatDate } from '../../lib/utils'
import { assignHabilitation, removeHabilitation } from '../../services/technicienService'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import { cn } from '../../lib/utils'

interface HabilitationManagerProps {
  technicienId: string
  habilitations: TechnicienHabilitation[]
  onUpdate: () => void
}

export default function HabilitationManager({
  technicienId,
  habilitations,
  onUpdate,
}: HabilitationManagerProps) {
  const { habilitations: allHabs } = useHabilitations()
  const [showAdd, setShowAdd] = useState(false)
  const [selectedHab, setSelectedHab] = useState('')
  const [dateObtention, setDateObtention] = useState('')
  const [dateExpiration, setDateExpiration] = useState('')

  const existingIds = new Set(habilitations.map((h) => h.habilitation_id))
  const availableHabs = allHabs.filter((h: HabilitationRef) => !existingIds.has(h.id))

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedHab) return
    await assignHabilitation(
      technicienId,
      selectedHab,
      dateObtention || undefined,
      dateExpiration || undefined
    )
    setShowAdd(false)
    setSelectedHab('')
    setDateObtention('')
    setDateExpiration('')
    onUpdate()
  }

  const handleRemove = async (id: string) => {
    await removeHabilitation(id)
    onUpdate()
  }

  const inputClass =
    'w-full bg-surface-2 border border-surface-3 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent'

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-300">Habilitations</h4>
        <Button size="sm" variant="ghost" onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Ajouter
        </Button>
      </div>

      <div className="space-y-2">
        {habilitations.map((h) => {
          const valid = isHabilitationValid(h)
          const expiring = isHabilitationExpiringSoon(h)
          return (
            <div
              key={h.id}
              className={cn(
                'flex items-center justify-between bg-surface-2 rounded-lg px-3 py-2',
                !valid && 'opacity-50'
              )}
            >
              <div className="flex items-center gap-2">
                <Badge color={h.habilitation?.couleur}>
                  {h.habilitation?.code}
                </Badge>
                <span className="text-xs text-gray-400">{h.habilitation?.libelle}</span>
                {!valid && <Badge color="#EF4444">Expirée</Badge>}
                {expiring && valid && <Badge color="#F59E0B">Expire bientôt</Badge>}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {h.date_expiration && <span>Exp: {formatDate(h.date_expiration)}</span>}
                <button onClick={() => handleRemove(h.id)} className="text-danger hover:text-red-400">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          )
        })}
        {habilitations.length === 0 && (
          <p className="text-xs text-gray-600 text-center py-2">Aucune habilitation</p>
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Assigner une habilitation">
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Habilitation</label>
            <select className={inputClass} value={selectedHab} onChange={(e) => setSelectedHab(e.target.value)} required>
              <option value="">Sélectionner...</option>
              {availableHabs.map((h: HabilitationRef) => (
                <option key={h.id} value={h.id}>
                  {h.code} — {h.libelle}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Date obtention</label>
              <input type="date" className={inputClass} value={dateObtention} onChange={(e) => setDateObtention(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Date expiration</label>
              <input type="date" className={inputClass} value={dateExpiration} onChange={(e) => setDateExpiration(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>Annuler</Button>
            <Button type="submit" disabled={!selectedHab}>Assigner</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
