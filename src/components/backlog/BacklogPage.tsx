import { useState, useMemo } from 'react'
import { Upload, BarChart3 } from 'lucide-react'
import { useOrdresTravail, useOTsByMachine } from '../../hooks/useOrdresTravail'
import { formatDuration } from '../../lib/utils'
import Button from '../ui/Button'
import BacklogFilters from './BacklogFilters'
import MachineGroup from './MachineGroup'
import ImportExcel from './ImportExcel'

export default function BacklogPage() {
  const { ots, loading, reload } = useOrdresTravail()
  const [showImport, setShowImport] = useState(false)
  const [selectedOTs, setSelectedOTs] = useState<Set<string>>(new Set())

  // Filters
  const [searchText, setSearchText] = useState('')
  const [batiment, setBatiment] = useState('')
  const [typeOT, setTypeOT] = useState('')
  const [priorite, setPriorite] = useState('')
  const [statut, setStatut] = useState('')

  const filteredOTs = useMemo(() => {
    return ots.filter((ot) => {
      if (searchText) {
        const q = searchText.toLowerCase()
        if (
          !ot.numero_ot.toLowerCase().includes(q) &&
          !(ot.description ?? '').toLowerCase().includes(q)
        )
          return false
      }
      if (batiment && ot.batiment !== batiment) return false
      if (typeOT && ot.type_ot !== typeOT) return false
      if (priorite && ot.priorite !== parseInt(priorite)) return false
      if (statut && ot.statut !== statut) return false
      return true
    })
  }, [ots, searchText, batiment, typeOT, priorite, statut])

  const groups = useOTsByMachine(filteredOTs)

  const batiments = useMemo(() => {
    return [...new Set(ots.map((o) => o.batiment).filter(Boolean))] as string[]
  }, [ots])

  const stats = useMemo(() => {
    const total = ots.length
    const aPlanifier = ots.filter((o) => o.statut === 'À planifier').length
    const chargeTotale = ots.reduce((sum, o) => sum + (o.duree_estimee_h ?? 0), 0)
    const p1 = ots.filter((o) => o.priorite === 1).length
    const p2 = ots.filter((o) => o.priorite === 2).length
    return { total, aPlanifier, chargeTotale, p1, p2 }
  }, [ots])

  const toggleOT = (id: string) => {
    setSelectedOTs((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (loading) {
    return <div className="text-gray-500 text-center py-12">Chargement du backlog...</div>
  }

  return (
    <div>
      {/* Stats banner */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <div className="bg-surface-1 border border-surface-3 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-gray-500">Total OT</div>
        </div>
        <div className="bg-surface-1 border border-surface-3 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-accent">{stats.aPlanifier}</div>
          <div className="text-xs text-gray-500">À planifier</div>
        </div>
        <div className="bg-surface-1 border border-surface-3 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{formatDuration(stats.chargeTotale)}</div>
          <div className="text-xs text-gray-500">Charge totale</div>
        </div>
        <div className="bg-surface-1 border border-surface-3 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-danger">{stats.p1}</div>
          <div className="text-xs text-gray-500">P1 Urgence</div>
        </div>
        <div className="bg-surface-1 border border-surface-3 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-warning">{stats.p2}</div>
          <div className="text-xs text-gray-500">P2 Important</div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-white">Backlog OT</h1>
        <div className="flex items-center gap-3">
          {selectedOTs.size > 0 && (
            <span className="text-sm text-accent">
              {selectedOTs.size} OT sélectionnés
            </span>
          )}
          <Button onClick={() => setShowImport(true)}>
            <Upload size={16} /> Import Excel
          </Button>
        </div>
      </div>

      <BacklogFilters
        searchText={searchText}
        onSearchChange={setSearchText}
        batiment={batiment}
        onBatimentChange={setBatiment}
        typeOT={typeOT}
        onTypeOTChange={setTypeOT}
        priorite={priorite}
        onPrioriteChange={setPriorite}
        statut={statut}
        onStatutChange={setStatut}
        batiments={batiments}
      />

      {/* Machine groups */}
      <div className="space-y-2">
        {groups.map((group) => (
          <MachineGroup
            key={group.machine.id}
            group={group}
            selectedOTs={selectedOTs}
            onSelectOT={toggleOT}
          />
        ))}
        {groups.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <BarChart3 size={48} className="mx-auto mb-3 opacity-50" />
            <p>Aucun OT trouvé</p>
            <p className="text-sm mt-1">Importez des OT depuis un export Carl</p>
          </div>
        )}
      </div>

      {showImport && (
        <ImportExcel
          open={showImport}
          onClose={() => setShowImport(false)}
          onImportComplete={reload}
        />
      )}
    </div>
  )
}
