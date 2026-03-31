import { useState } from 'react'
import type { Technicien } from '../../lib/types'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

interface TechnicienFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (tech: Omit<Technicien, 'id' | 'created_at'>) => Promise<void>
  initial?: Technicien
}

export default function TechnicienForm({ open, onClose, onSubmit, initial }: TechnicienFormProps) {
  const [nom, setNom] = useState(initial?.nom ?? '')
  const [prenom, setPrenom] = useState(initial?.prenom ?? '')
  const [specialite, setSpecialite] = useState(initial?.specialite ?? '')
  const [equipe, setEquipe] = useState(initial?.equipe ?? '')
  const [telephone, setTelephone] = useState(initial?.telephone ?? '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({
        nom: nom.trim(),
        prenom: prenom.trim(),
        specialite: specialite.trim() || null,
        equipe: equipe.trim() || null,
        telephone: telephone.trim() || null,
        actif: initial?.actif ?? true,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full bg-surface-2 border border-surface-3 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent'

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Modifier technicien' : 'Ajouter technicien'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Prénom *</label>
            <input className={inputClass} value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nom *</label>
            <input className={inputClass} value={nom} onChange={(e) => setNom(e.target.value)} required />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Spécialité</label>
          <select className={inputClass} value={specialite} onChange={(e) => setSpecialite(e.target.value)}>
            <option value="">Non défini</option>
            <option value="Mécanique">Mécanique</option>
            <option value="Électricité">Électricité</option>
            <option value="Automatisme">Automatisme</option>
            <option value="Hydraulique">Hydraulique</option>
            <option value="Polyvalent">Polyvalent</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Équipe</label>
            <select className={inputClass} value={equipe} onChange={(e) => setEquipe(e.target.value)}>
              <option value="">Non défini</option>
              <option value="Équipe A">Équipe A</option>
              <option value="Équipe B">Équipe B</option>
              <option value="Journée">Journée</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Téléphone</label>
            <input className={inputClass} value={telephone} onChange={(e) => setTelephone(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
          <Button type="submit" disabled={saving || !nom.trim() || !prenom.trim()}>
            {saving ? 'Enregistrement...' : initial ? 'Modifier' : 'Ajouter'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
