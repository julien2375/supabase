import { supabase } from '../lib/supabase'
import type { PDRDemandeur } from '../lib/types'

export async function fetchDemandeurs(): Promise<PDRDemandeur[]> {
  const { data, error } = await supabase
    .from('pdr_demandeurs')
    .select('*')
    .order('nom')
  if (error) throw error
  return data
}

export async function createDemandeur(nom: string): Promise<PDRDemandeur> {
  const { data, error } = await supabase
    .from('pdr_demandeurs')
    .insert({ nom })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteDemandeur(id: string): Promise<void> {
  const { error } = await supabase.from('pdr_demandeurs').delete().eq('id', id)
  if (error) throw error
}
