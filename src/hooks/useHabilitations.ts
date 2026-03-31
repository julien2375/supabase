import { useState, useEffect, useCallback } from 'react'
import type { HabilitationRef } from '../lib/types'
import * as technicienService from '../services/technicienService'

export function useHabilitations() {
  const [habilitations, setHabilitations] = useState<HabilitationRef[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await technicienService.fetchHabilitationsRef()
      setHabilitations(data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const create = async (hab: Omit<HabilitationRef, 'id'>) => {
    const created = await technicienService.createHabilitationRef(hab)
    setHabilitations((prev) => [...prev, created])
    return created
  }

  const update = async (id: string, updates: Partial<HabilitationRef>) => {
    const updated = await technicienService.updateHabilitationRef(id, updates)
    setHabilitations((prev) => prev.map((h) => (h.id === id ? updated : h)))
    return updated
  }

  const remove = async (id: string) => {
    await technicienService.deleteHabilitationRef(id)
    setHabilitations((prev) => prev.filter((h) => h.id !== id))
  }

  return { habilitations, loading, reload: load, create, update, remove }
}
