import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { format, addWeeks, startOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'
import Button from '../ui/Button'

interface WeekNavigatorProps {
  weekStart: Date
  onWeekChange: (date: Date) => void
}

export default function WeekNavigator({ weekStart, onWeekChange }: WeekNavigatorProps) {
  const weekEnd = new Date(weekStart.getTime() + 4 * 24 * 60 * 60 * 1000)

  return (
    <div className="flex items-center gap-3 mb-4">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onWeekChange(addWeeks(weekStart, -1))}
      >
        <ChevronLeft size={16} />
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => onWeekChange(startOfWeek(new Date(), { weekStartsOn: 1 }))}
      >
        <CalendarDays size={14} /> Aujourd'hui
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onWeekChange(addWeeks(weekStart, 1))}
      >
        <ChevronRight size={16} />
      </Button>
      <span className="text-sm font-medium text-white">
        {format(weekStart, 'dd MMM', { locale: fr })} — {format(weekEnd, 'dd MMM yyyy', { locale: fr })}
      </span>
    </div>
  )
}
