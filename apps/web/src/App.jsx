import { ClerkProvider, SignedIn, SignedOut, SignIn } from '@clerk/clerk-react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import DailyLog from './pages/DailyLog'
import Pipeline from './pages/Pipeline'
import Dashboard from './pages/Dashboard'
import SharedDashboard from './pages/SharedDashboard'
import Units from './pages/Units'
import Settings from './pages/Settings'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const bypassAuth = import.meta.env.VITE_DEV_BYPASS_AUTH === 'true'

export default function App() {
  if (!clerkPubKey || bypassAuth) {
    return (
      <Routes>
        <Route path="/d/:token" element={<SharedDashboard />} />
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

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center bg-bg">
          <SignIn fallbackRedirectUrl="/" />
        </div>
      </SignedOut>
      <SignedIn>
        <Routes>
          <Route path="/d/:token" element={<SharedDashboard />} />
          <Route element={<Layout />}>
            <Route path="/" element={<DailyLog />} />
            <Route path="/tours" element={<DailyLog />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/units" element={<Units />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </SignedIn>
    </ClerkProvider>
  )
}
