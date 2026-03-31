import { supabase } from '../lib/supabase'
import type {
  Technicien,
  TechnicienHabilitation,
  TechnicienAbsence,
  HabilitationRef,
} from '../lib/types'

export async function fetchTechniciens(): Promise<Technicien[]> {
  const { data, error } = await supabase
    .from('techniciens')
    .select('*')
    .order('nom')
  if (error) throw error
  return data
}

export async function createTechnicien(
  tech: Omit<Technicien, 'id' | 'created_at'>
): Promise<Technicien> {
  const { data, error } = await supabase
    .from('techniciens')
    .insert(tech)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTechnicien(
  id: string,
  updates: Partial<Technicien>
): Promise<Technicien> {
  const { data, error } = await supabase
    .from('techniciens')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTechnicien(id: string): Promise<void> {
  const { error } = await supabase.from('techniciens').delete().eq('id', id)
  if (error) throw error
}

// Habilitations reference
export async function fetchHabilitationsRef(): Promise<HabilitationRef[]> {
  const { data, error } = await supabase
    .from('habilitations_ref')
    .select('*')
    .order('categorie, code')
  if (error) throw error
  return data
}

export async function createHabilitationRef(
  hab: Omit<HabilitationRef, 'id'>
): Promise<HabilitationRef> {
  const { data, error } = await supabase
    .from('habilitations_ref')
    .insert(hab)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateHabilitationRef(
  id: string,
  updates: Partial<HabilitationRef>
): Promise<HabilitationRef> {
  const { data, error } = await supabase
    .from('habilitations_ref')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteHabilitationRef(id: string): Promise<void> {
  const { error } = await supabase.from('habilitations_ref').delete().eq('id', id)
  if (error) throw error
}

// Technicien habilitations
export async function fetchTechnicienHabilitations(
  technicienId: string
): Promise<TechnicienHabilitation[]> {
  const { data, error } = await supabase
    .from('technicien_habilitations')
    .select('*, habilitation:habilitations_ref(*)')
    .eq('technicien_id', technicienId)
  if (error) throw error
  return data.map((row: Record<string, unknown>) => ({
    ...row,
    habilitation: row.habilitation as HabilitationRef,
  })) as TechnicienHabilitation[]
}

export async function assignHabilitation(
  technicienId: string,
  habilitationId: string,
  dateObtention?: string,
  dateExpiration?: string
): Promise<TechnicienHabilitation> {
  const { data, error } = await supabase
    .from('technicien_habilitations')
    .insert({
      technicien_id: technicienId,
      habilitation_id: habilitationId,
      date_obtention: dateObtention ?? null,
      date_expiration: dateExpiration ?? null,
    })
    .select('*, habilitation:habilitations_ref(*)')
    .single()
  if (error) throw error
  return data as unknown as TechnicienHabilitation
}

export async function removeHabilitation(id: string): Promise<void> {
  const { error } = await supabase.from('technicien_habilitations').delete().eq('id', id)
  if (error) throw error
}

// Absences
export async function fetchAbsences(technicienId: string): Promise<TechnicienAbsence[]> {
  const { data, error } = await supabase
    .from('technicien_absences')
    .select('*')
    .eq('technicien_id', technicienId)
    .order('debut')
  if (error) throw error
  return data
}

export async function createAbsence(
  absence: Omit<TechnicienAbsence, 'id'>
): Promise<TechnicienAbsence> {
  const { data, error } = await supabase
    .from('technicien_absences')
    .insert(absence)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteAbsence(id: string): Promise<void> {
  const { error } = await supabase.from('technicien_absences').delete().eq('id', id)
  if (error) throw error
}
