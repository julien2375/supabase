import { useState, useEffect, useCallback } from 'react'
import type { OrdreTravail, MachineOTGroup } from '../lib/types'
import * as otService from '../services/otService'

export function useOrdresTravail() {
  const [ots, setOts] = useState<OrdreTravail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await otService.fetchOrdresTravail()
      setOts(data)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { ots, loading, error, reload: load, setOts }
}

export function useOTsByMachine(ots: OrdreTravail[]): MachineOTGroup[] {
  const groups = new Map<string, MachineOTGroup>()

  for (const ot of ots) {
    const machineId = ot.machine_id ?? 'sans-machine'
    if (!groups.has(machineId)) {
      groups.set(machineId, {
        machine: ot.machine ?? {
          id: 'sans-machine',
          tag: 'SANS MACHINE',
          designation: 'OT sans machine assignée',
          batiment: null,
          zone: null,
          criticite: 'Standard',
          created_at: '',
        },
        ots: [],
        totalHeures: 0,
      })
    }
    const group = groups.get(machineId)!
    group.ots.push(ot)
    group.totalHeures += ot.duree_estimee_h ?? 0
  }

  // Sort groups: Goulot first, then Critique A, then Standard
  const criticiteOrder = { Goulot: 0, 'Critique A': 1, Standard: 2 }
  return Array.from(groups.values()).sort(
    (a, b) =>
      (criticiteOrder[a.machine.criticite] ?? 2) -
      (criticiteOrder[b.machine.criticite] ?? 2)
  )
}
