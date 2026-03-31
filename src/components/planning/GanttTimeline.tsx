import { useMemo } from 'react'
import { format, addDays, parseISO, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Machine, InterventionPlanifiee, MachineDisponibilite } from '../../lib/types'
import InterventionBlock from './InterventionBlock'

interface GanttTimelineProps {
  weekStart: Date
  machines: Machine[]
  interventions: InterventionPlanifiee[]
  disponibilites: MachineDisponibilite[]
  onInterventionClick?: (intervention: InterventionPlanifiee) => void
}

const HOUR_START = 6
const HOUR_END = 22
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)

export default function GanttTimeline({
  weekStart,
  machines,
  interventions,
  disponibilites,
  onInterventionClick,
}: GanttTimelineProps) {
  const days = useMemo(
    () => Array.from({ length: 5 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  )

  // Group machines by batiment
  const groupedMachines = useMemo(() => {
    const groups = new Map<string, Machine[]>()
    for (const m of machines) {
      const key = m.batiment ?? 'Autre'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(m)
    }
    return groups
  }, [machines])

  return (
    <div className="overflow-auto">
      {days.map((day) => (
        <div key={day.toISOString()} className="mb-6">
          <h3 className="text-sm font-semibold text-white mb-2 sticky left-0">
            {format(day, 'EEEE dd MMMM', { locale: fr })}
          </h3>

          <div className="min-w-[900px]">
            {/* Hour headers */}
            <div className="flex border-b border-surface-3 ml-36">
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="flex-1 text-center text-[10px] text-gray-500 py-1 border-l border-surface-3"
                >
                  {h}:00
                </div>
              ))}
            </div>

            {/* Machine rows */}
            {Array.from(groupedMachines.entries()).map(([batiment, bMachines]) => (
              <div key={batiment}>
                <div className="text-[10px] text-gray-600 uppercase tracking-wider px-2 py-1 bg-surface-0 sticky left-0">
                  Bât. {batiment}
                </div>
                {bMachines.map((machine) => {
                  const dayInterventions = interventions.filter(
                    (i) =>
                      i.machine_id === machine.id &&
                      isSameDay(parseISO(i.debut), day)
                  )
                  const dayDispos = disponibilites.filter(
                    (d) =>
                      d.machine_id === machine.id &&
                      isSameDay(parseISO(d.debut), day)
                  )

                  return (
                    <div key={machine.id} className="flex border-b border-surface-3/50">
                      <div className="w-36 shrink-0 px-2 py-2 text-xs text-gray-400 truncate border-r border-surface-3">
                        <span className="font-mono text-white">{machine.tag}</span>
                      </div>
                      <div className="flex-1 relative h-10">
                        {/* Disponibilite backgrounds */}
                        {dayDispos.map((d) => {
                          const dStart = parseISO(d.debut)
                          const dEnd = parseISO(d.fin)
                          const startH = Math.max(dStart.getHours() + dStart.getMinutes() / 60, HOUR_START)
                          const endH = Math.min(dEnd.getHours() + dEnd.getMinutes() / 60, HOUR_END)
                          const totalH = HOUR_END - HOUR_START
                          const left = ((startH - HOUR_START) / totalH) * 100
                          const width = ((endH - startH) / totalH) * 100
                          return (
                            <div
                              key={d.id}
                              className="absolute top-0 bottom-0 bg-success/10 border border-success/20 rounded"
                              style={{ left: `${left}%`, width: `${width}%` }}
                            />
                          )
                        })}

                        {/* Hour grid lines */}
                        {HOURS.map((h) => (
                          <div
                            key={h}
                            className="absolute top-0 bottom-0 border-l border-surface-3/30"
                            style={{
                              left: `${((h - HOUR_START) / (HOUR_END - HOUR_START)) * 100}%`,
                            }}
                          />
                        ))}

                        {/* Intervention blocks */}
                        {dayInterventions.map((intervention) => (
                          <InterventionBlock
                            key={intervention.id}
                            intervention={intervention}
                            hourStart={HOUR_START}
                            hourEnd={HOUR_END}
                            onClick={() => onInterventionClick?.(intervention)}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
