import { Agent } from '@/types'
import { cn } from '@/lib/utils'
import { Bot, MessageSquare, Zap } from 'lucide-react'

const statusColors = {
  active: 'bg-[var(--accent-green)]',
  idle: 'bg-[var(--accent-orange)]',
  offline: 'bg-[var(--text-muted)]',
  error: 'bg-[var(--accent-red)]',
}

const statusLabels = {
  active: 'Active',
  idle: 'Idle',
  offline: 'Offline',
  error: 'Error',
}

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 hover:border-[var(--accent-blue)]/30 transition-all group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent-blue)]/20 to-[var(--accent-purple)]/20 border border-[var(--border)] flex items-center justify-center">
            <Bot size={20} className="text-[var(--accent-blue)]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">{agent.name}</h3>
            <p className="text-xs text-[var(--text-muted)]">{agent.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={cn('w-2 h-2 rounded-full', statusColors[agent.status])} />
          <span className="text-xs text-[var(--text-muted)]">{statusLabels[agent.status]}</span>
        </div>
      </div>

      {/* Model */}
      <div className="mb-3">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-xs text-[var(--text-secondary)]">
          <Zap size={10} />
          {agent.model}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-1">
          <MessageSquare size={12} />
          <span>{agent.channel}</span>
        </div>
        <span className="font-mono">{agent.token_usage_today.toLocaleString()} tokens</span>
      </div>

      {/* Last seen */}
      {agent.last_seen && (
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Last seen: {new Date(agent.last_seen).toLocaleString()}
        </p>
      )}
    </div>
  )
}
