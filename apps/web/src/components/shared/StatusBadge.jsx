const statusStyles = {
  hot: 'text-hot bg-hot-bg',
  warm: 'text-warm bg-warm-bg',
  cold: 'text-cold bg-cold-bg',
  applied: 'text-applied bg-applied-bg',
  not_interested: 'text-not-interested bg-not-interested-bg',
}

const stageStyles = {
  applied: 'text-stage-applied bg-warm-bg',
  screening: 'text-stage-screening bg-[#EDE9FE]',
  approved: 'text-stage-approved bg-applied-bg',
  lease_sent: 'text-stage-lease-sent bg-hot-bg',
  lease_executed: 'text-stage-executed bg-applied-bg',
  move_in_scheduled: 'text-stage-move-in bg-[#CFFAFE]',
}

const labels = {
  not_interested: 'Not Interested',
  lease_sent: 'Lease Sent',
  lease_executed: 'Lease Executed',
  move_in_scheduled: 'Move-in Scheduled',
}

export default function StatusBadge({ value, type = 'status' }) {
  const styles = type === 'stage' ? stageStyles : statusStyles
  const classes = styles[value] || 'text-text-secondary bg-surface-hover'
  const label = labels[value] || (value ? value.charAt(0).toUpperCase() + value.slice(1) : '')

  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-sm capitalize ${classes}`}>
      {label}
    </span>
  )
}
