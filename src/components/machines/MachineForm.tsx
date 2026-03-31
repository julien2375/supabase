import { useState } from 'react'
import type { Machine } from '../../lib/types'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

interface MachineFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (machine: Omit<Machine, 'id' | 'created_at'>) => Promise<void>
  initial?: Machine
}

export default function MachineForm({ open, onClose, onSubmit, initial }: MachineFormProps) {
  const [tag, setTag] = useState(initial?.tag ?? '')
  const [designation, setDesignation] = useState(initial?.designation ?? '')
  const [batiment, setBatiment] = useState(initial?.batiment ?? '')
  const [zone, setZone] = useState(initial?.zone ?? '')
  const [criticite, setCriticite] = useState(initial?.criticite ?? 'Standard')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        tag: tag.trim(),
        designation: designation.trim() || null,
        batiment: batiment.trim() || null,
        zone: zone.trim() || null,
        criticite: criticite as Machine['criticite'],
      })
      onClose()
    } catch {
      // error handled by parent
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full bg-surface-2 border border-surface-3 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent'

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Modifier machine' : 'Ajouter machine'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">TAG *</label>
          <input
            className={inputClass}
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="ex: WFL M35"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Désignation</label>
          <input
            className={inputClass}
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder="Nom complet"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Bâtiment</label>
            <input
              className={inputClass}
              value={batiment}
              onChange={(e) => setBatiment(e.target.value)}
              placeholder="ex: A32"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Zone</label>
            <input
              className={inputClass}
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              placeholder="ex: Zone 1"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Criticité</label>
          <select
            className={inputClass}
            value={criticite}
            onChange={(e) => setCriticite(e.target.value as 'Standard' | 'Critique A' | 'Goulot')}
          >
            <option value="Standard">Standard</option>
            <option value="Critique A">Critique A</option>
            <option value="Goulot">Goulot</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving || !tag.trim()}>
            {saving ? 'Enregistrement...' : initial ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
