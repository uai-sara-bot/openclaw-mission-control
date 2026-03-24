'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import {
  MessageSquare, Terminal, AlertTriangle, ClipboardCheck, Server,
  Filter, Search
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityEvent {
  id: string
  agent_id?: string
  agent_name: string
  action?: string
  content?: string
  event_type?: string
  type?: string
  channel?: string | null
  created_at: string
}

const typeConfig: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  message: { icon: MessageSquare, label: 'Message', color: 'text-[var(--accent-blue)]', bg: 'bg-[var(--accent-blue)]/10' },
  tool_call: { icon: Terminal, label: 'Tool Call', color: 'text-[var(--accent-purple)]', bg: 'bg-[var(--accent-purple)]/10' },
  error: { icon: AlertTriangle, label: 'Error', color: 'text-[var(--accent-red)]', bg: 'bg-[var(--accent-red)]/10' },
  task_update: { icon: ClipboardCheck, label: 'Task Update', color: 'text-[var(--accent-green)]', bg: 'bg-[var(--accent-green)]/10' },
  system: { icon: Server, label: 'System', color: 'text-[var(--accent-orange)]', bg: 'bg-[var(--accent-orange)]/10' },
  info: { icon: MessageSquare, label: 'Info', color: 'text-[var(--accent-blue)]', bg: 'bg-[var(--accent-blue)]/10' },
}

function getTypeConfig(event: ActivityEvent) {
  const key = event.event_type || event.type || 'message'
  return typeConfig[key] || typeConfig.message
}

function getContent(event: ActivityEvent) {
  return event.content || event.action || ''
}

function getType(event: ActivityEvent) {
  return event.event_type || event.type || 'message'
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay}d ago`
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [agentFilter, setAgentFilter] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('activity_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) console.error('Activity fetch error:', error)
      if (data) setActivities(data)
      setLoading(false)
    }
    fetchData()

    const sub = supabase
      .channel('activity-feed-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_events' }, (payload) => {
        setActivities(prev => [payload.new as ActivityEvent, ...prev.slice(0, 199)])
      })
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [])

  const allAgents = [...new Set(activities.map(a => a.agent_name))].filter(Boolean).sort()
  const allTypes = [...new Set(activities.map(a => getType(a)))].filter(Boolean)

  const filtered = activities.filter(a => {
    if (agentFilter && a.agent_name !== agentFilter) return false
    if (typeFilter && getType(a) !== typeFilter) return false
    const content = getContent(a)
    if (searchQuery && !content.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-teal-400 animate-pulse">Loading activity...</div>
      </div>
    )
  }

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

        {allAgents.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-[var(--text-muted)]" />
            <span className="text-xs text-[var(--text-muted)]">Agent:</span>
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setAgentFilter(null)}
                className={cn('px-2.5 py-1 rounded-md text-xs transition-colors', agentFilter === null ? 'bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]' : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}
              >
                All
              </button>
              {allAgents.map(agent => (
                <button
                  key={agent}
                  onClick={() => setAgentFilter(agentFilter === agent ? null : agent)}
                  className={cn('px-2.5 py-1 rounded-md text-xs transition-colors', agentFilter === agent ? 'bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]' : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}
                >
                  {agent}
                </button>
              ))}
            </div>
          </div>
        )}

        {allTypes.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-[var(--text-muted)]" />
            <span className="text-xs text-[var(--text-muted)]">Type:</span>
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setTypeFilter(null)}
                className={cn('px-2.5 py-1 rounded-md text-xs transition-colors', typeFilter === null ? 'bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]' : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}
              >
                All
              </button>
              {allTypes.map(type => {
                const config = typeConfig[type] || typeConfig.message
                return (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(typeFilter === type ? null : type)}
                    className={cn('px-2.5 py-1 rounded-md text-xs transition-colors flex items-center gap-1', typeFilter === type ? `${config.bg} ${config.color}` : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}
                  >
                    <config.icon size={12} />
                    {config.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Activity List */}
      <div className="space-y-2">
        {activities.length === 0 ? (
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-12 text-center">
            <Server size={32} className="mx-auto text-[var(--text-muted)] mb-3 opacity-50" />
            <p className="text-sm text-[var(--text-muted)]">No activity yet.</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 opacity-60">Start using OpenClaw to see live updates here.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-8 text-center">
            <p className="text-sm text-[var(--text-muted)]">No activities match your filters.</p>
          </div>
        ) : (
          filtered.map(activity => {
            const config = getTypeConfig(activity)
            const Icon = config.icon
            const content = getContent(activity)
            return (
              <div key={activity.id} className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-4 hover:border-[var(--accent-blue)]/20 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', config.bg)}>
                    <Icon size={16} className={config.color} />
                  </div>
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
                        {formatTime(activity.created_at)}
                      </span>
                    </div>
                    {content && (
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{content}</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <p className="text-xs text-[var(--text-muted)] text-center">
        Showing {filtered.length} of {activities.length} activities
      </p>
    </div>
  )
}
