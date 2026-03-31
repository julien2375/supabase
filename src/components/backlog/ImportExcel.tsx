import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { ColumnMapping } from '../../lib/types'
import { parseExcelFile, parseAllRows, autoDetectMapping, importOTs } from '../../services/importService'
import type { ImportPreview, ImportResult } from '../../services/importService'
import Modal from '../ui/Modal'
import Button from '../ui/Button'

interface ImportExcelProps {
  open: boolean
  onClose: () => void
  onImportComplete: () => void
}

type Step = 'upload' | 'preview' | 'importing' | 'result'

export default function ImportExcel({ open, onClose, onImportComplete }: ImportExcelProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [mapping, setMapping] = useState<ColumnMapping>({
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
  })
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setError(null)
    try {
      const prev = await parseExcelFile(f)
      setPreview(prev)
      setMapping(autoDetectMapping(prev.headers))
      setStep('preview')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleImport = async () => {
    if (!file || !mapping.numero_ot) return
    setStep('importing')
    try {
      const allRows = await parseAllRows(file)
      const res = await importOTs(allRows, mapping)
      setResult(res)
      setStep('result')
      onImportComplete()
    } catch (err) {
      setError((err as Error).message)
      setStep('preview')
    }
  }

  const mappingFields: { key: keyof ColumnMapping; label: string; required: boolean }[] = [
    { key: 'numero_ot', label: 'N° OT', required: true },
    { key: 'equipement', label: 'Équipement (TAG machine)', required: true },
    { key: 'description', label: 'Description', required: true },
    { key: 'type_ot', label: 'Type OT', required: true },
    { key: 'priorite', label: 'Priorité', required: false },
    { key: 'duree_estimee', label: 'Durée estimée (h)', required: false },
    { key: 'statut', label: 'Statut', required: false },
    { key: 'date_creation', label: 'Date création', required: false },
    { key: 'date_planifiee', label: 'Date planifiée', required: false },
    { key: 'batiment', label: 'Bâtiment', required: false },
  ]

  const selectClass =
    'bg-surface-2 border border-surface-3 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-accent'

  return (
    <Modal open={open} onClose={onClose} title="Import Excel (GMAO Carl)" wide>
      {step === 'upload' && (
        <div className="text-center py-8">
          <FileSpreadsheet size={48} className="mx-auto text-gray-500 mb-4" />
          <p className="text-sm text-gray-400 mb-4">
            Glissez un fichier Excel (.xlsx, .xls, .csv) ou cliquez pour sélectionner
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button onClick={() => fileRef.current?.click()}>
            <Upload size={16} /> Sélectionner un fichier
          </Button>
          {error && (
            <div className="flex items-center gap-2 text-danger text-sm mt-4 justify-center">
              <AlertCircle size={16} /> {error}
            </div>
          )}
        </div>
      )}

      {step === 'preview' && preview && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">
              Fichier: <span className="text-white">{file?.name}</span>
            </span>
            <span className="text-gray-400">
              <span className="text-white font-medium">{preview.totalRows}</span> lignes détectées
            </span>
          </div>

          {/* Column mapping */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Mapping des colonnes</h4>
            <div className="grid grid-cols-2 gap-2">
              {mappingFields.map((field) => (
                <div key={field.key} className="flex items-center gap-2">
                  <label className="text-xs text-gray-400 w-36 shrink-0">
                    {field.label} {field.required && <span className="text-danger">*</span>}
                  </label>
                  <select
                    className={selectClass}
                    value={mapping[field.key] ?? ''}
                    onChange={(e) =>
                      setMapping((prev) => ({ ...prev, [field.key]: e.target.value || null }))
                    }
                  >
                    <option value="">— Non mappé —</option>
                    {preview.headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Preview table */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-2">Aperçu (10 premières lignes)</h4>
            <div className="overflow-auto max-h-48 border border-surface-3 rounded">
              <table className="w-full text-xs">
                <thead className="bg-surface-2 sticky top-0">
                  <tr>
                    {preview.headers.map((h) => (
                      <th key={h} className="px-2 py-1 text-left text-gray-400 font-medium whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((row, i) => (
                    <tr key={i} className="border-t border-surface-3">
                      {preview.headers.map((h) => (
                        <td key={h} className="px-2 py-1 text-gray-300 whitespace-nowrap max-w-[200px] truncate">
                          {String(row[h] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-danger text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setStep('upload'); setPreview(null) }}>
              Retour
            </Button>
            <Button onClick={handleImport} disabled={!mapping.numero_ot}>
              Importer {preview.totalRows} OT
            </Button>
          </div>
        </div>
      )}

      {step === 'importing' && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-gray-400">Import en cours...</p>
        </div>
      )}

      {step === 'result' && result && (
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2 text-success text-lg font-medium justify-center">
            <CheckCircle2 size={24} /> Import terminé
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-surface-2 rounded-lg p-3">
              <div className="text-2xl font-bold text-white">{result.imported}</div>
              <div className="text-xs text-gray-400">OT importés</div>
            </div>
            <div className="bg-surface-2 rounded-lg p-3">
              <div className="text-2xl font-bold text-white">{result.machinesCreated}</div>
              <div className="text-xs text-gray-400">Machines créées</div>
            </div>
            <div className="bg-surface-2 rounded-lg p-3">
              <div className="text-2xl font-bold text-warning">{result.errors.length}</div>
              <div className="text-xs text-gray-400">Erreurs</div>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="bg-surface-2 rounded-lg p-3 max-h-32 overflow-auto">
              {result.errors.map((err, i) => (
                <p key={i} className="text-xs text-danger">{err}</p>
              ))}
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={onClose}>Fermer</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
