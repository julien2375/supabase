import { useState } from 'react'
import type { TechnicienAbsence } from '../../lib/types'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

interface AbsenceFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (absence: Omit<TechnicienAbsence, 'id'>) => Promise<void>
  technicienId: string
}

export default function AbsenceForm({ open, onClose, onSubmit, technicienId }: AbsenceFormProps) {
  const [typeAbsence, setTypeAbsence] = useState<string>('Congé')
  const [debut, setDebut] = useState('')
  const [fin, setFin] = useState('')
  const [commentaire, setCommentaire] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        technicien_id: technicienId,
        type_absence: typeAbsence as TechnicienAbsence['type_absence'],
        debut: new Date(debut).toISOString(),
        fin: new Date(fin).toISOString(),
        commentaire: commentaire || null,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full bg-surface-2 border border-surface-3 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent'

  return (
    <Modal open={open} onClose={onClose} title="Ajouter une absence">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Type</label>
          <select className={inputClass} value={typeAbsence} onChange={(e) => setTypeAbsence(e.target.value)}>
            <option value="Congé">Congé</option>
            <option value="Formation">Formation</option>
            <option value="Maladie">Maladie</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Début *</label>
            <input type="datetime-local" className={inputClass} value={debut} onChange={(e) => setDebut(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Fin *</label>
            <input type="datetime-local" className={inputClass} value={fin} onChange={(e) => setFin(e.target.value)} required />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Commentaire</label>
          <input className={inputClass} value={commentaire} onChange={(e) => setCommentaire(e.target.value)} />
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit" disabled={saving || !debut || !fin}>
            {saving ? 'Enregistrement...' : 'Ajouter'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
