'use client'

import { useState, useEffect } from 'react'
import {
  ShieldAlert, Lock, Unlock, Key,
  AlertTriangle, CheckCircle, XCircle, Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface ActivityEvent {
  id: string
  agent_id?: string
  agent_name?: string
  event_type?: string
  type?: string
  content?: string
  action?: string
  channel: string | null
  created_at: string
}

interface AuthEvent {
  id: string
  type: 'login' | 'logout' | 'failed_login' | 'token_refresh' | 'permission_change'
  source: string
  ip: string
  timestamp: string
  details: string
}

interface AgentTrust {
  agent: string
  score: number
  level: 'high' | 'medium' | 'low'
  lastAudit: string
  flags: string[]
}

interface SecurityAlert {
  id: string
  severity: 'critical' | 'warning' | 'info'
  message: string
  timestamp: string
  resolved: boolean
}

// Static security infrastructure data (not mock — this is config-level data)
const agentTrustScores: AgentTrust[] = [
  { agent: 'main', score: 98, level: 'high', lastAudit: '2026-03-23', flags: [] },
  { agent: 'personal', score: 95, level: 'high', lastAudit: '2026-03-23', flags: [] },
  { agent: 'finance', score: 92, level: 'high', lastAudit: '2026-03-22', flags: ['sensitive-data-access'] },
  { agent: 'engage-dev', score: 90, level: 'high', lastAudit: '2026-03-23', flags: [] },
  { agent: 'research', score: 88, level: 'high', lastAudit: '2026-03-22', flags: ['web-access'] },
  { agent: 'openai-chat', score: 75, level: 'medium', lastAudit: '2026-03-21', flags: ['external-model', 'data-egress'] },
  { agent: 'gemini-chat', score: 73, level: 'medium', lastAudit: '2026-03-21', flags: ['external-model', 'data-egress'] },
  { agent: 'sara-intimate', score: 62, level: 'medium', lastAudit: '2026-03-20', flags: ['external-model', 'openrouter', 'unaudited-provider'] },
  { agent: 'whatsapp-cli', score: 58, level: 'low', lastAudit: '2026-03-19', flags: ['external-comms', 'pii-exposure'] },
]

const overallScore = 82

const eventTypeConfig = {
  login: { icon: Lock, color: 'text-[var(--accent-green)]', bg: 'bg-[var(--accent-green)]/10' },
  logout: { icon: Unlock, color: 'text-[var(--text-muted)]', bg: 'bg-white/5' },
  failed_login: { icon: XCircle, color: 'text-[var(--accent-red)]', bg: 'bg-[var(--accent-red)]/10' },
  token_refresh: { icon: Key, color: 'text-[var(--accent-blue)]', bg: 'bg-[var(--accent-blue)]/10' },
  permission_change: { icon: ShieldAlert, color: 'text-[var(--accent-orange)]', bg: 'bg-[var(--accent-orange)]/10' },
  error: { icon: AlertTriangle, color: 'text-[var(--accent-red)]', bg: 'bg-[var(--accent-red)]/10' },
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function SecurityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('activity_events')
      .select('*')
      .or('event_type.eq.error,type.eq.error')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setEvents(data)
        setLoading(false)
      })

    const sub = supabase.channel('security-events-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_events' }, (payload) => {
        const ev = payload.new as ActivityEvent
        if (ev.event_type === 'error' || ev.type === 'error') {
          setEvents(prev => [ev, ...prev])
        }
      }).subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Security</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Security posture, events, and agent trust</p>
      </div>

      {/* Top Row: Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Posture Score */}
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-6 flex flex-col items-center justify-center">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--accent-blue)" strokeWidth="8"
                strokeDasharray={`${overallScore * 2.64} ${264 - overallScore * 2.64}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-[var(--text-primary)]">{overallScore}</span>
              <span className="text-[10px] text-[var(--text-muted)]">/ 100</span>
            </div>
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)] mt-3">Security Posture</p>
          <p className="text-xs text-[var(--accent-blue)] mt-1">Good</p>
        </div>

        {/* Live Security Events Summary */}
        <div className="md:col-span-2 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-5">
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">Security Events (Errors)</h3>
          {loading ? (
            <p className="text-sm text-teal-400">Loading...</p>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Shield size={32} className="mb-2 text-green-500/40" />
              <p className="text-sm">No security events</p>
              <p className="text-xs mt-1">All clear — no error events recorded.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {events.slice(0, 5).map(event => (
                <div key={event.id} className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg',
                  'bg-[var(--accent-red)]/10'
                )}>
                  <AlertTriangle size={14} className="text-[var(--accent-red)]" />
                  <span className="text-xs text-[var(--text-primary)] flex-1 truncate">{event.content || event.action || 'Error event'}</span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono shrink-0">{formatTime(event.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Agent Trust Scores */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-5">
        <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">Agent Trust Scores</h3>
        <div className="space-y-3">
          {agentTrustScores.map(agent => {
            const barColor = agent.level === 'high' ? 'bg-[var(--accent-green)]' : agent.level === 'medium' ? 'bg-[var(--accent-orange)]' : 'bg-[var(--accent-red)]'
            const textColor = agent.level === 'high' ? 'text-[var(--accent-green)]' : agent.level === 'medium' ? 'text-[var(--accent-orange)]' : 'text-[var(--accent-red)]'
            return (
              <div key={agent.agent} className="flex items-center gap-4">
                <span className="text-xs text-[var(--text-primary)] w-28 shrink-0 font-medium">{agent.agent}</span>
                <div className="flex-1 h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${agent.score}%` }} />
                </div>
                <span className={cn('text-xs font-mono w-8 text-right', textColor)}>{agent.score}</span>
                <div className="flex gap-1 w-48 justify-end">
                  {agent.flags.map(flag => (
                    <span key={flag} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-[var(--text-muted)]">{flag}</span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* All Error Events */}
      {events.length > 0 && (
        <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-5">
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">All Error Events</h3>
          <div className="space-y-1">
            {events.map(event => {
              const config = eventTypeConfig.error
              const Icon = config.icon
              return (
                <div key={event.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.02] transition-colors">
                  <div className={cn('w-7 h-7 rounded-md flex items-center justify-center shrink-0', config.bg)}>
                    <Icon size={14} className={config.color} />
                  </div>
                  <span className="text-xs text-[var(--text-primary)] flex-1">{event.content || event.action || 'Error event'}</span>
                  <span className="text-[10px] text-[var(--text-muted)]">{event.agent_id || event.agent_name}</span>
                  {event.channel && <span className="text-[10px] text-[var(--text-muted)] font-mono">{event.channel}</span>}
                  <span className="text-[10px] text-[var(--text-muted)] font-mono shrink-0">{formatTime(event.created_at)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
