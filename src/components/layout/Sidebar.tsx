import { NavLink } from 'react-router-dom'
import { ClipboardList, Users, Cog, CalendarDays, Puzzle } from 'lucide-react'
import { cn } from '../../lib/utils'

const navItems = [
  { to: '/backlog', icon: ClipboardList, label: 'Backlog OT' },
  { to: '/techniciens', icon: Users, label: 'Techniciens' },
  { to: '/machines', icon: Cog, label: 'Machines' },
  { to: '/planning', icon: CalendarDays, label: 'Planning' },
  { to: '/composer', icon: Puzzle, label: 'Composer' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 bg-surface-1 border-r border-surface-3 flex flex-col shrink-0">
      <div className="p-4 border-b border-surface-3">
        <h1 className="text-lg font-bold tracking-tight text-white">
          Plan<span className="text-accent">OT</span>
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">Planification Maintenance</p>
      </div>
      <nav className="flex-1 p-2 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent/15 text-accent'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-surface-2'
              )
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
