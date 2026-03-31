import { useState, useEffect, useCallback } from 'react'
import type { InterventionPlanifiee } from '../lib/types'
import * as interventionService from '../services/interventionService'

export function useInterventions() {
  const [interventions, setInterventions] = useState<InterventionPlanifiee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await interventionService.fetchInterventions()
      setInterventions(data)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { interventions, loading, error, reload: load, setInterventions }
}
