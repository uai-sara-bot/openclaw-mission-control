import { InboxIcon } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 text-[var(--text-muted)]">
        {icon ?? <InboxIcon size={24} />}
      </div>
      <h3 className="text-base font-medium text-[var(--text-secondary)] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--text-muted)] max-w-xs">{description}</p>
      )}
    </div>
  )
}
