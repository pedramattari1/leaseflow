import { NavLink } from 'react-router-dom'
import { ClipboardList, Layers, BarChart3, Building2, Settings, LogOut } from 'lucide-react'

const mainNav = [
  { to: '/tours', label: 'Tours', icon: ClipboardList },
  { to: '/pipeline', label: 'Pipeline', icon: Layers },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
]

const manageNav = [
  { to: '/units', label: 'Units', icon: Building2 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function NavItem({ to, label, icon: Icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-md transition-[background,color] duration-[150ms] ${
          isActive
            ? 'text-primary bg-primary-light border-l-2 border-primary'
            : 'text-text-secondary hover:bg-surface-hover'
        }`
      }
    >
      <Icon size={18} strokeWidth={1.5} />
      {label}
    </NavLink>
  )
}

export default function Sidebar({ user, onSignOut, onClose }) {
  return (
    <aside className="flex flex-col h-full w-60 bg-surface border-r border-border">
      <div className="h-12 flex items-center px-4 shrink-0">
        <span className="text-accent mr-1.5 text-lg">&#9670;</span>
        <span className="text-lg font-semibold text-primary">LeaseFlow</span>
      </div>

      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        <p className="px-4 pt-4 pb-1 text-xs font-semibold uppercase text-text-tertiary tracking-wider">Main</p>
        {mainNav.map((item) => (
          <NavItem key={item.to} {...item} onClick={onClose} />
        ))}

        <p className="px-4 pt-6 pb-1 text-xs font-semibold uppercase text-text-tertiary tracking-wider">Manage</p>
        {manageNav.map((item) => (
          <NavItem key={item.to} {...item} onClick={onClose} />
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-border shrink-0">
        <p className="text-sm font-medium text-text-primary truncate">{user?.name || 'User'}</p>
        <p className="text-xs text-text-secondary truncate">{user?.email || ''}</p>
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="flex items-center gap-1.5 mt-2 text-xs text-text-secondary hover:text-text-primary transition-colors duration-[150ms] cursor-pointer"
          >
            <LogOut size={14} strokeWidth={1.5} />
            Sign out
          </button>
        )}
      </div>
    </aside>
  )
}
