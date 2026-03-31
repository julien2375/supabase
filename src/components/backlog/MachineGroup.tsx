import { useState } from 'react'
import { ChevronDown, ChevronRight, Flame } from 'lucide-react'
import type { MachineOTGroup } from '../../lib/types'
import { CRITICITE_COLORS } from '../../lib/types'
import { formatDuration } from '../../lib/utils'
import Badge from '../ui/Badge'
import OTCard from './OTCard'

interface MachineGroupProps {
  group: MachineOTGroup
  selectedOTs: Set<string>
  onSelectOT: (id: string) => void
  defaultExpanded?: boolean
}

export default function MachineGroup({
  group,
  selectedOTs,
  onSelectOT,
  defaultExpanded = false,
}: MachineGroupProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const { machine, ots, totalHeures } = group

  return (
    <div className="bg-surface-1 border border-surface-3 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-surface-2/50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown size={16} className="text-gray-500" />
          ) : (
            <ChevronRight size={16} className="text-gray-500" />
          )}
          <span className="font-mono text-sm font-semibold text-white">{machine.tag}</span>
          {machine.designation && machine.designation !== machine.tag && (
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
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>
            <span className="text-white font-medium">{ots.length}</span> OT
          </span>
          <span>
            <span className="text-white font-medium">{formatDuration(totalHeures)}</span>
          </span>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-3 space-y-2 border-t border-surface-3 pt-3">
          {ots.map((ot) => (
            <OTCard
              key={ot.id}
              ot={ot}
              selected={selectedOTs.has(ot.id)}
              onSelect={onSelectOT}
            />
          ))}
        </div>
      )}
    </div>
  )
}
