'use client'

import { useState } from 'react'
import {
  MessageSquare, Brain, DollarSign, GitBranch, Cloud, CheckSquare,
  Mic, Play, Search, Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ElementType
  status: 'connected' | 'disconnected' | 'error'
  color: string
  lastSync: string | null
  details: string
}

const integrations: Integration[] = [
  { id: 'slack', name: 'Slack', description: 'Team communication and agent notifications', icon: MessageSquare, status: 'connected', color: 'var(--accent-blue)', lastSync: '2026-03-23T14:30:00Z', details: 'Workspace: OpenClaw · 4 channels connected' },
  { id: 'anythingllm', name: 'AnythingLLM', description: 'Local RAG and document ingestion', icon: Brain, status: 'connected', color: 'var(--accent-purple)', lastSync: '2026-03-23T13:00:00Z', details: '3 workspaces · 1,247 documents indexed' },
  { id: 'sure-finance', name: 'Sure Finance', description: 'Expense tracking and financial reporting', icon: DollarSign, status: 'connected', color: 'var(--accent-green)', lastSync: '2026-03-23T09:15:00Z', details: 'Account linked · Auto-sync daily at 09:00' },
  { id: 'github', name: 'GitHub', description: 'Repository management and CI/CD triggers', icon: GitBranch, status: 'connected', color: 'var(--text-primary)', lastSync: '2026-03-23T14:28:00Z', details: 'Org: openclaw · 6 repos · Webhooks active' },
  { id: 'onedrive', name: 'OneDrive', description: 'Cloud file storage and document sync', icon: Cloud, status: 'disconnected', color: 'var(--accent-blue)', lastSync: null, details: 'Not configured' },
  { id: 'vikunja', name: 'Vikunja', description: 'Task management and project boards', icon: CheckSquare, status: 'connected', color: 'var(--accent-orange)', lastSync: '2026-03-23T12:00:00Z', details: '2 projects synced · 47 open tasks' },
  { id: 'elevenlabs', name: 'ElevenLabs', description: 'Text-to-speech and voice synthesis', icon: Mic, status: 'error', color: 'var(--accent-red)', lastSync: '2026-03-22T18:00:00Z', details: 'API key expired — re-authenticate required' },
  { id: 'youtube', name: 'YouTube', description: 'Video monitoring and content tracking', icon: Play, status: 'disconnected', color: 'var(--accent-red)', lastSync: null, details: 'Not configured' },
]

const statusConfig = {
  connected: { label: 'Connected', color: 'text-[var(--accent-green)]', bg: 'bg-[var(--accent-green)]/10', dot: 'bg-[var(--accent-green)]' },
  disconnected: { label: 'Disconnected', color: 'text-[var(--text-muted)]', bg: 'bg-white/5', dot: 'bg-[var(--text-muted)]' },
  error: { label: 'Error', color: 'text-[var(--accent-red)]', bg: 'bg-[var(--accent-red)]/10', dot: 'bg-[var(--accent-red)]' },
}

export default function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const filtered = integrations.filter(i => {
    if (statusFilter && i.status !== statusFilter) return false
    if (searchQuery && !i.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const connected = integrations.filter(i => i.status === 'connected').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Integrations</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{connected} of {integrations.length} services connected</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)]/50"
          />
        </div>
        <div className="flex gap-1">
          {[null, 'connected', 'disconnected', 'error'].map(status => (
            <button
              key={status ?? 'all'}
              onClick={() => setStatusFilter(status)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs transition-colors capitalize',
                statusFilter === status
                  ? 'bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]'
                  : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              {status ?? 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(integration => {
          const status = statusConfig[integration.status]
          const Icon = integration.icon
          return (
            <div
              key={integration.id}
              className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-5 hover:border-[var(--accent-blue)]/20 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `color-mix(in srgb, ${integration.color} 15%, transparent)` }}
                  >
                    <Icon size={20} style={{ color: integration.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[var(--text-primary)]">{integration.name}</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{integration.description}</p>
                  </div>
                </div>
                <div className={cn('flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium', status.bg, status.color)}>
                  <div className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                  {status.label}
                </div>
              </div>

              <p className="text-xs text-[var(--text-secondary)] mb-4">{integration.details}</p>

              <div className="flex items-center justify-between">
                {integration.lastSync ? (
                  <span className="text-[10px] text-[var(--text-muted)]">
                    Last sync: {new Date(integration.lastSync).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                ) : (
                  <span className="text-[10px] text-[var(--text-muted)]">Never synced</span>
                )}
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-white/5 hover:bg-white/10 transition-colors">
                  <Settings size={12} />
                  Configure
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-8 text-center">
          <p className="text-sm text-[var(--text-muted)]">No integrations match your filters.</p>
        </div>
      )}
    </div>
  )
}
