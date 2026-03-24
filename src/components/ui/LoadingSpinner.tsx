export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  }
  return (
    <div className="flex items-center justify-center w-full py-12">
      <div
        className={`${sizeClasses[size]} rounded-full border-white/10 border-t-teal-400 animate-spin`}
        role="status"
        aria-label="Loading"
      />
    </div>
  )
}
