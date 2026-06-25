export default function EmptyState({ icon: Icon, message, action }) {
  return (
    <div className="py-16 text-center">
      {Icon && <Icon size={40} className="mx-auto text-text-tertiary mb-3" strokeWidth={1} />}
      <p className="text-sm text-text-secondary">{message}</p>
      {action}
    </div>
  )
}
