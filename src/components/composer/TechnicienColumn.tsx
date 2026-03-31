import { useState, useEffect } from 'react'
import { Check, User } from 'lucide-react'
import type { Technicien, TechnicienHabilitation, TechnicienAbsence } from '../../lib/types'
import { fetchTechnicienHabilitations, fetchAbsences } from '../../services/technicienService'
import { checkTechnicienConflict } from '../../services/interventionService'
import { isHabilitationValid, isTechnicienAvailable, cn } from '../../lib/utils'
import Badge from '../ui/Badge'

interface TechnicienColumnProps {
  techniciens: Technicien[]
  requiredCompetences: string[]
  slotDebut: string | null
  slotFin: string | null
  assignedIds: Set<string>
  onAssign: (tech: Technicien) => void
}

interface TechWithMatch {
  tech: Technicien
  habilitations: TechnicienHabilitation[]
  absences: TechnicienAbsence[]
  available: boolean
  hasConflict: boolean
  matchedCompetences: string[]
  missingCompetences: string[]
  matchScore: number
}

export default function TechnicienColumn({
  techniciens,
  requiredCompetences,
  slotDebut,
  slotFin,
  assignedIds,
  onAssign,
}: TechnicienColumnProps) {
  const [techData, setTechData] = useState<TechWithMatch[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (techniciens.length === 0) return
    const loadData = async () => {
      setLoading(true)
      const results: TechWithMatch[] = await Promise.all(
        techniciens.filter((t) => t.actif).map(async (tech) => {
          const [habs, abs] = await Promise.all([
            fetchTechnicienHabilitations(tech.id),
            fetchAbsences(tech.id),
          ])

          const available =
            slotDebut && slotFin
              ? isTechnicienAvailable(abs, slotDebut, slotFin)
              : true

          const hasConflict =
            slotDebut && slotFin
              ? await checkTechnicienConflict(tech.id, slotDebut, slotFin)
              : false

          const validHabCodes = habs
            .filter(isHabilitationValid)
            .map((h) => h.habilitation?.code ?? '')
            .filter(Boolean)

          const matched = requiredCompetences.filter((c) => validHabCodes.includes(c))
          const missing = requiredCompetences.filter((c) => !validHabCodes.includes(c))

          return {
            tech,
            habilitations: habs,
            absences: abs,
            available,
            hasConflict,
            matchedCompetences: matched,
            missingCompetences: missing,
            matchScore:
              requiredCompetences.length > 0
                ? matched.length / requiredCompetences.length
                : 0,
          }
        })
      )
      // Sort: available + best match first
      results.sort((a, b) => {
        if (a.available !== b.available) return a.available ? -1 : 1
        if (a.hasConflict !== b.hasConflict) return a.hasConflict ? 1 : -1
        return b.matchScore - a.matchScore
      })
      setTechData(results)
      setLoading(false)
    }
    loadData()
  }, [techniciens, requiredCompetences, slotDebut, slotFin])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <h3 className="text-sm font-semibold text-white mb-3">Techniciens disponibles</h3>

      {loading && (
        <p className="text-xs text-gray-500 text-center py-4">Chargement...</p>
      )}

      <div className="flex-1 overflow-auto space-y-2">
        {techData.map(({ tech, available, hasConflict, matchedCompetences, missingCompetences, matchScore }) => {
          const isAssigned = assignedIds.has(tech.id)
          return (
            <div
              key={tech.id}
              onClick={() => {
                if (!isAssigned && available && !hasConflict) onAssign(tech)
              }}
              className={cn(
                'bg-surface-1 border rounded-lg p-3 transition-colors',
                isAssigned
                  ? 'border-accent bg-accent/10'
                  : !available || hasConflict
                    ? 'border-surface-3 opacity-50 cursor-not-allowed'
                    : 'border-surface-3 hover:border-accent/50 cursor-pointer'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-gray-500" />
                  <span className="text-sm font-medium text-white">
                    {tech.prenom} {tech.nom}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {isAssigned && <Check size={14} className="text-accent" />}
                  {!available && (
                    <Badge color="#EF4444">Absent</Badge>
                  )}
                  {hasConflict && (
                    <Badge color="#F59E0B">Conflit</Badge>
                  )}
                </div>
              </div>

              <p className="text-[10px] text-gray-500 mb-1.5">
                {tech.specialite ?? '—'} • {tech.equipe ?? '—'}
              </p>

              {/* Competence match */}
              {requiredCompetences.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {matchedCompetences.map((c) => (
                    <Badge key={c} color="#22C55E">{c}</Badge>
                  ))}
                  {missingCompetences.map((c) => (
                    <Badge key={c} color="#EF4444" variant="outline">{c}</Badge>
                  ))}
                </div>
              )}

              {/* Match score */}
              {requiredCompetences.length > 0 && matchScore > 0 && (
                <div className="mt-1.5 h-1 bg-surface-3 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      matchScore === 1 ? 'bg-success' : matchScore >= 0.5 ? 'bg-warning' : 'bg-danger'
                    )}
                    style={{ width: `${matchScore * 100}%` }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
