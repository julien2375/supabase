import { cn } from '../../lib/utils'

interface BadgeProps {
  children: React.ReactNode
  color?: string
  variant?: 'default' | 'outline'
  pulse?: boolean
  className?: string
}

export default function Badge({ children, color, variant = 'default', pulse, className }: BadgeProps) {
  const style = color
    ? variant === 'outline'
      ? { borderColor: color, color }
      : { backgroundColor: color + '22', color }
    : undefined

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap',
        variant === 'outline' && 'border',
        !color && variant === 'default' && 'bg-surface-3 text-gray-300',
        pulse && 'pulse-danger',
        className
      )}
      style={style}
    >
      {children}
    </span>
  )
}
