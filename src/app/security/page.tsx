'use client'

import { useState } from 'react'
import {
  Shield, ShieldCheck, ShieldAlert, Lock, Unlock, Key,
  AlertTriangle, CheckCircle, XCircle, Clock, Search, Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

const authEvents: AuthEvent[] = [
  { id: '1', type: 'login', source: 'Dashboard', ip: '82.174.xx.xx', timestamp: '2026-03-23T14:30:00Z', details: 'Successful login via password' },
  { id: '2', type: 'token_refresh', source: 'Gateway', ip: '10.0.0.1', timestamp: '2026-03-23T14:15:00Z', details: 'Auto-refresh of gateway token' },
  { id: '3', type: 'failed_login', source: 'Dashboard', ip: '203.0.xx.xx', timestamp: '2026-03-23T13:45:00Z', details: 'Invalid password — 1 of 3 attempts' },
  { id: '4', type: 'permission_change', source: 'Admin', ip: '82.174.xx.xx', timestamp: '2026-03-23T12:00:00Z', details: 'Elevated research agent to read/write' },
  { id: '5', type: 'login', source: 'API', ip: '10.0.0.5', timestamp: '2026-03-23T11:30:00Z', details: 'Service account login for cron runner' },
  { id: '6', type: 'logout', source: 'Dashboard', ip: '82.174.xx.xx', timestamp: '2026-03-23T09:00:00Z', details: 'Manual logout' },
  { id: '7', type: 'token_refresh', source: 'Gateway', ip: '10.0.0.1', timestamp: '2026-03-23T08:15:00Z', details: 'Auto-refresh of gateway token' },
  { id: '8', type: 'failed_login', source: 'API', ip: '198.51.xx.xx', timestamp: '2026-03-22T23:10:00Z', details: 'Invalid API key' },
]

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

const securityAlerts: SecurityAlert[] = [
  { id: '1', severity: 'critical', message: 'ElevenLabs API key expired — integration degraded', timestamp: '2026-03-22T18:00:00Z', resolved: false },
  { id: '2', severity: 'warning', message: 'Failed login attempt from unknown IP 203.0.xx.xx', timestamp: '2026-03-23T13:45:00Z', resolved: false },
  { id: '3', severity: 'warning', message: 'whatsapp-cli agent trust score below 60', timestamp: '2026-03-23T10:00:00Z', resolved: false },
  { id: '4', severity: 'info', message: 'Gateway token auto-rotated successfully', timestamp: '2026-03-23T14:15:00Z', resolved: true },
  { id: '5', severity: 'info', message: 'Security audit completed for 9 agents', timestamp: '2026-03-23T06:00:00Z', resolved: true },
]

const eventTypeConfig = {
  login: { icon: Lock, color: 'text-[var(--accent-green)]', bg: 'bg-[var(--accent-green)]/10' },
  logout: { icon: Unlock, color: 'text-[var(--text-muted)]', bg: 'bg-white/5' },
  failed_login: { icon: XCircle, color: 'text-[var(--accent-red)]', bg: 'bg-[var(--accent-red)]/10' },
  token_refresh: { icon: Key, color: 'text-[var(--accent-blue)]', bg: 'bg-[var(--accent-blue)]/10' },
  permission_change: { icon: ShieldAlert, color: 'text-[var(--accent-orange)]', bg: 'bg-[var(--accent-orange)]/10' },
}

const overallScore = 82

function formatTime(timestamp: string) {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function SecurityPage() {
  const [eventFilter, setEventFilter] = useState<string | null>(null)

  const filteredEvents = authEvents.filter(e => {
    if (eventFilter && e.type !== eventFilter) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Security</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Security posture, auth events, and agent trust</p>
      </div>

      {/* Top Row: Score + Alerts */}
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

        {/* Alerts */}
        <div className="md:col-span-2 bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-5">
          <h3 className="text-sm font-medium text-[var(--text-primary)] mb-3">Active Alerts</h3>
          <div className="space-y-2">
            {securityAlerts.map(alert => {
              const severityConfig = {
                critical: { icon: XCircle, color: 'text-[var(--accent-red)]', bg: 'bg-[var(--accent-red)]/10' },
                warning: { icon: AlertTriangle, color: 'text-[var(--accent-orange)]', bg: 'bg-[var(--accent-orange)]/10' },
                info: { icon: CheckCircle, color: 'text-[var(--accent-blue)]', bg: 'bg-[var(--accent-blue)]/10' },
              }[alert.severity]
              const Icon = severityConfig.icon
              return (
                <div key={alert.id} className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg',
                  alert.resolved ? 'opacity-50' : '',
                  severityConfig.bg
                )}>
                  <Icon size={14} className={severityConfig.color} />
                  <span className="text-xs text-[var(--text-primary)] flex-1">{alert.message}</span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono shrink-0">{formatTime(alert.timestamp)}</span>
                  {alert.resolved && <span className="text-[10px] text-[var(--accent-green)]">Resolved</span>}
                </div>
              )
            })}
          </div>
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

      {/* Auth Events */}
      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-[var(--text-primary)]">Auth Events</h3>
          <div className="flex gap-1">
            {[null, 'login', 'logout', 'failed_login', 'token_refresh', 'permission_change'].map(type => (
              <button
                key={type ?? 'all'}
                onClick={() => setEventFilter(type)}
                className={cn(
                  'px-2 py-1 rounded-md text-[10px] transition-colors',
                  eventFilter === type
                    ? 'bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]'
                    : 'bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                )}
              >
                {type?.replace('_', ' ') ?? 'All'}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          {filteredEvents.map(event => {
            const config = eventTypeConfig[event.type]
            const Icon = config.icon
            return (
              <div key={event.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.02] transition-colors">
                <div className={cn('w-7 h-7 rounded-md flex items-center justify-center shrink-0', config.bg)}>
                  <Icon size={14} className={config.color} />
                </div>
                <span className="text-xs text-[var(--text-primary)] flex-1">{event.details}</span>
                <span className="text-[10px] text-[var(--text-muted)]">{event.source}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">{event.ip}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono shrink-0">{formatTime(event.timestamp)}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
