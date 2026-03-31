import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'primary' && 'bg-accent hover:bg-accent-hover text-white',
        variant === 'secondary' && 'bg-surface-2 hover:bg-surface-3 text-gray-300',
        variant === 'danger' && 'bg-danger/20 hover:bg-danger/30 text-danger',
        variant === 'ghost' && 'hover:bg-surface-2 text-gray-400',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-2.5 text-base',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
