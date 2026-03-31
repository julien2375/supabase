import { useState } from 'react'
import { format, startOfWeek, addDays, parseISO, isWithinInterval } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Trash2, Plus } from 'lucide-react'
import type { MachineDisponibilite } from '../../lib/types'
import Button from '../ui/Button'
import Modal from '../ui/Modal'

interface DisponibiliteTimelineProps {
  machineId: string
  disponibilites: MachineDisponibilite[]
  onAdd: (dispo: Omit<MachineDisponibilite, 'id' | 'created_at'>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  weekStart?: Date
}

export default function DisponibiliteTimeline({
  machineId,
  disponibilites,
  onAdd,
  onDelete,
  weekStart: propWeekStart,
}: DisponibiliteTimelineProps) {
  const weekStart = propWeekStart ?? startOfWeek(new Date(), { weekStartsOn: 1 })
  const days = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i))
  const [showForm, setShowForm] = useState(false)
  const [formDebut, setFormDebut] = useState('')
  const [formFin, setFormFin] = useState('')
  const [formComment, setFormComment] = useState('')

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    await onAdd({
      machine_id: machineId,
      debut: new Date(formDebut).toISOString(),
      fin: new Date(formFin).toISOString(),
      commentaire: formComment || null,
      created_by: null,
    })
    setShowForm(false)
    setFormDebut('')
    setFormFin('')
    setFormComment('')
  }

  const inputClass =
    'w-full bg-surface-2 border border-surface-3 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent'

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-300">Créneaux de disponibilité</h4>
        <Button size="sm" variant="ghost" onClick={() => setShowForm(true)}>
          <Plus size={14} /> Ajouter
        </Button>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-5 gap-1 text-xs">
        {days.map((day) => (
          <div key={day.toISOString()} className="text-center text-gray-500 pb-1">
            {format(day, 'EEE dd/MM', { locale: fr })}
          </div>
        ))}
        {days.map((day) => {
          const dayDispos = disponibilites.filter((d) => {
            const dStart = parseISO(d.debut)
            const dEnd = parseISO(d.fin)
            return (
              isWithinInterval(day, { start: dStart, end: dEnd }) ||
              isWithinInterval(addDays(day, 1), { start: dStart, end: dEnd }) ||
              (dStart >= day && dStart < addDays(day, 1))
            )
          })
          return (
            <div
              key={day.toISOString() + '-content'}
              className="bg-surface-2 rounded p-1 min-h-[60px]"
            >
              {dayDispos.map((d) => (
                <div
                  key={d.id}
                  className="bg-success/20 border border-success/30 rounded px-1 py-0.5 mb-1 text-[10px] text-success flex items-center justify-between group"
                >
                  <span>
                    {format(parseISO(d.debut), 'HH:mm')} - {format(parseISO(d.fin), 'HH:mm')}
                  </span>
                  <button
                    onClick={() => onDelete(d.id)}
                    className="opacity-0 group-hover:opacity-100 text-danger"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Ajouter un créneau">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Début *</label>
            <input
              type="datetime-local"
              className={inputClass}
              value={formDebut}
              onChange={(e) => setFormDebut(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Fin *</label>
            <input
              type="datetime-local"
              className={inputClass}
              value={formFin}
              onChange={(e) => setFormFin(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Commentaire</label>
            <input
              className={inputClass}
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              placeholder="ex: Arrêt production confirmé"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={!formDebut || !formFin}>
              Ajouter
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
