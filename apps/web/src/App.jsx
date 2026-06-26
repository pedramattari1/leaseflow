import { ClerkProvider, SignedIn, SignedOut, SignIn } from '@clerk/clerk-react'
import { Routes, Route, useMatch } from 'react-router-dom'
import Layout from './components/layout/Layout'
import DailyLog from './pages/DailyLog'
import Pipeline from './pages/Pipeline'
import Dashboard from './pages/Dashboard'
import SharedDashboard from './pages/SharedDashboard'
import Units from './pages/Units'
import Settings from './pages/Settings'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const bypassAuth = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'

function AuthenticatedRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DailyLog />} />
        <Route path="/tours" element={<DailyLog />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/units" element={<Units />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  const isSharedRoute = useMatch('/d/:token')

  if (isSharedRoute) {
    return (
      <Routes>
        <Route path="/d/:token" element={<SharedDashboard />} />
      </Routes>
    )
  }

  if (!clerkPubKey || bypassAuth) {
    return <AuthenticatedRoutes />
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center bg-bg">
          <SignIn fallbackRedirectUrl="/" />
        </div>
      </SignedOut>
      <SignedIn>
        <AuthenticatedRoutes />
      </SignedIn>
    </ClerkProvider>
  )
}
