'use client'

import { useState } from 'react'
import { Activity } from '@/types'
import {
  MessageSquare, Terminal, AlertTriangle, ClipboardCheck, Server,
  Filter, Search
} from 'lucide-react'
import { cn } from '@/lib/utils'

const sampleActivities: (Activity & { agent_name: string })[] = [
  { id: '1', agent_id: '1', agent_name: 'main', type: 'message', content: 'Completed draft of weekly summary report for OpenClaw project status.', channel: 'DM', timestamp: '2026-03-23T14:32:00Z' },
  { id: '2', agent_id: '3', agent_name: 'engage-dev', type: 'tool_call', content: 'Executed build pipeline for ENGAGE frontend — all tests passed (47/47).', channel: '#engage-dev', timestamp: '2026-03-23T14:28:00Z' },
  { id: '3', agent_id: '2', agent_name: 'finance', type: 'message', content: 'Updated March expense forecast. Total projected spend: $2,340.', channel: '#finance', timestamp: '2026-03-23T14:15:00Z' },
  { id: '4', agent_id: '4', agent_name: 'research', type: 'task_update', content: 'Moved "Evaluate vector DB options" to Review.', channel: '#research', timestamp: '2026-03-23T13:58:00Z' },
  { id: '5', agent_id: '1', agent_name: 'main', type: 'error', content: 'Failed to connect to external API: gateway timeout after 30s.', channel: 'DM', timestamp: '2026-03-23T13:45:00Z' },
  { id: '6', agent_id: '3', agent_name: 'engage-dev', type: 'tool_call', content: 'Generated TypeScript types from OpenAPI spec (14 endpoints, 23 models).', channel: '#engage-dev', timestamp: '2026-03-23T13:30:00Z' },
  { id: '7', agent_id: '10', agent_name: 'general-work', type: 'system', content: 'Agent started and connected to gateway.', channel: null, timestamp: '2026-03-23T13:22:00Z' },
  { id: '8', agent_id: '2', agent_name: 'finance', type: 'message', content: 'Parsed 42 new transactions from bank CSV export.', channel: '#finance', timestamp: '2026-03-23T13:10:00Z' },
  { id: '9', agent_id: '4', agent_name: 'research', type: 'tool_call', content: 'Ran web search for "best practices embedding model fine-tuning 2026".', channel: '#research', timestamp: '2026-03-23T12:55:00Z' },
  { id: '10', agent_id: '1', agent_name: 'main', type: 'message', content: 'Scheduled 3 follow-up tasks based on morning review.', channel: 'DM', timestamp: '2026-03-23T12:40:00Z' },
  { id: '11', agent_id: '13', agent_name: 'whatsapp-cli', type: 'system', content: 'Agent disconnected — idle timeout.', channel: 'WhatsApp', timestamp: '2026-03-23T12:20:00Z' },
  { id: '12', agent_id: '3', agent_name: 'engage-dev', type: 'error', content: 'Lint failed: 2 errors in src/components/Dashboard.tsx.', channel: '#engage-dev', timestamp: '2026-03-23T12:05:00Z' },
  { id: '13', agent_id: '1', agent_name: 'main', type: 'task_update', content: 'Created task "Review Q1 metrics deck" and assigned to research agent.', channel: 'DM', timestamp: '2026-03-23T11:50:00Z' },
  { id: '14', agent_id: '6', agent_name: 'openai-chat', type: 'system', content: 'Agent started for model comparison benchmark.', channel: '#openai-chat', timestamp: '2026-03-23T11:30:00Z' },
  { id: '15', agent_id: '4', agent_name: 'research', type: 'message', content: 'Completed literature review on multi-agent orchestration patterns.', channel: '#research', timestamp: '2026-03-23T11:15:00Z' },
]

const typeConfig = {
  message: { icon: MessageSquare, label: 'Message', color: 'text-[var(--accent-blue)]', bg: 'bg-[var(--accent-blue)]/10' },
  tool_call: { icon: Terminal, label: 'Tool Call', color: 'text-[var(--accent-purple)]', bg: 'bg-[var(--accent-purple)]/10' },
  error: { icon: AlertTriangle, label: 'Error', color: 'text-[var(--accent-red)]', bg: 'bg-[var(--accent-red)]/10' },
  task_update: { icon: ClipboardCheck, label: 'Task Update', color: 'text-[var(--accent-green)]', bg: 'bg-[var(--accent-green)]/10' },
  system: { icon: Server, label: 'System', color: 'text-[var(--accent-orange)]', bg: 'bg-[var(--accent-orange)]/10' },
}

const allAgents = [...new Set(sampleActivities.map(a => a.agent_name))].sort()
const allTypes = Object.keys(typeConfig) as Activity['type'][]

function formatTime(timestamp: string) {
  const date = new Date(timestamp)
  const now = new Date('2026-03-23T15:00:00Z')
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  return `${diffHr}h ago`
}

export default function ActivityPage() {
  const [agentFilter, setAgentFilter] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<Activity['type'] | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filtered = sampleActivities.filter(a => {
    if (agentFilter && a.agent_name !== agentFilter) return false
    if (typeFilter && a.type !== typeFilter) return false
    if (searchQuery && !a.content.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Activity Feed</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Real-time stream of all agent actions</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <div className="w-2 h-2 rounded-full bg-[var(--accent-green)] animate-pulse" />
          Live
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-blue)]/50"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Agent filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[var(--text-muted)]" />
            <span className="text-xs text-[var(--text-muted)]">Agent:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setAgentFilter(null)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs transition-colors',
                  agentFilter === null
                    ? 'bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]'
                    : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                )}
              >
                All
              </button>
              {allAgents.map(agent => (
                <button
                  key={agent}
                  onClick={() => setAgentFilter(agentFilter === agent ? null : agent)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs transition-colors',
                    agentFilter === agent
                      ? 'bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]'
                      : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  )}
                >
                  {agent}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[var(--text-muted)]" />
          <span className="text-xs text-[var(--text-muted)]">Type:</span>
          <div className="flex gap-1">
            <button
              onClick={() => setTypeFilter(null)}
              className={cn(
                'px-2.5 py-1 rounded-md text-xs transition-colors',
                typeFilter === null
                  ? 'bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]'
                  : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              All
            </button>
            {allTypes.map(type => {
              const config = typeConfig[type]
              return (
                <button
                  key={type}
                  onClick={() => setTypeFilter(typeFilter === type ? null : type)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs transition-colors flex items-center gap-1',
                    typeFilter === type
                      ? `${config.bg} ${config.color}`
                      : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  )}
                >
                  <config.icon size={12} />
                  {config.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-8 text-center">
            <p className="text-sm text-[var(--text-muted)]">No activities match your filters.</p>
          </div>
        ) : (
          filtered.map(activity => {
            const config = typeConfig[activity.type]
            const Icon = config.icon
            return (
              <div
                key={activity.id}
                className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 hover:border-[var(--accent-blue)]/20 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Type Icon */}
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', config.bg)}>
                    <Icon size={16} className={config.color} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-[var(--text-primary)]">{activity.agent_name}</span>
                      <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium', config.bg, config.color)}>
                        {config.label}
                      </span>
                      {activity.channel && (
                        <span className="text-xs text-[var(--text-muted)]">{activity.channel}</span>
                      )}
                      <span className="ml-auto text-xs text-[var(--text-muted)] shrink-0 font-mono">
                        {formatTime(activity.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{activity.content}</p>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Count */}
      <p className="text-xs text-[var(--text-muted)] text-center">
        Showing {filtered.length} of {sampleActivities.length} activities
      </p>
    </div>
  )
}
