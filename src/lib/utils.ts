import { format, parseISO, isWithinInterval, isBefore, differenceInHours } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { TechnicienHabilitation, TechnicienAbsence } from './types'

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy', { locale: fr })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd/MM/yyyy HH:mm', { locale: fr })
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'HH:mm', { locale: fr })
}

export function formatDuration(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (m === 0) return `${h}h`
  return `${h}h${m.toString().padStart(2, '0')}`
}

export function isHabilitationValid(hab: TechnicienHabilitation): boolean {
  if (!hab.date_expiration) return true
  return !isBefore(parseISO(hab.date_expiration), new Date())
}

export function isHabilitationExpiringSoon(hab: TechnicienHabilitation, days = 30): boolean {
  if (!hab.date_expiration) return false
  const expDate = parseISO(hab.date_expiration)
  const now = new Date()
  const threshold = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  return isWithinInterval(expDate, { start: now, end: threshold })
}

export function isTechnicienAvailable(
  absences: TechnicienAbsence[],
  debut: string,
  fin: string
): boolean {
  const interval = { start: parseISO(debut), end: parseISO(fin) }
  return !absences.some((absence) => {
    const absStart = parseISO(absence.debut)
    const absEnd = parseISO(absence.fin)
    return (
      isWithinInterval(absStart, interval) ||
      isWithinInterval(absEnd, interval) ||
      (isBefore(absStart, interval.start) && isBefore(interval.end, absEnd))
    )
  })
}

export function getSlotDurationHours(debut: string, fin: string): number {
  return differenceInHours(parseISO(fin), parseISO(debut))
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Greedy bin-packing: select OTs by priority then duration that fit in available hours
 */
export function greedyOTPack(
  ots: { id: string; priorite: number; duree_estimee_h: number | null }[],
  availableHours: number
): string[] {
  const sorted = [...ots].sort((a, b) => {
    if (a.priorite !== b.priorite) return a.priorite - b.priorite
    return (a.duree_estimee_h ?? 0) - (b.duree_estimee_h ?? 0)
  })
  const selected: string[] = []
  let remaining = availableHours
  for (const ot of sorted) {
    const dur = ot.duree_estimee_h ?? 0
    if (dur <= remaining) {
      selected.push(ot.id)
      remaining -= dur
    }
  }
  return selected
}
