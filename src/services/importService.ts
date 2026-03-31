import * as XLSX from 'xlsx'
import type { ColumnMapping } from '../lib/types'
import { supabase } from '../lib/supabase'

export interface ParsedRow {
  [key: string]: unknown
}

export interface ImportPreview {
  headers: string[]
  rows: ParsedRow[]
  totalRows: number
}

export function parseExcelFile(file: File): Promise<ImportPreview> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json<ParsedRow>(worksheet)

        if (jsonData.length === 0) {
          reject(new Error('Le fichier est vide'))
          return
        }

        const headers = Object.keys(jsonData[0])
        resolve({
          headers,
          rows: jsonData.slice(0, 10), // preview first 10 rows
          totalRows: jsonData.length,
        })
      } catch {
        reject(new Error('Impossible de lire le fichier Excel'))
      }
    }
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'))
    reader.readAsArrayBuffer(file)
  })
}

export function parseAllRows(file: File): Promise<ParsedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        resolve(XLSX.utils.sheet_to_json<ParsedRow>(worksheet))
      } catch {
        reject(new Error('Impossible de lire le fichier Excel'))
      }
    }
    reader.readAsArrayBuffer(file)
  })
}

// Auto-detect Carl column names
const CARL_MAPPINGS: Record<keyof ColumnMapping, string[]> = {
  numero_ot: ['N° BT', 'N°BT', 'Numéro BT', 'N° OT', 'NumBT', 'BT'],
  equipement: ['Équipement', 'Equipement', 'Machine', 'TAG', 'Code équipement'],
  description: ['Désignation', 'Designation', 'Description', 'Libellé', 'Objet'],
  type_ot: ['Type BT', 'TypeBT', 'Type', 'Nature'],
  statut: ['État', 'Etat', 'Statut', 'Status'],
  date_creation: ['Date création', 'Date creation', 'Créé le', 'Date'],
  date_planifiee: ['Date planifiée', 'Date planif', 'Planifié pour'],
  duree_estimee: ['Temps prévu', 'Durée', 'Temps prévu (h)', 'Heures', 'Durée estimée'],
  priorite: ['Priorité', 'Priorite', 'Prio'],
  batiment: ['Bâtiment', 'Batiment', 'Bât', 'Site'],
}

export function autoDetectMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {
    numero_ot: null,
    equipement: null,
    description: null,
    type_ot: null,
    statut: null,
    date_creation: null,
    date_planifiee: null,
    duree_estimee: null,
    priorite: null,
    batiment: null,
  }

  for (const [field, candidates] of Object.entries(CARL_MAPPINGS)) {
    for (const candidate of candidates) {
      const match = headers.find(
        (h) => h.toLowerCase().trim() === candidate.toLowerCase().trim()
      )
      if (match) {
        mapping[field as keyof ColumnMapping] = match
        break
      }
    }
  }

  return mapping
}

export interface ImportResult {
  imported: number
  machinesCreated: number
  errors: string[]
}

export async function importOTs(
  rows: ParsedRow[],
  mapping: ColumnMapping
): Promise<ImportResult> {
  const batchId = `import_${Date.now()}`
  const errors: string[] = []
  let machinesCreated = 0

  // Get existing machines
  const { data: existingMachines } = await supabase.from('machines').select('id, tag')
  const machineMap = new Map(
    (existingMachines ?? []).map((m: { id: string; tag: string }) => [m.tag.toUpperCase(), m.id])
  )

  const otsToInsert = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const numeroOt = mapping.numero_ot ? String(row[mapping.numero_ot] ?? '').trim() : ''

    if (!numeroOt) {
      errors.push(`Ligne ${i + 2}: N° OT manquant`)
      continue
    }

    const equipementTag = mapping.equipement
      ? String(row[mapping.equipement] ?? '').trim()
      : ''

    let machineId: string | null = null
    if (equipementTag) {
      machineId = machineMap.get(equipementTag.toUpperCase()) ?? null

      if (!machineId) {
        // Create machine
        const batiment = mapping.batiment
          ? String(row[mapping.batiment] ?? '').trim()
          : null
        const { data: newMachine, error: machErr } = await supabase
          .from('machines')
          .insert({
            tag: equipementTag,
            designation: equipementTag,
            batiment: batiment || null,
          })
          .select()
          .single()

        if (machErr) {
          errors.push(`Ligne ${i + 2}: Impossible de créer la machine ${equipementTag}`)
          continue
        }
        machineId = newMachine.id as string
        machineMap.set(equipementTag.toUpperCase(), machineId!)
        machinesCreated++
      }
    }

    const dureeStr = mapping.duree_estimee
      ? String(row[mapping.duree_estimee] ?? '')
      : ''
    const duree = dureeStr ? parseFloat(dureeStr) : null

    const prioriteStr = mapping.priorite
      ? String(row[mapping.priorite] ?? '')
      : ''
    const priorite = prioriteStr ? parseInt(prioriteStr, 10) : 3

    otsToInsert.push({
      numero_ot: numeroOt,
      machine_id: machineId,
      description: mapping.description
        ? String(row[mapping.description] ?? '').trim() || null
        : null,
      type_ot: mapping.type_ot
        ? String(row[mapping.type_ot] ?? '').trim() || null
        : null,
      priorite: isNaN(priorite) ? 3 : priorite,
      duree_estimee_h: duree && !isNaN(duree) ? duree : null,
      statut: 'À planifier' as const,
      date_creation_gmao: mapping.date_creation
        ? String(row[mapping.date_creation] ?? '').trim() || null
        : null,
      date_planifiee_gmao: mapping.date_planifiee
        ? String(row[mapping.date_planifiee] ?? '').trim() || null
        : null,
      batiment: mapping.batiment
        ? String(row[mapping.batiment] ?? '').trim() || null
        : null,
      import_batch_id: batchId,
      donnees_brutes: row as Record<string, unknown>,
      competences_requises: null,
    })
  }

  if (otsToInsert.length > 0) {
    // Insert in batches of 50
    for (let i = 0; i < otsToInsert.length; i += 50) {
      const batch = otsToInsert.slice(i, i + 50)
      const { error } = await supabase.from('ordres_travail').insert(batch)
      if (error) {
        errors.push(`Erreur d'insertion batch ${Math.floor(i / 50) + 1}: ${error.message}`)
      }
    }
  }

  return {
    imported: otsToInsert.length - errors.filter((e) => e.includes("d'insertion")).length,
    machinesCreated,
    errors,
  }
}
