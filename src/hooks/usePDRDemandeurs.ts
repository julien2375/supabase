import { useState, useEffect, useCallback } from 'react'
import type { PDRDemandeur } from '../lib/types'
import * as pdrDemandeurService from '../services/pdrDemandeurService'

export function usePDRDemandeurs() {
  const [demandeurs, setDemandeurs] = useState<PDRDemandeur[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await pdrDemandeurService.fetchDemandeurs()
      setDemandeurs(data)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const create = async (nom: string) => {
    const created = await pdrDemandeurService.createDemandeur(nom)
    setDemandeurs((prev) => [...prev, created].sort((a, b) => a.nom.localeCompare(b.nom)))
    return created
  }

  const remove = async (id: string) => {
    await pdrDemandeurService.deleteDemandeur(id)
    setDemandeurs((prev) => prev.filter((d) => d.id !== id))
  }

  return { demandeurs, loading, error, reload: load, create, remove }
}
