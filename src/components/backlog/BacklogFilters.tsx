import { Search } from 'lucide-react'

interface BacklogFiltersProps {
  searchText: string
  onSearchChange: (text: string) => void
  batiment: string
  onBatimentChange: (b: string) => void
  typeOT: string
  onTypeOTChange: (t: string) => void
  priorite: string
  onPrioriteChange: (p: string) => void
  statut: string
  onStatutChange: (s: string) => void
  batiments: string[]
}

export default function BacklogFilters({
  searchText,
  onSearchChange,
  batiment,
  onBatimentChange,
  typeOT,
  onTypeOTChange,
  priorite,
  onPrioriteChange,
  statut,
  onStatutChange,
  batiments,
}: BacklogFiltersProps) {
  const selectClass =
    'bg-surface-2 border border-surface-3 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-accent'

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="relative flex-1 min-w-[200px]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher N° OT, description..."
          className="w-full bg-surface-2 border border-surface-3 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-accent"
        />
      </div>
      <select className={selectClass} value={batiment} onChange={(e) => onBatimentChange(e.target.value)}>
        <option value="">Tous bâtiments</option>
        {batiments.map((b) => (
          <option key={b} value={b}>{b}</option>
        ))}
      </select>
      <select className={selectClass} value={typeOT} onChange={(e) => onTypeOTChange(e.target.value)}>
        <option value="">Tous types</option>
        <option value="CORPAN">CORPAN</option>
        <option value="CORPL">CORPL</option>
        <option value="PREV">PREV</option>
        <option value="MODIF">MODIF</option>
        <option value="COR_PLANIF">COR_PLANIF</option>
      </select>
      <select className={selectClass} value={priorite} onChange={(e) => onPrioriteChange(e.target.value)}>
        <option value="">Toutes priorités</option>
        <option value="1">P1 - Urgence</option>
        <option value="2">P2 - Important</option>
        <option value="3">P3 - Courant</option>
        <option value="4">P4 - Différable</option>
      </select>
      <select className={selectClass} value={statut} onChange={(e) => onStatutChange(e.target.value)}>
        <option value="">Tous statuts</option>
        <option value="À planifier">À planifier</option>
        <option value="Planifié">Planifié</option>
        <option value="En cours">En cours</option>
        <option value="En attente pièces">En attente pièces</option>
        <option value="Terminé">Terminé</option>
      </select>
    </div>
  )
}
