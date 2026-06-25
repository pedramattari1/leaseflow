export default function LoadingSpinner({ message = 'Loading…' }) {
  return (
    <div className="py-16 flex flex-col items-center justify-center">
      <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
      <p className="mt-3 text-sm text-text-tertiary">{message}</p>
    </div>
  )
}
