import { supabase } from '../lib/supabase'
import type { InterventionPlanifiee } from '../lib/types'

export async function fetchInterventions(): Promise<InterventionPlanifiee[]> {
  const { data, error } = await supabase
    .from('interventions_planifiees')
    .select(`
      *,
      machine:machines(*),
      intervention_ots(*, ot:ordres_travail(*)),
      intervention_techniciens(*, technicien:techniciens(*))
    `)
    .order('debut')
  if (error) throw error
  // Reshape the data
  return (data as unknown[]).map((row: unknown) => {
    const r = row as Record<string, unknown>
    const iotList = r.intervention_ots as Array<Record<string, unknown>> | null
    const itList = r.intervention_techniciens as Array<Record<string, unknown>> | null
    return {
      ...r,
      ots: iotList?.map((iot) => iot.ot) ?? [],
      techniciens: itList?.map((it) => it.technicien) ?? [],
    }
  }) as unknown as InterventionPlanifiee[]
}

export interface CreateInterventionParams {
  titre: string
  machine_id: string
  disponibilite_id?: string
  debut: string
  fin: string
  commentaire?: string
  created_by?: string
  ot_ids: string[]
  technicien_ids: { id: string; role?: string }[]
}

export async function createIntervention(
  params: CreateInterventionParams
): Promise<InterventionPlanifiee> {
  // 1. Create intervention
  const { data: intervention, error: intError } = await supabase
    .from('interventions_planifiees')
    .insert({
      titre: params.titre,
      machine_id: params.machine_id,
      disponibilite_id: params.disponibilite_id ?? null,
      debut: params.debut,
      fin: params.fin,
      commentaire: params.commentaire ?? null,
      created_by: params.created_by ?? null,
    })
    .select()
    .single()
  if (intError) throw intError

  // 2. Link OTs
  if (params.ot_ids.length > 0) {
    const otLinks = params.ot_ids.map((ot_id, i) => ({
      intervention_id: intervention.id,
      ot_id,
      ordre: i,
    }))
    const { error: otError } = await supabase.from('intervention_ots').insert(otLinks)
    if (otError) throw otError

    // Update OT statuses
    const { error: statusError } = await supabase
      .from('ordres_travail')
      .update({ statut: 'Planifié' })
      .in('id', params.ot_ids)
    if (statusError) throw statusError
  }

  // 3. Link technicians
  if (params.technicien_ids.length > 0) {
    const techLinks = params.technicien_ids.map((t) => ({
      intervention_id: intervention.id,
      technicien_id: t.id,
      role: t.role ?? null,
    }))
    const { error: techError } = await supabase
      .from('intervention_techniciens')
      .insert(techLinks)
    if (techError) throw techError
  }

  return intervention as InterventionPlanifiee
}

export async function updateIntervention(
  id: string,
  updates: Partial<InterventionPlanifiee>
): Promise<InterventionPlanifiee> {
  const { data, error } = await supabase
    .from('interventions_planifiees')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as InterventionPlanifiee
}

export async function deleteIntervention(id: string): Promise<void> {
  // Get linked OTs to reset their status
  const { data: links } = await supabase
    .from('intervention_ots')
    .select('ot_id')
    .eq('intervention_id', id)

  if (links && links.length > 0) {
    const otIds = links.map((l: { ot_id: string }) => l.ot_id)
    await supabase
      .from('ordres_travail')
      .update({ statut: 'À planifier' })
      .in('id', otIds)
  }

  const { error } = await supabase
    .from('interventions_planifiees')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// Check if technicien has conflict on a time slot
export async function checkTechnicienConflict(
  technicienId: string,
  debut: string,
  fin: string,
  excludeInterventionId?: string
): Promise<boolean> {
  let query = supabase
    .from('intervention_techniciens')
    .select('intervention:interventions_planifiees!inner(id, debut, fin, statut)')
    .eq('technicien_id', technicienId)
    .neq('intervention.statut', 'Annulé')
    .lt('intervention.debut', fin)
    .gt('intervention.fin', debut)

  if (excludeInterventionId) {
    query = query.neq('intervention_id', excludeInterventionId)
  }

  const { data, error } = await query
  if (error) return false
  return (data?.length ?? 0) > 0
}

// Check if OT is already assigned to an active intervention
export async function checkOTAssigned(
  otId: string,
  excludeInterventionId?: string
): Promise<boolean> {
  let query = supabase
    .from('intervention_ots')
    .select('intervention:interventions_planifiees!inner(id, statut)')
    .eq('ot_id', otId)
    .neq('intervention.statut', 'Annulé')

  if (excludeInterventionId) {
    query = query.neq('intervention_id', excludeInterventionId)
  }

  const { data, error } = await query
  if (error) return false
  return (data?.length ?? 0) > 0
}
