import { useState, useMemo, useCallback } from 'react'
import { useOrdresTravail } from '../../hooks/useOrdresTravail'
import { useMachines, useDisponibilites } from '../../hooks/useMachines'
import { useTechniciens } from '../../hooks/useTechniciens'
import { createIntervention } from '../../services/interventionService'
import type { Technicien } from '../../lib/types'
import BacklogColumn from './BacklogColumn'
import CompositionZone from './CompositionZone'
import TechnicienColumn from './TechnicienColumn'

export default function ComposerPage() {
  const { ots, reload: reloadOTs } = useOrdresTravail()
  const { machines } = useMachines()
  const { disponibilites } = useDisponibilites()
  const { techniciens } = useTechniciens()

  const [selectedMachineId, setSelectedMachineId] = useState('')
  const [selectedDispoId, setSelectedDispoId] = useState('')
  const [selectedOTIds, setSelectedOTIds] = useState<Set<string>>(new Set())
  const [assignedTechs, setAssignedTechs] = useState<Technicien[]>([])
  const [backlogMachineFilter, setBacklogMachineFilter] = useState('')
  const [validating, setValidating] = useState(false)

  const selectedOTs = useMemo(
    () => ots.filter((ot) => selectedOTIds.has(ot.id)),
    [ots, selectedOTIds]
  )

  const allMachineOTs = useMemo(
    () => ots.filter((ot) => ot.machine_id === selectedMachineId),
    [ots, selectedMachineId]
  )

  const requiredCompetences = useMemo(() => {
    const all = new Set<string>()
    for (const ot of selectedOTs) {
      for (const c of ot.competences_requises ?? []) {
        all.add(c)
      }
    }
    return Array.from(all)
  }, [selectedOTs])

  const selectedDispo = disponibilites.find((d) => d.id === selectedDispoId)

  const toggleOT = useCallback((id: string) => {
    setSelectedOTIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleAutoFill = useCallback((otIds: string[]) => {
    setSelectedOTIds((prev) => {
      const next = new Set(prev)
      for (const id of otIds) next.add(id)
      return next
    })
  }, [])

  const handleMachineChange = (id: string) => {
    setSelectedMachineId(id)
    setSelectedDispoId('')
    setBacklogMachineFilter(id)
  }

  const handleAssignTech = (tech: Technicien) => {
    setAssignedTechs((prev) => {
      if (prev.find((t) => t.id === tech.id)) return prev
      return [...prev, tech]
    })
  }

  const handleRemoveTech = (id: string) => {
    setAssignedTechs((prev) => prev.filter((t) => t.id !== id))
  }

  const handleValidate = async () => {
    if (!selectedMachineId || !selectedDispoId || selectedOTs.length === 0 || assignedTechs.length === 0) return

    setValidating(true)
    try {
      const machine = machines.find((m) => m.id === selectedMachineId)
      const titre = `${machine?.tag ?? 'Machine'} — ${selectedOTs.length} OT`

      await createIntervention({
        titre,
        machine_id: selectedMachineId,
        disponibilite_id: selectedDispoId,
        debut: selectedDispo!.debut,
        fin: selectedDispo!.fin,
        ot_ids: selectedOTs.map((ot) => ot.id),
        technicien_ids: assignedTechs.map((t) => ({ id: t.id })),
      })

      // Reset
      setSelectedOTIds(new Set())
      setAssignedTechs([])
      setSelectedDispoId('')
      await reloadOTs()
    } catch (err) {
      alert('Erreur: ' + (err as Error).message)
    } finally {
      setValidating(false)
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <h1 className="text-xl font-bold text-white mb-4">Composer une intervention</h1>

      <div className="grid grid-cols-[280px_1fr_300px] gap-4 h-[calc(100%-3rem)]">
        {/* Left: Backlog */}
        <div className="bg-surface-0 border border-surface-3 rounded-lg p-3 overflow-hidden">
          <BacklogColumn
            ots={ots}
            selectedOTs={selectedOTIds}
            onToggleOT={toggleOT}
            machineFilter={backlogMachineFilter}
            onMachineFilterChange={setBacklogMachineFilter}
            machines={machines.map((m) => ({ id: m.id, tag: m.tag }))}
          />
        </div>

        {/* Center: Composition */}
        <div className="bg-surface-0 border border-surface-3 rounded-lg p-3 overflow-hidden">
          <CompositionZone
            selectedMachineId={selectedMachineId}
            onMachineChange={handleMachineChange}
            selectedDispoId={selectedDispoId}
            onDispoChange={setSelectedDispoId}
            selectedOTs={selectedOTs}
            allMachineOTs={allMachineOTs}
            onRemoveOT={toggleOT}
            onAutoFill={handleAutoFill}
            machines={machines}
            disponibilites={disponibilites}
            assignedTechniciens={assignedTechs.map((t) => ({
              id: t.id,
              nom: t.nom,
              prenom: t.prenom,
            }))}
            onRemoveTechnicien={handleRemoveTech}
            onValidate={handleValidate}
            validating={validating}
          />
        </div>

        {/* Right: Techniciens */}
        <div className="bg-surface-0 border border-surface-3 rounded-lg p-3 overflow-hidden">
          <TechnicienColumn
            techniciens={techniciens}
            requiredCompetences={requiredCompetences}
            slotDebut={selectedDispo?.debut ?? null}
            slotFin={selectedDispo?.fin ?? null}
            assignedIds={new Set(assignedTechs.map((t) => t.id))}
            onAssign={handleAssignTech}
          />
        </div>
      </div>
    </div>
  )
}
