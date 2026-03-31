import { useState, useEffect, useCallback } from 'react'
import type { Machine, MachineDisponibilite } from '../lib/types'
import * as machineService from '../services/machineService'

export function useMachines() {
  const [machines, setMachines] = useState<Machine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await machineService.fetchMachines()
      setMachines(data)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const create = async (machine: Omit<Machine, 'id' | 'created_at'>) => {
    const created = await machineService.createMachine(machine)
    setMachines((prev) => [...prev, created].sort((a, b) => a.tag.localeCompare(b.tag)))
    return created
  }

  const update = async (id: string, updates: Partial<Machine>) => {
    const updated = await machineService.updateMachine(id, updates)
    setMachines((prev) => prev.map((m) => (m.id === id ? updated : m)))
    return updated
  }

  const remove = async (id: string) => {
    await machineService.deleteMachine(id)
    setMachines((prev) => prev.filter((m) => m.id !== id))
  }

  return { machines, loading, error, reload: load, create, update, remove }
}

export function useDisponibilites(machineId?: string) {
  const [disponibilites, setDisponibilites] = useState<MachineDisponibilite[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await machineService.fetchDisponibilites(machineId)
      setDisponibilites(data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [machineId])

  useEffect(() => { load() }, [load])

  const create = async (dispo: Omit<MachineDisponibilite, 'id' | 'created_at'>) => {
    const created = await machineService.createDisponibilite(dispo)
    setDisponibilites((prev) => [...prev, created])
    return created
  }

  const remove = async (id: string) => {
    await machineService.deleteDisponibilite(id)
    setDisponibilites((prev) => prev.filter((d) => d.id !== id))
  }

  return { disponibilites, loading, reload: load, create, remove }
}
