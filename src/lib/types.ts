export interface Machine {
  id: string
  tag: string
  designation: string | null
  batiment: string | null
  zone: string | null
  criticite: 'Goulot' | 'Critique A' | 'Standard'
  created_at: string
}

export interface MachineDisponibilite {
  id: string
  machine_id: string
  debut: string
  fin: string
  commentaire: string | null
  created_by: string | null
  created_at: string
}

export interface HabilitationRef {
  id: string
  code: string
  libelle: string
  categorie: string | null
  couleur: string
}

export interface Technicien {
  id: string
  nom: string
  prenom: string
  specialite: string | null
  equipe: string | null
  telephone: string | null
  actif: boolean
  created_at: string
}

export interface TechnicienHabilitation {
  id: string
  technicien_id: string
  habilitation_id: string
  date_obtention: string | null
  date_expiration: string | null
  habilitation?: HabilitationRef
}

export interface TechnicienAbsence {
  id: string
  technicien_id: string
  type_absence: 'Congé' | 'Formation' | 'Maladie' | 'Autre'
  debut: string
  fin: string
  commentaire: string | null
}

export interface OrdreTravail {
  id: string
  numero_ot: string
  machine_id: string | null
  description: string | null
  type_ot: 'CORPAN' | 'CORPL' | 'PREV' | 'MODIF' | 'COR_PLANIF' | string
  priorite: number
  duree_estimee_h: number | null
  competences_requises: string[] | null
  statut: 'À planifier' | 'Planifié' | 'En cours' | 'Terminé' | 'En attente pièces'
  date_creation_gmao: string | null
  date_planifiee_gmao: string | null
  batiment: string | null
  import_batch_id: string | null
  donnees_brutes: Record<string, unknown> | null
  created_at: string
  machine?: Machine
}

export interface InterventionPlanifiee {
  id: string
  titre: string | null
  machine_id: string | null
  disponibilite_id: string | null
  debut: string
  fin: string
  statut: 'Planifié' | 'En cours' | 'Terminé' | 'Annulé'
  commentaire: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  machine?: Machine
  ots?: OrdreTravail[]
  techniciens?: TechnicienWithHabilitations[]
}

export interface InterventionOT {
  id: string
  intervention_id: string
  ot_id: string
  ordre: number
}

export interface InterventionTechnicien {
  id: string
  intervention_id: string
  technicien_id: string
  role: string | null
}

export interface TechnicienWithHabilitations extends Technicien {
  habilitations: TechnicienHabilitation[]
  absences?: TechnicienAbsence[]
}

export interface MachineWithDisponibilites extends Machine {
  disponibilites: MachineDisponibilite[]
}

// OT grouped by machine for backlog view
export interface MachineOTGroup {
  machine: Machine
  ots: OrdreTravail[]
  totalHeures: number
}

export interface PDRDemandeur {
  id: string
  nom: string
  created_at: string
}

// Column mapping for Excel import
export interface ColumnMapping {
  numero_ot: string | null
  equipement: string | null
  description: string | null
  type_ot: string | null
  statut: string | null
  date_creation: string | null
  date_planifiee: string | null
  duree_estimee: string | null
  priorite: string | null
  batiment: string | null
}

// Priority labels
export const PRIORITE_LABELS: Record<number, string> = {
  1: 'P1 - Urgence',
  2: 'P2 - Important',
  3: 'P3 - Courant',
  4: 'P4 - Différable',
}

export const TYPE_OT_COLORS: Record<string, string> = {
  CORPAN: '#EF4444',
  CORPL: '#F97316',
  PREV: '#3B82F6',
  MODIF: '#8B5CF6',
  COR_PLANIF: '#F59E0B',
}

export const CRITICITE_COLORS: Record<string, string> = {
  Goulot: '#EF4444',
  'Critique A': '#F59E0B',
  Standard: '#6B7280',
}
