import { supabase } from '../lib/supabase'
import type { Machine, MachineDisponibilite } from '../lib/types'

export async function fetchMachines(): Promise<Machine[]> {
  const { data, error } = await supabase
    .from('machines')
    .select('*')
    .order('tag')
  if (error) throw error
  return data
}

export async function createMachine(machine: Omit<Machine, 'id' | 'created_at'>): Promise<Machine> {
  const { data, error } = await supabase
    .from('machines')
    .insert(machine)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateMachine(id: string, updates: Partial<Machine>): Promise<Machine> {
  const { data, error } = await supabase
    .from('machines')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteMachine(id: string): Promise<void> {
  const { error } = await supabase.from('machines').delete().eq('id', id)
  if (error) throw error
}

// Disponibilites
export async function fetchDisponibilites(machineId?: string): Promise<MachineDisponibilite[]> {
  let query = supabase.from('machine_disponibilites').select('*').order('debut')
  if (machineId) query = query.eq('machine_id', machineId)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createDisponibilite(
  dispo: Omit<MachineDisponibilite, 'id' | 'created_at'>
): Promise<MachineDisponibilite> {
  const { data, error } = await supabase
    .from('machine_disponibilites')
    .insert(dispo)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteDisponibilite(id: string): Promise<void> {
  const { error } = await supabase.from('machine_disponibilites').delete().eq('id', id)
  if (error) throw error
}
