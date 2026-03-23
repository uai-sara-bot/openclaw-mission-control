'use client'

import { useState, useMemo } from 'react'
import { Agent } from '@/types'
import { Search, Circle } from 'lucide-react'

const agents: Agent[] = [
  { id: '1', name: 'main', model: 'Claude Opus', status: 'active', role: 'Primary Assistant', channel: 'DM', last_seen: new Date().toISOString(), token_usage_today: 45230, created_at: '2026-03-08' },
  { id: '2', name: 'finance', model: 'Claude Sonnet', status: 'active', role: 'Finance Tracker', channel: '#finance', last_seen: new Date().toISOString(), token_usage_today: 3200, created_at: '2026-03-23' },
  { id: '3', name: 'engage-dev', model: 'Claude Sonnet', status: 'idle', role: 'ENGAGE Project', channel: '#engage-dev', last_seen: new Date().toISOString(), token_usage_today: 18500, created_at: '2026-03-21' },
  { id: '4', name: 'research', model: 'Claude Sonnet', status: 'idle', role: 'Research Agent', channel: '#research', last_seen: new Date().toISOString(), token_usage_today: 8900, created_at: '2026-03-21' },
  { id: '5', name: 'personal', model: 'Claude Sonnet', status: 'idle', role: 'Personal Topics', channel: '#personal', last_seen: null, token_usage_today: 0, created_at: '2026-03-08' },
  { id: '6', name: 'openai-chat', model: 'GPT-5.4', status: 'offline', role: 'OpenAI Testing', channel: '#openai-chat', last_seen: null, token_usage_today: 0, created_at: '2026-03-08' },
  { id: '7', name: 'gemini-chat', model: 'Gemini', status: 'offline', role: 'Gemini Testing', channel: '#gemini-chat', last_seen: null, token_usage_today: 0, created_at: '2026-03-08' },
  { id: '8', name: 'anthropic-chat', model: 'Claude', status: 'offline', role: 'Anthropic Testing', channel: '#anthropic-chat', last_seen: null, token_usage_today: 0, created_at: '2026-03-08' },
  { id: '9', name: 'compare-llms', model: 'Various', status: 'offline', role: 'Model Comparison', channel: '#compare-llms', last_seen: null, token_usage_today: 0, created_at: '2026-03-08' },
  { id: '10', name: 'general-work', model: 'Claude Sonnet', status: 'offline', role: 'General Tasks', channel: '#general-work', last_seen: null, token_usage_today: 0, created_at: '2026-03-08' },
  { id: '11', name: 'qwen-chat', model: 'Qwen', status: 'offline', role: 'Qwen Testing', channel: '#qwen-chat', last_seen: null, token_usage_today: 0, created_at: '2026-03-08' },
  { id: '12', name: 'sara-intimate', model: 'OpenRouter', status: 'offline', role: 'Intimate Chat', channel: '#late-night', last_seen: null, token_usage_today: 0, created_at: '2026-03-08' },
  { id: '13', name: 'whatsapp-cli', model: 'Claude Sonnet', status: 'offline', role: 'WhatsApp Interface', channel: 'WhatsApp', last_seen: null, token_usage_today: 0, created_at: '2026-03-08' },
]

const statusFilters = ['All', 'Active', 'Idle', 'Offline'] as const
type StatusFilter = (typeof statusFilters)[number]

const statusConfig: Record<Agent['status'], { color: string; label: string }> = {
  active: { color: 'var(--accent-green)', label: 'Active' },
  idle: { color: 'var(--accent-orange)', label: 'Idle' },
  offline: { color: 'var(--text-muted)', label: 'Offline' },
  error: { color: 'var(--accent-red)', label: 'Error' },
}

function formatLastSeen(lastSeen: string | null): string {
  if (!lastSeen) return 'Never'
  const diff = Date.now() - new Date(lastSeen).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function AgentsPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('All')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return agents.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(search.toLowerCase())
      const matchesFilter = filter === 'All' || agent.status === filter.toLowerCase()
      return matchesSearch && matchesFilter
    })
  }, [search, filter])

  const counts = useMemo(() => ({
    All: agents.length,
    Active: agents.filter(a => a.status === 'active').length,
    Idle: agents.filter(a => a.status === 'idle').length,
    Offline: agents.filter(a => a.status === 'offline').length,
  }), [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Agents</h1>
        <span className="text-sm text-[var(--text-muted)]">{filtered.length} of {agents.length} agents</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search agents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)] transition-colors"
          />
        </div>

        {/* Status Filters */}
        <div className="flex gap-1 bg-[var(--bg-secondary)] rounded-lg p-1 border border-[var(--border)]">
          {statusFilters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                filter === f
                  ? 'bg-[var(--accent-blue)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {f} <span className="text-xs opacity-70">({counts[f]})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-4 py-3">Name</th>
              <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-4 py-3">Model</th>
              <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-4 py-3">Status</th>
              <th className="text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-4 py-3">Channel</th>
              <th className="text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-4 py-3">Tokens Today</th>
              <th className="text-right text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-4 py-3">Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(agent => {
              const sc = statusConfig[agent.status]
              const isSelected = selectedId === agent.id
              return (
                <tr
                  key={agent.id}
                  onClick={() => setSelectedId(isSelected ? null : agent.id)}
                  className={`border-b border-[var(--border)] last:border-b-0 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[var(--accent-blue)]/10'
                      : 'hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[var(--text-primary)]">{agent.name}</span>
                      <span className="text-xs text-[var(--text-muted)]">{agent.role}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-[var(--text-secondary)] font-mono">{agent.model}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Circle size={8} fill={sc.color} stroke={sc.color} />
                      <span className="text-sm" style={{ color: sc.color }}>{sc.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-[var(--text-secondary)]">{agent.channel}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-[var(--text-secondary)] font-mono">
                      {agent.token_usage_today > 0 ? agent.token_usage_today.toLocaleString() : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-[var(--text-muted)]">{formatLastSeen(agent.last_seen)}</span>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--text-muted)]">
                  No agents match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
