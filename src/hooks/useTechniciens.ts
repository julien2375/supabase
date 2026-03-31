import { useState, useEffect, useCallback } from 'react'
import type { Technicien, TechnicienHabilitation, TechnicienAbsence } from '../lib/types'
import * as technicienService from '../services/technicienService'

export function useTechniciens() {
  const [techniciens, setTechniciens] = useState<Technicien[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await technicienService.fetchTechniciens()
      setTechniciens(data)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const create = async (tech: Omit<Technicien, 'id' | 'created_at'>) => {
    const created = await technicienService.createTechnicien(tech)
    setTechniciens((prev) => [...prev, created].sort((a, b) => a.nom.localeCompare(b.nom)))
    return created
  }

  const update = async (id: string, updates: Partial<Technicien>) => {
    const updated = await technicienService.updateTechnicien(id, updates)
    setTechniciens((prev) => prev.map((t) => (t.id === id ? updated : t)))
    return updated
  }

  const remove = async (id: string) => {
    await technicienService.deleteTechnicien(id)
    setTechniciens((prev) => prev.filter((t) => t.id !== id))
  }

  return { techniciens, loading, error, reload: load, create, update, remove }
}

export function useTechnicienHabilitations(technicienId: string | null) {
  const [habilitations, setHabilitations] = useState<TechnicienHabilitation[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!technicienId) return
    try {
      setLoading(true)
      const data = await technicienService.fetchTechnicienHabilitations(technicienId)
      setHabilitations(data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [technicienId])

  useEffect(() => { load() }, [load])

  return { habilitations, loading, reload: load }
}

export function useTechnicienAbsences(technicienId: string | null) {
  const [absences, setAbsences] = useState<TechnicienAbsence[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!technicienId) return
    try {
      setLoading(true)
      const data = await technicienService.fetchAbsences(technicienId)
      setAbsences(data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [technicienId])

  useEffect(() => { load() }, [load])

  const create = async (absence: Omit<TechnicienAbsence, 'id'>) => {
    const created = await technicienService.createAbsence(absence)
    setAbsences((prev) => [...prev, created])
    return created
  }

  const remove = async (id: string) => {
    await technicienService.deleteAbsence(id)
    setAbsences((prev) => prev.filter((a) => a.id !== id))
  }

  return { absences, loading, reload: load, create, remove }
}
