import { useUser, useClerk } from '@clerk/clerk-react'

const useClerkEnabled = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY && import.meta.env.VITE_DEV_BYPASS_AUTH !== 'true'

function useDemoAuth() {
  return {
    user: { name: 'Demo User', email: 'demo@leaseflow.app' },
    signOut: null,
  }
}

function useClerkAuth() {
  const { user } = useUser()
  const { signOut } = useClerk()
  return {
    user: user ? { name: user.fullName, email: user.primaryEmailAddress?.emailAddress } : null,
    signOut,
  }
}

export const useAuth = useClerkEnabled ? useClerkAuth : useDemoAuth
