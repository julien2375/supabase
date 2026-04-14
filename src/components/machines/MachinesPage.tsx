import { useState } from 'react'
import { Plus, Pencil, Trash2, Flame, PackagePlus } from 'lucide-react'
import { useMachines, useDisponibilites } from '../../hooks/useMachines'
import type { Machine } from '../../lib/types'
import { CRITICITE_COLORS } from '../../lib/types'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import MachineForm from './MachineForm'
import DisponibiliteTimeline from './DisponibiliteTimeline'
import PDRRequestForm from './PDRRequestForm'

export default function MachinesPage() {
  const { machines, loading, create, update, remove } = useMachines()
  const { disponibilites, create: createDispo, remove: removeDispo } = useDisponibilites()
  const [showForm, setShowForm] = useState(false)
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [pdrMachineId, setPdrMachineId] = useState<string | null>(null)

  if (loading) {
    return <div className="text-gray-500 text-center py-12">Chargement des machines...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Machines</h1>
          <p className="text-sm text-gray-500 mt-1">{machines.length} machines dans le périmètre</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} /> Ajouter machine
        </Button>
      </div>

      <div className="space-y-2">
        {machines.map((machine) => {
          const isExpanded = expandedId === machine.id
          const machinDispos = disponibilites.filter((d) => d.machine_id === machine.id)

          return (
            <div
              key={machine.id}
              className="bg-surface-1 border border-surface-3 rounded-lg overflow-hidden"
            >
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-surface-2"
                onClick={() => setExpandedId(isExpanded ? null : machine.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-semibold text-white">
                    {machine.tag}
                  </span>
                  {machine.designation && (
                    <span className="text-sm text-gray-400">{machine.designation}</span>
                  )}
                  <Badge color={CRITICITE_COLORS[machine.criticite]}>
                    {machine.criticite === 'Goulot' && <Flame size={12} className="mr-1" />}
                    {machine.criticite}
                  </Badge>
                  {machine.batiment && (
                    <span className="text-xs text-gray-500">Bât. {machine.batiment}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {machinDispos.length} créneau{machinDispos.length !== 1 ? 'x' : ''}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setPdrMachineId(machine.id)
                    }}
                    className="p-1 text-gray-500 hover:text-accent"
                    title="Demander une PDR"
                  >
                    <PackagePlus size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingMachine(machine)
                    }}
                    className="p-1 text-gray-500 hover:text-gray-300"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm(`Supprimer ${machine.tag} ?`)) remove(machine.id)
                    }}
                    className="p-1 text-gray-500 hover:text-danger"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-surface-3 pt-3">
                  <DisponibiliteTimeline
                    machineId={machine.id}
                    disponibilites={machinDispos}
                    onAdd={async (d) => { await createDispo(d) }}
                    onDelete={async (id) => { await removeDispo(id) }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showForm && (
        <MachineForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={async (m) => { await create(m) }}
        />
      )}

      {editingMachine && (
        <MachineForm
          open={!!editingMachine}
          onClose={() => setEditingMachine(null)}
          initial={editingMachine}
          onSubmit={async (m) => { await update(editingMachine.id, m) }}
        />
      )}

      {pdrMachineId && (
        <PDRRequestForm
          open={!!pdrMachineId}
          onClose={() => setPdrMachineId(null)}
          machines={machines}
          initialMachineId={pdrMachineId}
        />
      )}
    </div>
  )
}
