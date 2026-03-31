import { supabase } from '../lib/supabase'
import type { OrdreTravail } from '../lib/types'

export async function fetchOrdresTravail(): Promise<OrdreTravail[]> {
  const { data, error } = await supabase
    .from('ordres_travail')
    .select('*, machine:machines(*)')
    .order('priorite, created_at')
  if (error) throw error
  return data as unknown as OrdreTravail[]
}

export async function createOrdreTravail(
  ot: Omit<OrdreTravail, 'id' | 'created_at' | 'machine'>
): Promise<OrdreTravail> {
  const { data, error } = await supabase
    .from('ordres_travail')
    .insert(ot)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateOrdreTravail(
  id: string,
  updates: Partial<OrdreTravail>
): Promise<OrdreTravail> {
  const { data, error } = await supabase
    .from('ordres_travail')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function bulkInsertOTs(
  ots: Omit<OrdreTravail, 'id' | 'created_at' | 'machine'>[]
): Promise<OrdreTravail[]> {
  const { data, error } = await supabase
    .from('ordres_travail')
    .insert(ots)
    .select()
  if (error) throw error
  return data
}

export async function deleteOrdreTravail(id: string): Promise<void> {
  const { error } = await supabase.from('ordres_travail').delete().eq('id', id)
  if (error) throw error
}
