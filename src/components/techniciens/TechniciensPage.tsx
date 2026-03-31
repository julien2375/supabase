import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useTechniciens } from '../../hooks/useTechniciens'
import type { Technicien, TechnicienHabilitation, TechnicienAbsence } from '../../lib/types'
import { fetchTechnicienHabilitations, fetchAbsences } from '../../services/technicienService'
import Button from '../ui/Button'
import TechnicienCard from './TechnicienCard'
import TechnicienForm from './TechnicienForm'
import TechnicienDetail from './TechnicienDetail'

export default function TechniciensPage() {
  const { techniciens, loading, create, update } = useTechniciens()
  const [showForm, setShowForm] = useState(false)
  const [editingTech, setEditingTech] = useState<Technicien | null>(null)
  const [selectedTech, setSelectedTech] = useState<Technicien | null>(null)
  const [habilitationsMap, setHabilitationsMap] = useState<Record<string, TechnicienHabilitation[]>>({})
  const [absencesMap, setAbsencesMap] = useState<Record<string, TechnicienAbsence[]>>({})

  // Load habilitations and absences for all techniciens
  useEffect(() => {
    if (techniciens.length === 0) return
    const loadAll = async () => {
      const habMap: Record<string, TechnicienHabilitation[]> = {}
      const absMap: Record<string, TechnicienAbsence[]> = {}
      await Promise.all(
        techniciens.map(async (t) => {
          const [habs, abs] = await Promise.all([
            fetchTechnicienHabilitations(t.id),
            fetchAbsences(t.id),
          ])
          habMap[t.id] = habs
          absMap[t.id] = abs
        })
      )
      setHabilitationsMap(habMap)
      setAbsencesMap(absMap)
    }
    loadAll()
  }, [techniciens])

  const reloadHabilitations = async (techId: string) => {
    const habs = await fetchTechnicienHabilitations(techId)
    setHabilitationsMap((prev) => ({ ...prev, [techId]: habs }))
  }

  if (loading) {
    return <div className="text-gray-500 text-center py-12">Chargement des techniciens...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Techniciens</h1>
          <p className="text-sm text-gray-500 mt-1">
            {techniciens.filter((t) => t.actif).length} techniciens actifs
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} /> Ajouter technicien
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {techniciens
          .filter((t) => t.actif)
          .map((tech) => (
            <TechnicienCard
              key={tech.id}
              nom={tech.nom}
              prenom={tech.prenom}
              specialite={tech.specialite}
              equipe={tech.equipe}
              habilitations={habilitationsMap[tech.id] ?? []}
              absences={absencesMap[tech.id] ?? []}
              onClick={() => setSelectedTech(tech)}
            />
          ))}
      </div>

      {showForm && (
        <TechnicienForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={async (t) => { await create(t) }}
        />
      )}

      {editingTech && (
        <TechnicienForm
          open={!!editingTech}
          onClose={() => setEditingTech(null)}
          initial={editingTech}
          onSubmit={async (t) => { await update(editingTech.id, t) }}
        />
      )}

      {selectedTech && (
        <TechnicienDetail
          open={!!selectedTech}
          onClose={() => setSelectedTech(null)}
          technicien={selectedTech}
          habilitations={habilitationsMap[selectedTech.id] ?? []}
          onHabilitationsUpdate={() => reloadHabilitations(selectedTech.id)}
        />
      )}
    </div>
  )
}
