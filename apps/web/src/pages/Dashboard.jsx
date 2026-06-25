import { useState } from 'react'
import { Share2 } from 'lucide-react'
import { useDashboard } from '../hooks/useDashboard'
import ErrorBanner from '../components/shared/ErrorBanner'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import DashboardContent from '../components/dashboard/DashboardContent'
import ShareModal from '../components/dashboard/ShareModal'

function getInitialDate() {
  const params = new URLSearchParams(window.location.search)
  return params.get('date') || new Date().toISOString().split('T')[0]
}

export default function Dashboard() {
  const dashboard = useDashboard(getInitialDate())
  const [shareOpen, setShareOpen] = useState(false)

  if (dashboard.loading) {
    return (
      <div>
        <h1 className="text-xl font-bold text-text-primary">Dashboard</h1>
        <LoadingSpinner message="Loading metrics…" />
      </div>
    )
  }

  if (dashboard.error) {
    return (
      <div>
        <h1 className="text-xl font-bold text-text-primary">Dashboard</h1>
        <div className="mt-4"><ErrorBanner message={dashboard.error} onRetry={dashboard.refetch} /></div>
      </div>
    )
  }

  return (
    <>
      <DashboardContent
        {...dashboard}
        headerRight={
          <button
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover cursor-pointer"
          >
            <Share2 size={16} strokeWidth={1.5} />
            Share
          </button>
        }
      />
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />
    </>
  )
}
