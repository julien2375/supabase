import { cn } from '../../lib/utils'

interface ProgressBarProps {
  value: number // current value
  max: number   // maximum value
  className?: string
  showLabel?: boolean
}

export default function ProgressBar({ value, max, className, showLabel }: ProgressBarProps) {
  const pct = max > 0 ? (value / max) * 100 : 0
  const overflow = pct - 100
  const barColor =
    overflow > 20 ? 'bg-danger' : overflow > 0 ? 'bg-warning' : 'bg-success'

  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-400">
          <span>{value.toFixed(1)}h / {max.toFixed(1)}h</span>
          <span className={cn(overflow > 20 ? 'text-danger' : overflow > 0 ? 'text-warning' : 'text-success')}>
            {pct.toFixed(0)}%
          </span>
        </div>
      )}
      <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', barColor)}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  )
}
