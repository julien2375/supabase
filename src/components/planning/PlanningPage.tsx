import { useState } from 'react'
import { startOfWeek } from 'date-fns'
import { useMachines, useDisponibilites } from '../../hooks/useMachines'
import { useInterventions } from '../../hooks/useInterventions'
import { useRealtimeSubscription } from '../../hooks/useRealtimeSubscription'
import WeekNavigator from './WeekNavigator'
import GanttTimeline from './GanttTimeline'

export default function PlanningPage() {
  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const { machines, loading: machinesLoading } = useMachines()
  const { disponibilites } = useDisponibilites()
  const { interventions, loading: intLoading, reload } = useInterventions()

  // Realtime subscriptions
  useRealtimeSubscription([
    { table: 'interventions_planifiees', onInsert: reload, onUpdate: reload, onDelete: reload },
    { table: 'intervention_ots', onInsert: reload, onUpdate: reload, onDelete: reload },
    { table: 'intervention_techniciens', onInsert: reload, onUpdate: reload, onDelete: reload },
    { table: 'machine_disponibilites', onInsert: reload, onUpdate: reload, onDelete: reload },
  ])

  if (machinesLoading || intLoading) {
    return <div className="text-gray-500 text-center py-12">Chargement du planning...</div>
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-white mb-4">Planning</h1>
      <WeekNavigator weekStart={weekStart} onWeekChange={setWeekStart} />
      <GanttTimeline
        weekStart={weekStart}
        machines={machines}
        interventions={interventions}
        disponibilites={disponibilites}
      />
    </div>
  )
}
