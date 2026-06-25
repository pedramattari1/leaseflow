import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import CommandPalette from '../shared/CommandPalette'
import { useAuth } from '../../hooks/useAuth'

export default function Layout() {
  const { user, signOut } = useAuth()
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <div className="min-h-screen bg-bg">
      <MobileNav user={user} onSignOut={signOut} />
      <div className="flex">
        <div className="hidden lg:block shrink-0 h-screen sticky top-0">
          <Sidebar user={user} onSignOut={signOut} />
        </div>
        <main className="flex-1 min-w-0">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
