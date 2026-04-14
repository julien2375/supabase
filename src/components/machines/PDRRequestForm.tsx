import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Plus, Trash2, Check } from 'lucide-react'
import type { Machine } from '../../lib/types'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { usePDRDemandeurs } from '../../hooks/usePDRDemandeurs'
import { sendPDRToTrello } from '../../services/trelloService'

interface PDRRequestFormProps {
  open: boolean
  onClose: () => void
  machines: Machine[]
  initialMachineId?: string
}

const inputClass =
  'w-full bg-surface-2 border border-surface-3 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent'

interface SelectItem {
  id: string
  label: string
  sublabel?: string
}

interface SearchableSelectProps {
  items: SelectItem[]
  value: string | null
  onChange: (id: string) => void
  placeholder: string
  emptyLabel?: string
  onAdd?: (nom: string) => Promise<SelectItem | null>
  onRemove?: (id: string) => Promise<void>
}

function SearchableSelect({
  items,
  value,
  onChange,
  placeholder,
  emptyLabel = 'Aucun résultat',
  onAdd,
  onRemove,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = useMemo(() => items.find((i) => i.id === value) ?? null, [items, value])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const normalized = query.trim().toLowerCase()
  const filtered = useMemo(() => {
    if (!normalized) return items
    return items.filter((i) => {
      const label = i.label.toLowerCase()
      const sub = (i.sublabel ?? '').toLowerCase()
      return label.includes(normalized) || sub.includes(normalized)
    })
  }, [items, normalized])

  const canAddNew =
    onAdd !== undefined &&
    normalized.length > 0 &&
    !items.some((i) => i.label.toLowerCase() === normalized)

  const handleAdd = async () => {
    if (!onAdd) return
    const trimmed = query.trim()
    if (!trimmed) return
    setBusy(true)
    try {
      const created = await onAdd(trimmed)
      if (created) {
        onChange(created.id)
        setQuery('')
        setOpen(false)
      }
    } finally {
      setBusy(false)
    }
  }

  const handleRemove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!onRemove) return
    setBusy(true)
    try {
      await onRemove(id)
      if (value === id) onChange('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${inputClass} flex items-center justify-between text-left`}
      >
        <span className={selected ? 'text-white' : 'text-gray-500'}>
          {selected ? (
            <>
              <span>{selected.label}</span>
              {selected.sublabel && (
                <span className="text-gray-500 ml-2">— {selected.sublabel}</span>
              )}
            </>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown size={16} className="text-gray-500 shrink-0" />
      </button>

      {open && (
        <div className="absolute z-10 left-0 right-0 mt-1 bg-surface-1 border border-surface-3 rounded-lg shadow-xl overflow-hidden">
          <div className="p-2 border-b border-surface-3">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher..."
              className={inputClass}
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 && !canAddNew && (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">{emptyLabel}</div>
            )}
            {filtered.map((item) => {
              const isSelected = item.id === value
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onChange(item.id)
                    setOpen(false)
                    setQuery('')
                  }}
                  className={`flex items-center justify-between gap-2 px-3 py-2 cursor-pointer hover:bg-surface-2 ${
                    isSelected ? 'bg-accent/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isSelected && <Check size={14} className="text-accent shrink-0" />}
                    <span className="text-sm text-white truncate">{item.label}</span>
                    {item.sublabel && (
                      <span className="text-xs text-gray-500 truncate">— {item.sublabel}</span>
                    )}
                  </div>
                  {onRemove && (
                    <button
                      type="button"
                      onClick={(e) => handleRemove(e, item.id)}
                      className="p-1 text-gray-500 hover:text-danger shrink-0"
                      disabled={busy}
                      title="Supprimer"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              )
            })}
            {canAddNew && (
              <div
                onClick={handleAdd}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-surface-2 border-t border-surface-3 text-accent"
              >
                <Plus size={14} />
                <span className="text-sm">Ajouter « {query.trim()} »</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function PDRRequestForm({
  open,
  onClose,
  machines,
  initialMachineId,
}: PDRRequestFormProps) {
  const { demandeurs, create: createDemandeur, remove: removeDemandeur } = usePDRDemandeurs()

  const [machineId, setMachineId] = useState<string>(initialMachineId ?? '')
  const [designation, setDesignation] = useState('')
  const [reference, setReference] = useState('')
  const [quantite, setQuantite] = useState<number>(1)
  const [demandeurId, setDemandeurId] = useState<string>('')
  const [machineArret, setMachineArret] = useState<boolean | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setMachineId(initialMachineId ?? '')
      setDesignation('')
      setReference('')
      setQuantite(1)
      setDemandeurId('')
      setMachineArret(null)
      setError(null)
    }
  }, [open, initialMachineId])

  const machineItems: SelectItem[] = useMemo(
    () =>
      machines.map((m) => ({
        id: m.id,
        label: m.tag,
        sublabel: m.designation ?? undefined,
      })),
    [machines]
  )

  const demandeurItems: SelectItem[] = useMemo(
    () => demandeurs.map((d) => ({ id: d.id, label: d.nom })),
    [demandeurs]
  )

  const handleAddDemandeur = async (nom: string): Promise<SelectItem | null> => {
    try {
      const created = await createDemandeur(nom)
      return { id: created.id, label: created.nom }
    } catch (e) {
      setError((e as Error).message)
      return null
    }
  }

  const handleRemoveDemandeur = async (id: string) => {
    try {
      await removeDemandeur(id)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const canSubmit =
    !!machineId &&
    designation.trim().length > 0 &&
    quantite > 0 &&
    !!demandeurId &&
    machineArret !== null &&
    !submitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setError(null)
    setSubmitting(true)
    try {
      const machine = machines.find((m) => m.id === machineId)
      const demandeur = demandeurs.find((d) => d.id === demandeurId)
      if (!machine || !demandeur) {
        throw new Error('Sélection invalide.')
      }

      await sendPDRToTrello({
        machineTag: machine.tag,
        machineDesignation: machine.designation,
        pieceDesignation: designation.trim(),
        pieceReference: reference.trim(),
        quantite,
        demandeur: demandeur.nom,
        machineArret: machineArret as boolean,
      })

      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle demande PDR">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Nom de la machine *</label>
          <SearchableSelect
            items={machineItems}
            value={machineId || null}
            onChange={setMachineId}
            placeholder="Sélectionner une machine..."
            emptyLabel="Aucune machine trouvée"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Désignation de la pièce *</label>
          <input
            className={inputClass}
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder="ex: Roulement broche"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Référence</label>
            <input
              className={inputClass}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Si présente"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Quantité *</label>
            <input
              type="number"
              min={1}
              step={1}
              className={inputClass}
              value={quantite}
              onChange={(e) => setQuantite(Math.max(1, parseInt(e.target.value, 10) || 1))}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Demandeur *</label>
          <SearchableSelect
            items={demandeurItems}
            value={demandeurId || null}
            onChange={setDemandeurId}
            placeholder="Sélectionner un demandeur..."
            emptyLabel="Aucun demandeur — tapez un nom pour en ajouter"
            onAdd={handleAddDemandeur}
            onRemove={handleRemoveDemandeur}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Machine à l'arrêt *</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMachineArret(true)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                machineArret === true
                  ? 'bg-danger/20 border-danger text-danger'
                  : 'bg-surface-2 border-surface-3 text-gray-400 hover:text-gray-200'
              }`}
            >
              Oui
            </button>
            <button
              type="button"
              onClick={() => setMachineArret(false)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                machineArret === false
                  ? 'bg-accent/20 border-accent text-accent'
                  : 'bg-surface-2 border-surface-3 text-gray-400 hover:text-gray-200'
              }`}
            >
              Non
            </button>
          </div>
        </div>

        {error && (
          <div className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            {submitting ? 'Envoi...' : 'Envoyer à Trello'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
