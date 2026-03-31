import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import type { OrdreTravail } from '../../lib/types'
import { useOTsByMachine } from '../../hooks/useOrdresTravail'
import OTCard from '../backlog/OTCard'

interface BacklogColumnProps {
  ots: OrdreTravail[]
  selectedOTs: Set<string>
  onToggleOT: (id: string) => void
  machineFilter: string
  onMachineFilterChange: (id: string) => void
  machines: { id: string; tag: string }[]
}

export default function BacklogColumn({
  ots,
  selectedOTs,
  onToggleOT,
  machineFilter,
  onMachineFilterChange,
  machines,
}: BacklogColumnProps) {
  const [search, setSearch] = useState('')

  const planifiableOTs = useMemo(
    () => ots.filter((ot) => ot.statut === 'À planifier'),
    [ots]
  )

  const filteredOTs = useMemo(() => {
    return planifiableOTs.filter((ot) => {
      if (machineFilter && ot.machine_id !== machineFilter) return false
      if (search) {
        const q = search.toLowerCase()
        if (
          !ot.numero_ot.toLowerCase().includes(q) &&
          !(ot.description ?? '').toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
  }, [planifiableOTs, machineFilter, search])

  const groups = useOTsByMachine(filteredOTs)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <h3 className="text-sm font-semibold text-white mb-3">Backlog OT</h3>

      <div className="space-y-2 mb-3">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full bg-surface-2 border border-surface-3 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-accent"
          />
        </div>
        <select
          className="w-full bg-surface-2 border border-surface-3 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-accent"
          value={machineFilter}
          onChange={(e) => onMachineFilterChange(e.target.value)}
        >
          <option value="">Toutes machines</option>
          {machines.map((m) => (
            <option key={m.id} value={m.id}>{m.tag}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-auto space-y-1">
        {groups.map((group) => (
          <div key={group.machine.id}>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider px-1 py-1 sticky top-0 bg-surface-0">
              {group.machine.tag} ({group.ots.length})
            </div>
            {group.ots.map((ot) => (
              <div key={ot.id} className="mb-1">
                <OTCard
                  ot={ot}
                  compact
                  selected={selectedOTs.has(ot.id)}
                  onSelect={onToggleOT}
                />
              </div>
            ))}
          </div>
        ))}
        {filteredOTs.length === 0 && (
          <p className="text-xs text-gray-600 text-center py-4">Aucun OT disponible</p>
        )}
      </div>
    </div>
  )
}
