import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'

export default function MobileNav({ user, onSignOut }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <header className="lg:hidden flex items-center justify-between h-14 px-4 bg-surface border-b border-border">
        <button onClick={() => setOpen(true)} className="p-2 rounded-md hover:bg-surface-hover cursor-pointer">
          <Menu size={20} strokeWidth={1.5} />
        </button>
        <span className="text-lg font-semibold text-primary">LeaseFlow</span>
        <div className="w-9" />
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative h-full w-60 shadow-xl">
            <Sidebar user={user} onSignOut={onSignOut} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
